import json
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.copilot import CopilotSession, CopilotMessage, CopilotMemory, CopilotAction
from backend.app.services.intent_parser_service import IntentParserService
from backend.app.services.marketplace_search_agent import MarketplaceSearchAgent
from backend.app.services.fraud_analysis_agent import FraudAnalysisAgent
from backend.app.services.price_advisor_agent import PriceAdvisorAgent
from backend.app.services.comparison_agent import ComparisonAgent
from backend.app.services.ai_service import get_openai_client, AIService

class CopilotService:
    @staticmethod
    def create_session(db: Session, user_id: int, title: Optional[str] = None) -> CopilotSession:
        session = CopilotSession(user_id=user_id, title=title or f"Chat on {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}")
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_user_sessions(db: Session, user_id: int) -> List[CopilotSession]:
        return db.query(CopilotSession).filter(CopilotSession.user_id == user_id).order_by(CopilotSession.created_at.desc()).all()

    @staticmethod
    def get_session_messages(db: Session, session_id: int) -> List[CopilotMessage]:
        return db.query(CopilotMessage).filter(CopilotMessage.session_id == session_id).order_by(CopilotMessage.created_at.asc()).all()

    @staticmethod
    def get_user_memory(db: Session, user_id: int) -> Dict[str, str]:
        memories = db.query(CopilotMemory).filter(CopilotMemory.user_id == user_id).all()
        return {mem.key: mem.value for mem in memories}

    @staticmethod
    def save_memory(db: Session, user_id: int, key: str, value: str) -> CopilotMemory:
        memory = db.query(CopilotMemory).filter(CopilotMemory.user_id == user_id, CopilotMemory.key == key).first()
        if memory:
            memory.value = value
            memory.updated_at = datetime.utcnow()
        else:
            memory = CopilotMemory(user_id=user_id, key=key, value=value)
            db.add(memory)
        db.commit()
        db.refresh(memory)
        return memory

    @staticmethod
    def delete_session(db: Session, session_id: int):
        session = db.query(CopilotSession).filter(CopilotSession.id == session_id).first()
        if session:
            db.delete(session)
            db.commit()

    @staticmethod
    def clear_memory(db: Session, user_id: int):
        db.query(CopilotMemory).filter(CopilotMemory.user_id == user_id).delete()
        db.commit()

    @staticmethod
    def extract_and_update_memory(db: Session, user_id: int, query: str):
        """
        Parses search or conversation queries for parameters to populate
        the user's personalized marketplace profile memory.
        """
        # Rely on AIService query parser fallback/LLM parsing
        parsed = AIService.parse_search_query(query)
        
        if parsed.get("category"):
            CopilotService.save_memory(db, user_id, "category", parsed["category"])
        if parsed.get("location"):
            CopilotService.save_memory(db, user_id, "location", parsed["location"])
        if parsed.get("max_price"):
            CopilotService.save_memory(db, user_id, "budget", str(parsed["max_price"]))

    @staticmethod
    def process_query(db: Session, session_id: int, user_id: int, query: str) -> CopilotMessage:
        """
        Main orchestration endpoint:
        1. Classifies intent.
        2. Routes to sub-agent.
        3. Saves query memory.
        4. Synthesizes response (LLM or local rules).
        5. Saves discussion history.
        """
        # Save User Message
        user_msg = CopilotMessage(session_id=session_id, sender="user", content=query)
        db.add(user_msg)
        db.commit()

        # Update Session Memory Preferences
        CopilotService.extract_and_update_memory(db, user_id, query)

        # Retrieve User Context
        memory_profile = CopilotService.get_user_memory(db, user_id)
        
        # 1. Parse Intent
        intent = IntentParserService.parse_intent(query)
        
        # 2. Execute Sub-agent
        agent_data = {}
        action_type = "search"
        
        # Helper regex to parse listing IDs
        listing_ids = [int(x) for x in re.findall(r'\b(?:listing|id|item)?\s*#?(\d+)\b', query.lower())]
        
        if intent == "search":
            action_type = "search"
            # Leverage AIService parse query
            parsed = AIService.parse_search_query(query)
            # Merge with memory context if not specified in query
            cat = parsed.get("category") or memory_profile.get("category")
            loc = parsed.get("location") or memory_profile.get("location")
            max_p = parsed.get("max_price")
            if not max_p and memory_profile.get("budget"):
                try:
                    max_p = float(memory_profile["budget"])
                except ValueError:
                    pass
            
            results = MarketplaceSearchAgent.execute_search(
                db=db,
                query_string=parsed.get("query_string") or query,
                category=cat,
                location=loc,
                max_price=max_p
            )
            agent_data = {"filters": {"category": cat, "location": loc, "max_price": max_p}, "results": results[:5]}
            
        elif intent == "compare":
            action_type = "compare"
            # If no ids are found in the query, find the latest viewed listings or category listings
            if not listing_ids:
                # Find active listings in same category as user memory
                cat = memory_profile.get("category") or "Electronics"
                comp_listings = MarketplaceSearchAgent.execute_search(db=db, category=cat)
                listing_ids = [item["id"] for item in comp_listings[:2]]
                
            results = ComparisonAgent.compare_listings(db, listing_ids)
            agent_data = {"listing_ids": listing_ids, "comparison": results}
            
        elif intent == "safety":
            action_type = "fraud_analysis"
            target_lid = listing_ids[0] if listing_ids else None
            results = FraudAnalysisAgent.evaluate_risk(db, listing_id=target_lid, query_text=query)
            agent_data = {"target_listing_id": target_lid, "evaluation": results}
            
        elif intent == "price":
            action_type = "price_advisor"
            target_lid = listing_ids[0] if listing_ids else None
            cat = memory_profile.get("category")
            
            # Find category if not explicit
            if not target_lid and not cat:
                parsed = AIService.parse_search_query(query)
                cat = parsed.get("category")
                
            results = PriceAdvisorAgent.analyze_price(db, listing_id=target_lid, category=cat)
            agent_data = {"target_listing_id": target_lid, "category": cat, "analysis": results}
            
        elif intent == "negotiate":
            action_type = "negotiate"
            target_lid = listing_ids[0] if listing_ids else None
            strategy = "No active listing selected for negotiations. Mention a listing ID (e.g. Listing #1) to structure a strategy."
            
            if target_lid:
                # Retrieve price advice and fraud logs to draft strategy
                price_eval = PriceAdvisorAgent.analyze_price(db, listing_id=target_lid)
                safety_eval = FraudAnalysisAgent.evaluate_risk(db, listing_id=target_lid)
                
                status = price_eval.get("price_status", "Fair Price")
                risk = safety_eval.get("risk_rating", "Safe")
                diff = price_eval.get("difference_pct", 0)
                avg = price_eval.get("category_average", 0)
                item_price = price_eval.get("item_price", 0)
                
                if risk == "High Risk":
                    strategy = "ALERT: This listing has high fraud risks. We recommend AVOIDING this transaction completely. Do not share contact info or send deposits."
                elif status == "Overpriced":
                    strategy = (
                        f"This item is overpriced by {diff:.1f}% compared to average category listings (₹{avg:.0f} average vs. item ₹{item_price:.0f}). "
                        f"We suggest a counter-offer between ₹{price_eval.get('suggested_min', avg):.0f} and ₹{price_eval.get('suggested_max', avg):.0f}. "
                        "Highlight the market average in your discussion to negotiate down."
                    )
                elif status == "Underpriced":
                    strategy = (
                        f"This item is already priced lower than average. Be quick to make an offer. "
                        f"To close fast, offer ₹{item_price * 0.95:.0f} - ₹{item_price:.0f}. "
                        "Double check the item condition in person before releasing payment."
                    )
                else:
                    strategy = (
                        f"The price of ₹{item_price:.0f} is fair. You can try a small friendly discount offer (5% off at ₹{item_price * 0.95:.0f}). "
                        "Arrange a public meeting point and proceed with transaction."
                    )
                    
            agent_data = {"target_listing_id": target_lid, "strategy": strategy}

        # Log Action
        action_log = CopilotAction(
            session_id=session_id,
            action_type=action_type,
            action_data=json.dumps(agent_data)
        )
        db.add(action_log)
        db.commit()

        # 3. Response Synthesis
        assistant_content = ""
        client = get_openai_client()
        
        if client:
            try:
                # Build context for LLM
                history = CopilotService.get_session_messages(db, session_id)
                history_prompt = "\n".join([f"{msg.sender.upper()}: {msg.content}" for msg in history[:-1]])
                
                system_prompt = (
                    "You are SmartBazaar's AI Marketplace Copilot. Your job is to help users navigate listings, verify safety, compare items, and plan pricing/negotiations.\n"
                    "You have run a specialized backend agent to gather relevant data for the current query.\n"
                    f"User Memory Profile: {json.dumps(memory_profile)}\n"
                    f"Agent Execution Output: {json.dumps(agent_data)}\n"
                    "Instructions:\n"
                    "- Synthesize a clean, friendly response for the user.\n"
                    "- Summarize the findings clearly. Include helpful pricing/safety figures from the agent output.\n"
                    "- Keep your answer professional and directly address their intent.\n"
                    "- Use Markdown layout formatting (lists, bold text, bullet points)."
                )
                
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Dialogue history:\n{history_prompt}\n\nCurrent User Query: {query}"}
                ]
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    max_tokens=500,
                    temperature=0.7
                )
                assistant_content = response.choices[0].message.content.strip()
            except Exception:
                pass  # Fall back to local rules formatting

        # 4. Local fallback response formatting if LLM is blocked/unavailable
        if not assistant_content:
            if intent == "search":
                res_list = agent_data.get("results", [])
                if not res_list:
                    assistant_content = "I couldn't find any active listings matching your query. Try searching in another category or widening your budget limits!"
                else:
                    lines = ["Here are the top listings matching your search:\n"]
                    for idx, item in enumerate(res_list, start=1):
                        lines.append(f"{idx}. **{item['title']}** - ₹{item['price']} ({item['location']})")
                        lines.append(f"   *Seller Badge: {item['seller_badge']} (Trust: {item['seller_trust_score']}/100)*")
                        lines.append(f"   *Safety Scan: {item['fraud_level']} Risk*\n")
                    assistant_content = "\n".join(lines)
                    
            elif intent == "compare":
                comp = agent_data.get("comparison", {})
                listings = comp.get("listings", [])
                rec = comp.get("recommendation", "")
                if not listings:
                    assistant_content = "I couldn't locate details for the listings you wanted to compare. Please check the listing IDs."
                else:
                    lines = ["Here is a summary comparison between the items:\n"]
                    for item in listings:
                        lines.append(f"**Listing #{item['id']}: {item['title']}**")
                        lines.append(f"- **Price**: ₹{item['price']}")
                        lines.append(f"- **Pros**: {', '.join(item['pros'])}")
                        lines.append(f"- **Cons**: {', '.join(item['cons'])}")
                        lines.append(f"- **Seller Verification**: {item['seller_badge']}\n")
                    lines.append(f"**Recommendation**: {rec}")
                    assistant_content = "\n".join(lines)
                    
            elif intent == "safety":
                eval_res = agent_data.get("evaluation", {})
                rating = eval_res.get("risk_rating", "Unknown")
                score = eval_res.get("risk_score", 0.0)
                reasons = eval_res.get("reasons", [])
                advice = eval_res.get("advice", "")
                
                lines = [
                    f"### Safety Analysis: **{rating}** (Risk Score: {score:.0f}%)",
                    f"**Advice**: {advice}\n",
                    "**Key Factors Analyzed**:"
                ]
                for r in reasons:
                    lines.append(f"- {r}")
                assistant_content = "\n".join(lines)
                
            elif intent == "price":
                analysis = agent_data.get("analysis", {})
                status = analysis.get("price_status", "Info Only")
                item_price = analysis.get("item_price")
                avg = analysis.get("category_average", 0.0)
                diff = analysis.get("difference_pct", 0.0)
                advice = analysis.get("advice", "")
                
                lines = [f"### Price Advisor Report"]
                if item_price:
                    lines.append(f"- **Current Item Price**: ₹{item_price}")
                lines.append(f"- **Category Average Price**: ₹{avg:.2f}")
                if item_price:
                    lines.append(f"- **Difference**: {diff:+.1f}% compared to average")
                lines.append(f"- **Price Status**: **{status}**")
                lines.append(f"\n**Advice**: {advice}")
                assistant_content = "\n".join(lines)
                
            elif intent == "negotiate":
                strategy = agent_data.get("strategy", "")
                assistant_content = f"### Negotiation Strategy Advisor\n\n{strategy}"

        # Save Assistant Message
        assistant_msg = CopilotMessage(session_id=session_id, sender="assistant", content=assistant_content)
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)

        return assistant_msg
