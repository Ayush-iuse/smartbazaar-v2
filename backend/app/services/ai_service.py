import json
import logging
from typing import List, Tuple
from sqlalchemy.orm import Session
from openai import OpenAI, OpenAIError
from backend.app.config import settings

logger = logging.getLogger(__name__)

def get_openai_client() -> OpenAI:
    if settings.OPENAI_API_KEY:
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    return None

# List of predefined categories
CATEGORIES = ["Electronics", "Furniture", "Fashion", "Books", "Vehicles", "Others"]

# List of common scam indicators
SCAM_KEYWORDS = [
    "urgent transfer",
    "advance payment only",
    "western union",
    "100% safe guaranteed",
    "deposit first",
    "no escrow",
    "send money first",
    "moneygram",
    "shipping only",
]

def generate_description_fallback(title: str, keywords: List[str]) -> str:
    keyword_str = ", ".join(keywords) if keywords else "excellent features"
    return f"[AI Suggested] Up for sale is a high-quality {title}. Key highlights include: {keyword_str}. Perfect choice for local buyers looking for a great deal. Clean and ready for use."

def predict_category_fallback(title: str) -> str:
    title_lower = title.lower()
    if any(k in title_lower for k in ["phone", "laptop", "tv", "macbook", "iphone", "camera", "pixel"]):
        return "Electronics"
    if any(k in title_lower for k in ["table", "chair", "sofa", "bed", "desk", "wardrobe", "couch"]):
        return "Furniture"
    if any(k in title_lower for k in ["shirt", "shoes", "jeans", "dress", "watch", "jacket", "hoodie"]):
        return "Fashion"
    if any(k in title_lower for k in ["book", "novel", "textbook", "encyclopedia"]):
        return "Books"
    if any(k in title_lower for k in ["car", "bike", "cycle", "scooter", "motorcycle"]):
        return "Vehicles"
    return "Others"

def recommend_price_fallback(title: str, condition: str) -> Tuple[float, float]:
    category = predict_category_fallback(title)
    cond = condition.lower()
    
    if category == "Electronics":
        if "new" in cond:
            return 10000.0, 25000.0
        elif "used" in cond or "second" in cond:
            return 3000.0, 12000.0
        return 5000.0, 15000.0
    elif category == "Furniture":
        if "new" in cond:
            return 5000.0, 15000.0
        elif "used" in cond:
            return 1500.0, 6000.0
        return 2000.0, 8000.0
    elif category == "Fashion":
        if "new" in cond:
            return 1000.0, 3000.0
        elif "used" in cond:
            return 200.0, 800.0
        return 500.0, 1500.0
    elif category == "Vehicles":
        if "new" in cond:
            return 40000.0, 80000.0
        elif "used" in cond:
            return 15000.0, 35000.0
        return 2000.0, 45000.0
    else:
        if "new" in cond:
            return 2000.0, 5000.0
        return 500.0, 1500.0

def detect_fraud_fallback(title: str, description: str) -> Tuple[float, str, List[str]]:
    text = (title + " " + description).lower()
    flagged = []
    score = 5.0  # Base natural risk score
    
    for word in SCAM_KEYWORDS:
        if word in text:
            flagged.append(word)
            score += 30.0
            
    score = min(score, 100.0)
    if score >= 70.0:
        level = "High"
    elif score >= 30.0:
        level = "Medium"
    else:
        level = "Low"
        
    return score, level, flagged

class AIService:
    @staticmethod
    def generate_description(title: str, keywords: List[str]) -> Tuple[str, bool]:
        client = get_openai_client()
        if not client:
            return generate_description_fallback(title, keywords), True
        try:
            prompt = f"Write a professional 2-3 sentence product listing description for a '{title}' emphasizing keywords: {', '.join(keywords)}."
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant assisting sellers on a marketplace."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                temperature=0.7
            )
            desc = response.choices[0].message.content.strip()
            if not desc.startswith("[AI Suggested]"):
                desc = f"[AI Suggested] {desc}"
            return desc, False
        except Exception as e:
            logger.warning(f"OpenAI error in generate_description, falling back: {e}")
            return generate_description_fallback(title, keywords), True

    @staticmethod
    def predict_category(title: str) -> Tuple[str, bool]:
        client = get_openai_client()
        if not client:
            return predict_category_fallback(title), True
        try:
            prompt = f"Predict the best category for '{title}'. Predefined categories: {', '.join(CATEGORIES)}. Return ONLY the category name exactly as listed with no other words."
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You output only one category word."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=10,
                temperature=0.0
            )
            cat = response.choices[0].message.content.strip()
            if cat in CATEGORIES:
                return cat, False
            return predict_category_fallback(title), True
        except Exception as e:
            logger.warning(f"OpenAI error in predict_category, falling back: {e}")
            return predict_category_fallback(title), True

    @staticmethod
    def recommend_price(title: str, condition: str) -> Tuple[float, float, bool]:
        client = get_openai_client()
        if not client:
            low, high = recommend_price_fallback(title, condition)
            return low, high, True
        try:
            prompt = (
                f"Estimate the market price range in INR for a '{title}' in '{condition}' condition. "
                "Output JSON format exactly like: {\"min\": 1000, \"max\": 5000}. No other text."
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You output valid JSON ranges only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=30,
                temperature=0.2
            )
            content = response.choices[0].message.content.strip()
            # Clean possible code fencing
            if content.startswith("```"):
                content = content.split("```")[1].strip()
                if content.startswith("json"):
                    content = content[4:].strip()
            data = json.loads(content)
            return float(data["min"]), float(data["max"]), False
        except Exception as e:
            logger.warning(f"OpenAI error in recommend_price, falling back: {e}")
            low, high = recommend_price_fallback(title, condition)
            return low, high, True

    @staticmethod
    def detect_fraud(title: str, description: str) -> Tuple[float, str, List[str], bool]:
        client = get_openai_client()
        if not client:
            score, level, flagged = detect_fraud_fallback(title, description)
            return score, level, flagged, True
        try:
            # Let the AI check listing for scam content in addition to keyword match
            prompt = (
                f"Scan this listing for fraud or scam risk. Title: '{title}', Description: '{description}'. "
                "Identify if it requests direct transfer, suspicious details, etc. "
                "Output JSON format exactly like: "
                "{\"score\": 45.0, \"level\": \"Medium\", \"flagged_phrases\": [\"phrase1\"]}. No other text."
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You output valid fraud report JSON only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=80,
                temperature=0.2
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1].strip()
                if content.startswith("json"):
                    content = content[4:].strip()
            data = json.loads(content)
            
            # Double check with static keyword scanner to make sure standard rules are enforced
            static_score, static_level, static_flagged = detect_fraud_fallback(title, description)
            
            # Combine scores safely
            ai_score = float(data.get("score", 0.0))
            score = max(ai_score, static_score)
            flagged = list(set(data.get("flagged_phrases", []) + static_flagged))
            
            if score >= 70.0:
                level = "High"
            elif score >= 30.0:
                level = "Medium"
            else:
                level = "Low"
                
            return score, level, flagged, False
        except Exception as e:
            logger.warning(f"OpenAI error in detect_fraud, falling back: {e}")
            score, level, flagged = detect_fraud_fallback(title, description)
            return score, level, flagged, True

    @staticmethod
    def copilot_analyze(db: Session, title: str, description: str, price: float, category: str, location: str, condition: str, image_count: int) -> dict:
        from backend.app.models.listing import Listing

        # 1. Run local rules analysis first as basis and fallback
        # Count same category & location listings for competition
        competition_count = 0
        if db:
            try:
                competition_count = db.query(Listing).filter(
                    Listing.category == category,
                    Listing.location == location
                ).count()
            except Exception as e:
                logger.error(f"Error querying competition count: {e}")
        
        if competition_count == 0:
            competition_score = 20
            competition_level = "Low"
        elif competition_count <= 2:
            competition_score = 50
            competition_level = "Medium"
        else:
            competition_score = 80
            competition_level = "High"

        # Calculate Title Score
        title_score = 100
        if len(title) < 10:
            title_score -= 30
        if len(title) > 50:
            title_score -= 10
        if len(title.split()) < 3:
            title_score -= 20
        title_score = max(title_score, 0)

        # Calculate Description Score
        desc_score = 100
        desc_len = len(description) if description else 0
        if desc_len < 30:
            desc_score -= 40
        elif desc_len < 100:
            desc_score -= 15
        
        # Check details
        desc_lower = description.lower() if description else ""
        if not condition or condition.lower() not in desc_lower:
            desc_score -= 10
        if not any(k in desc_lower for k in ["age", "year", "month", "old"]):
            desc_score -= 5
        if not any(k in desc_lower for k in ["warranty", "guarantee"]):
            desc_score -= 5
        desc_score = max(desc_score, 0)

        # Calculate Price Score using static pricing service recommendation
        price_rec_low, price_rec_high, _ = AIService.recommend_price(title, condition)
        price_score = 100
        price_status = "Fair"
        if price < price_rec_low:
            price_score = 90
            price_status = "Underpriced"
        elif price > price_rec_high:
            pct_over = ((price - price_rec_high) / price_rec_high) * 100
            price_status = "Slightly High" if pct_over <= 20 else "Overpriced"
            if pct_over > 20:
                price_score = 40
            else:
                price_score = 70

        # Calculate Image Score
        if image_count == 0:
            image_score = 0
        elif image_count == 1:
            image_score = 50
        elif image_count == 2:
            image_score = 75
        else:
            image_score = 100

        # Fraud Penalty
        fraud_score, fraud_level, _, _ = AIService.detect_fraud(title, description or "")
        fraud_penalty = 0
        if fraud_level == "High":
            fraud_penalty = 30
        elif fraud_level == "Medium":
            fraud_penalty = 15

        # Weighted final Listing Score
        listing_score = int((title_score * 0.2) + (desc_score * 0.3) + (price_score * 0.3) + (image_score * 0.2) - fraud_penalty)
        listing_score = max(min(listing_score, 100), 0)

        # Sale Probability
        sale_probability = int((listing_score * 0.6) + ((100 - competition_score) * 0.4))
        sale_probability = max(min(sale_probability, 100), 0)

        # Expected sell time
        if sale_probability >= 80:
            expected_sell_time = "1-3 Days"
        elif sale_probability >= 60:
            expected_sell_time = "4-7 Days"
        elif sale_probability >= 40:
            expected_sell_time = "1-2 Weeks"
        else:
            expected_sell_time = "2+ Weeks"

        # Generate recommendations
        recommendations = []
        if len(title) < 10:
            recommendations.append("Improve title: make it more descriptive (at least 10 characters)")
        if desc_len < 50:
            recommendations.append("Add more details: expand product description for potential buyers")
        if not condition or condition.lower() not in desc_lower:
            recommendations.append("Mention product condition in description (e.g. brand new, gently used)")
        if image_count < 3:
            recommendations.append(f"Upload {3 - image_count} more image(s) to attract more interest")
        if price_status in ["Slightly High", "Overpriced"]:
            recommendations.append("Adjust pricing: lower price by 5-10% to match local category averages")
        if fraud_penalty > 0:
            recommendations.append("Remove suspicious/payment-only links from description text")
        if not recommendations:
            recommendations.append("Your listing looks great! Ready to publish.")

        local_analysis = {
            "listing_score": listing_score,
            "sale_probability": sale_probability,
            "competition_score": competition_score,
            "price_score": price_score,
            "description_score": desc_score,
            "trust_impact": 100 - fraud_penalty,
            "expected_sell_time": expected_sell_time,
            "recommendations": recommendations,
            "is_fallback": True
        }

        # 2. Call OpenAI API if client exists
        client = get_openai_client()
        if not client:
            return local_analysis
            
        try:
            prompt = (
                f"Evaluate this product listing for the marketplace. "
                f"Title: '{title}', Description: '{description}', Price: INR {price}, Category: '{category}', Location: '{location}', Condition: '{condition}', Images: {image_count}. "
                f"Reference local averages: Competition Level: {competition_level}, Estimated price bounds: {price_rec_low} to {price_rec_high} INR. "
                f"Provide a creative evaluation with exact score metrics matching this JSON format exactly:\n"
                "{\n"
                "  \"listing_score\": 88,\n"
                "  \"sale_probability\": 76,\n"
                "  \"competition_score\": 63,\n"
                "  \"price_score\": 90,\n"
                "  \"description_score\": 85,\n"
                "  \"trust_impact\": 78,\n"
                "  \"expected_sell_time\": \"4-7 Days\",\n"
                "  \"recommendations\": [\"rec1\"]\n"
                "}\n"
                "No other text."
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a pricing and product evaluation assistant. You output valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=250,
                temperature=0.2
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1].strip()
                if content.startswith("json"):
                    content = content[4:].strip()
            ai_analysis = json.loads(content)
            ai_analysis["listing_score"] = int(ai_analysis.get("listing_score", listing_score))
            ai_analysis["sale_probability"] = int(ai_analysis.get("sale_probability", sale_probability))
            ai_analysis["competition_score"] = int(ai_analysis.get("competition_score", competition_score))
            ai_analysis["price_score"] = int(ai_analysis.get("price_score", price_score))
            ai_analysis["description_score"] = int(ai_analysis.get("description_score", desc_score))
            ai_analysis["trust_impact"] = int(ai_analysis.get("trust_impact", 100 - fraud_penalty))
            ai_analysis["expected_sell_time"] = str(ai_analysis.get("expected_sell_time", expected_sell_time))
            ai_analysis["recommendations"] = list(ai_analysis.get("recommendations", recommendations))
            ai_analysis["is_fallback"] = False
            return ai_analysis
        except Exception as e:
            logger.warning(f"OpenAI error in copilot_analyze, falling back: {e}")
            return local_analysis

    @staticmethod
    def buyer_agent_analyze(db: Session, listing_id: int) -> dict:
        from backend.app.models.listing import Listing
        from backend.app.services.trust_service import TrustService
        from backend.app.models.listing_score import ListingScore

        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            return {
                "advice": "AVOID",
                "pros": [],
                "cons": ["Listing not found"],
                "suggested_min": 0.0,
                "suggested_max": 0.0,
                "risk_level": "High",
                "explanation": "This listing does not exist in the database.",
                "is_fallback": True
            }

        # 1. Fetch recommended price bounds
        condition = "New"
        desc_lower = (listing.description or "").lower()
        if "like new" in desc_lower or "mint" in desc_lower:
            condition = "Like New"
        elif "good" in desc_lower or "great" in desc_lower:
            condition = "Good"
        elif "used" in desc_lower or "second" in desc_lower:
            condition = "Used"
            
        suggested_min, suggested_max, _ = AIService.recommend_price(listing.title, condition)
        
        # 2. Risk Analyzer (listings fraud score and trust score)
        fraud_score = listing.fraud_score
        fraud_level = listing.fraud_level
        
        # Calculate seller trust score
        trust_details = TrustService.get_seller_score_precalculated(db, listing.seller_id)
        trust_score = trust_details["trust_score"]
        trust_level = trust_details["level"]

        # 3. Pros and Cons Generator
        pros = []
        cons = []
        
        # Pricing pros/cons
        if listing.price < suggested_min:
            pros.append("Priced below average market valuation (Great deal!)")
        elif listing.price <= suggested_max:
            pros.append("Priced fairly within estimated market range")
        else:
            cons.append("Priced above average category market value")
            
        # Seller pros/cons
        if trust_level == "Trusted Seller":
            pros.append("Offered by a highly Trusted Seller with great history")
        elif trust_level == "Verified Seller":
            pros.append("Offered by a Verified Seller")
        else:
            cons.append("Offered by a New Seller with unverified history")
            
        # Quality pros/cons
        score_rec = db.query(ListingScore).filter(ListingScore.listing_id == listing.id).first()
        if score_rec:
            if score_rec.listing_score >= 80:
                pros.append("Excellent listing quality and complete description details")
            elif score_rec.listing_score < 50:
                cons.append("Low listing quality or sparse description details")
        else:
            if len(listing.description or "") < 30:
                cons.append("Extremely short description detail")
                
        # Fraud risk
        if fraud_level == "High":
            cons.append("HIGH RISK: Contains phrases flagged as potential scams")
        elif fraud_level == "Medium":
            cons.append("Medium Risk: Static analysis flagged minor irregularities")

        # 4. BUY NEGOTIATE AVOID Engine
        if fraud_level == "High" or fraud_score >= 50 or trust_score < 30:
            advice = "AVOID"
        elif listing.price > suggested_max:
            advice = "NEGOTIATE"
        elif fraud_level == "Low" and listing.price <= suggested_max and (trust_level in ["Trusted Seller", "Verified Seller"]):
            advice = "BUY"
        else:
            if listing.price > suggested_max:
                advice = "NEGOTIATE"
            else:
                advice = "BUY"

        # Construct local explanation template
        if advice == "AVOID":
            explanation = f"We highly recommend avoiding this listing. The safety scan indicated a high fraud risk ({fraud_score:.0f}%) or the seller has a very low trust score ({trust_score}/100). Exercise extreme caution."
        elif advice == "NEGOTIATE":
            explanation = f"This item is in good standing but priced slightly high (INR {listing.price} vs market range INR {suggested_min:.0f}-{suggested_max:.0f}). You should contact the seller to negotiate a fairer price."
        else:
            explanation = f"This is a great listing! The pricing is fair for its condition, and the seller has a solid trust score of {trust_score}/100. It is safe to proceed with standard local meetup rules."

        local_report = {
            "advice": advice,
            "pros": pros,
            "cons": cons,
            "suggested_min": suggested_min,
            "suggested_max": suggested_max,
            "risk_level": fraud_level,
            "explanation": explanation,
            "is_fallback": True
        }

        # 5. Call OpenAI for conversational explainability if available
        client = get_openai_client()
        if not client:
            return local_report
            
        try:
            prompt = (
                f"Act as a Buyer Advisor for a local P2P marketplace. "
                f"Analyze this listing details: Title: '{listing.title}', Price: INR {listing.price}, Location: '{listing.location}', Fraud Risk Score: {fraud_score}%, Seller Trust Score: {trust_score}/100. "
                f"Market range estimate: INR {suggested_min} to {suggested_max}. "
                f"Current Advice decision: {advice}. Pros found: {pros}. Cons found: {cons}. "
                f"Write a friendly 2-3 sentence explainability text answering 'Should I Buy This?'. "
                f"Output exactly in this JSON format:\n"
                "{\n"
                "  \"advice\": \"BUY\",\n"
                "  \"pros\": [\"pro1\"],\n"
                "  \"cons\": [\"con1\"],\n"
                "  \"suggested_min\": 1000.0,\n"
                "  \"suggested_max\": 5000.0,\n"
                "  \"risk_level\": \"Low\",\n"
                "  \"explanation\": \"Your conversational summary here.\"\n"
                "}\n"
                "No other text."
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a buyer advisor assistant. Output valid JSON matching the exact request format only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=250,
                temperature=0.2
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1].strip()
                if content.startswith("json"):
                    content = content[4:].strip()
            ai_data = json.loads(content)
            ai_data["is_fallback"] = False
            return ai_data
        except Exception as e:
            logger.warning(f"OpenAI error in buyer_agent_analyze, falling back: {e}")
            return local_report

    @staticmethod
    def parse_search_query(query: str) -> dict:
        import re
        
        # Default parsed fields
        result = {
            "query_string": query,
            "category": None,
            "location": None,
            "max_price": None,
            "keywords": [],
            "intent": "general_search"
        }
        
        if not query:
            return result
            
        query_lower = query.lower()
        
        # 1. Parse max price (matches: under 25000, under rs. 25000, max 25000, below 25000, etc)
        price_match = re.search(r'(?:under|below|less than|max|maximum|rs\.?|₹)\s*(\d+)', query_lower)
        if price_match:
            result["max_price"] = float(price_match.group(1))
            query_lower = query_lower.replace(price_match.group(0), "")
            
        # 2. Parse location (matches: in Pune, in Mumbai, in Connaught Place)
        loc_match = re.search(r'\bin\s+([a-zA-Z\s]+?)(?:\s+(?:under|below|less|for)|$)', query_lower)
        if loc_match:
            loc = loc_match.group(1).strip()
            # Prevent matching category words
            if loc not in ["electronics", "furniture", "fashion", "books", "vehicles", "others"]:
                result["location"] = loc.title()
                query_lower = query_lower.replace(loc_match.group(0), "")

        # 3. Guess Category & Keywords using local rule-based fallbacks
        clean_text = re.sub(r'\s+', ' ', query_lower).strip()
        words = clean_text.split()
        
        category = predict_category_fallback(clean_text)
        if category and category != "Others":
            result["category"] = category
            
        result["keywords"] = [w for w in words if len(w) > 2 and w not in ["for", "and", "the", "with"]]
        
        if category == "Electronics":
            result["intent"] = "buy_electronics"
        elif category == "Furniture":
            result["intent"] = "buy_furniture"
        elif category == "Fashion":
            result["intent"] = "buy_fashion"
        elif category == "Vehicles":
            result["intent"] = "buy_vehicles"
        elif category == "Books":
            result["intent"] = "buy_books"
            
        # 4. Optional OpenAI NLP refinement
        client = get_openai_client()
        if not client:
            return result
            
        try:
            prompt = (
                f"Parse this marketplace search query: '{query}'. "
                f"Extract search parameters in JSON format matching this exact layout:\n"
                "{\n"
                "  \"category\": \"Electronics\",\n"
                "  \"location\": \"Pune\",\n"
                "  \"max_price\": 25000.0,\n"
                "  \"keywords\": [\"laptop\"],\n"
                "  \"intent\": \"buy_electronics\"\n"
                "}\n"
                "Output null for any unfound parameter. No other text."
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a search query parser. Output valid JSON matching the schema only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.0
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1].strip()
                if content.startswith("json"):
                    content = content[4:].strip()
            ai_result = json.loads(content)
            
            if ai_result.get("category"):
                result["category"] = ai_result["category"]
            if ai_result.get("location"):
                result["location"] = ai_result["location"]
            if ai_result.get("max_price"):
                result["max_price"] = float(ai_result["max_price"])
            if ai_result.get("keywords"):
                result["keywords"] = ai_result["keywords"]
            if ai_result.get("intent"):
                result["intent"] = ai_result["intent"]
        except Exception as e:
            logger.warning(f"OpenAI error in parse_search_query, falling back: {e}")
            
        return result

    @staticmethod
    def chat_assistant_analyze(db: Session, conversation_id: int, query: str = "") -> dict:
        from backend.app.models.message import Message
        
        # 1. Fetch message history
        messages = []
        if db:
            try:
                messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.id.desc()).limit(5).all()
                messages.reverse()
            except Exception as e:
                logger.error(f"Error querying message history: {e}")
        
        # 2. Extract conversation texts
        chat_history = ""
        last_msg_content = ""
        for m in messages:
            sender_label = "Sender" if m.sender_id else "Recipient"
            chat_history += f"{sender_label}: {m.content}\n"
            if m.content:
                last_msg_content = m.content

        # Fallback values
        reply_suggestions = [
            "Hi, is this item still available?",
            "Can we negotiate the price?",
            "Where can we meet for the pickup?",
            "Yes, the item is clean and available!"
        ]
        
        translation = last_msg_content
        scam_detected = False
        urgency_level = "Low"
        intent = "General inquiry"
        next_action = "Acknowledge the message and propose meeting spot."

        # Quick local scans
        text_lower = last_msg_content.lower()
        if any(w in text_lower for w in SCAM_KEYWORDS):
            scam_detected = True
        
        if any(w in text_lower for w in ["urgent", "today", "now", "fast", "hurry"]):
            urgency_level = "High"
            reply_suggestions = [
                "I am available to meet today!",
                "Can you share your location so we can wrap this up?",
                "Okay, let me send the coordinates."
            ]
        
        if any(w in text_lower for w in ["price", "discount", "cheap", "offer", "negotiate"]):
            intent = "Price negotiation"
            reply_suggestions = [
                "I can offer a 10% discount.",
                "How about we split the difference?",
                "What is your best price?"
            ]

        result = {
            "reply_suggestions": reply_suggestions,
            "translation": translation,
            "scam_detected": scam_detected,
            "urgency_level": urgency_level,
            "intent": intent,
            "next_action": next_action,
            "is_fallback": True
        }

        # 3. Optional OpenAI chat analysis
        client = get_openai_client()
        if not client:
            return result

        try:
            prompt = (
                f"Analyze this marketplace P2P chat history:\n{chat_history}\n"
                "Return a JSON analysis object with these exact keys:\n"
                "{\n"
                "  \"reply_suggestions\": [\"option1\", \"option2\", \"option3\"],\n"
                "  \"translation\": \"Translated text or empty if already English\",\n"
                "  \"scam_detected\": false,\n"
                "  \"urgency_level\": \"High/Medium/Low\",\n"
                "  \"intent\": \"Brief description of sender's goal\",\n"
                "  \"next_action\": \"Recommended action\"\n"
                "}"
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a smart marketplace deal closing assistant. Output valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=250,
                temperature=0.3
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1].strip()
                if content.startswith("json"):
                    content = content[4:].strip()
            ai_data = json.loads(content)
            
            return {
                "reply_suggestions": ai_data.get("reply_suggestions", reply_suggestions),
                "translation": ai_data.get("translation", translation) or translation,
                "scam_detected": bool(ai_data.get("scam_detected", scam_detected)),
                "urgency_level": ai_data.get("urgency_level", urgency_level),
                "intent": ai_data.get("intent", intent),
                "next_action": ai_data.get("next_action", next_action),
                "is_fallback": False
            }
        except Exception as e:
            logger.warning(f"OpenAI error in chat_assistant_analyze: {e}")
            return result
