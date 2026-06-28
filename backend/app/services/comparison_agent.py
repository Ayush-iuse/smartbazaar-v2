import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.listing import Listing
from backend.app.services.trust_service import TrustService
from backend.app.services.ai_service import get_openai_client

class ComparisonAgent:
    @staticmethod
    def compare_listings(db: Session, listing_ids: List[int]) -> Dict[str, Any]:
        """
        Retrieves, analyzes, and compares multiple listings to advise buyers on pros,
        cons, safety differences, and value recommendations.
        """
        if not listing_ids:
            return {"listings": [], "recommendation": "No listings provided for comparison.", "is_fallback": True}

        # 1. Fetch listing details from database
        listings_data = []
        for lid in listing_ids[:3]:  # Limit to comparing maximum 3 items
            listing = db.query(Listing).filter(Listing.id == lid).first()
            if not listing:
                continue
                
            trust_details = TrustService.get_seller_score_precalculated(db, listing.seller_id)
            trust_score = trust_details.get("trust_score", 0)
            seller_badge = trust_details.get("level", "New Seller")
            
            # Count images
            try:
                images = json.loads(listing.image_urls or "[]")
                image_count = len(images) if isinstance(images, list) else 0
            except Exception:
                image_count = 0

            listings_data.append({
                "id": listing.id,
                "title": listing.title,
                "description": listing.description or "",
                "price": listing.price,
                "category": listing.category,
                "location": listing.location,
                "seller_id": listing.seller_id,
                "seller_trust_score": trust_score,
                "seller_badge": seller_badge,
                "fraud_level": listing.fraud_level,
                "fraud_score": listing.fraud_score,
                "image_count": image_count
            })

        if not listings_data:
            return {"listings": [], "recommendation": "Listings not found.", "is_fallback": True}

        # 2. Local Fallback Comparison Engine
        # Calculate pros, cons, and assign tags
        cheapest_item = min(listings_data, key=lambda x: x["price"])
        best_trust_item = max(listings_data, key=lambda x: x["seller_trust_score"])
        
        for item in listings_data:
            item["pros"] = []
            item["cons"] = []
            
            # Cheaper comparison
            if item["id"] == cheapest_item["id"]:
                item["pros"].append("Lowest price among compared items.")
                
            # Trust comparison
            if item["id"] == best_trust_item["id"] and item["seller_trust_score"] > 50:
                item["pros"].append(f"Offered by seller with highest trust score ({item['seller_trust_score']}/100).")
            elif item["seller_trust_score"] < 30:
                item["cons"].append(f"Low seller trust score ({item['seller_trust_score']}/100).")

            # Risk/Fraud check
            if item["fraud_level"] == "High":
                item["cons"].append("HIGH RISK indicators flagged in safety scan.")
            elif item["fraud_level"] == "Medium":
                item["cons"].append("Moderate security flags on listing content.")
            else:
                item["pros"].append("Safety scan cleared: low risk.")

            # Image check
            if item["image_count"] >= 3:
                item["pros"].append("Includes multiple listing photos.")
            elif item["image_count"] == 0:
                item["cons"].append("No listing images uploaded.")

        # Determine overall recommend listing
        recommendation_text = ""
        safest = [i for i in listings_data if i["fraud_level"] == "Low"]
        if safest:
            best_value = min(safest, key=lambda x: x["price"])
            recommendation_text = f"We recommend Listing #{best_value['id']} ('{best_value['title']}') as it offers the best value with a low risk rating and a price of ₹{best_value['price']}."
        else:
            recommendation_text = f"Compare listings carefully. Listing #{cheapest_item['id']} has the lowest price of ₹{cheapest_item['price']}, while Listing #{best_trust_item['id']} is sold by the most trusted seller."

        local_comparison = {
            "listings": listings_data,
            "recommendation": recommendation_text,
            "is_fallback": True
        }

        # 3. Apply LLM refiner if OpenAI is available
        client = get_openai_client()
        if not client:
            return local_comparison

        try:
            prompt = (
                f"Analyze and compare the following marketplace items. Highlight key tradeoffs (price, seller reliability, safety risk metrics) "
                f"and write a concise conclusion recommendation.\n"
                f"Listings Data: {json.dumps(listings_data)}\n"
                f"Output your evaluation matching this JSON format exactly:\n"
                "{\n"
                "  \"listings\": [\n"
                "    {\n"
                "      \"id\": 1,\n"
                "      \"title\": \"Title\",\n"
                "      \"price\": 1000,\n"
                "      \"pros\": [\"pro1\"],\n"
                "      \"cons\": [\"con1\"]\n"
                "    }\n"
                "  ],\n"
                "  \"recommendation\": \"Summary recommendation text here.\"\n"
                "}\n"
                "No other text."
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a comparison expert assistant. Output valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.2
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1].strip()
                if content.startswith("json"):
                    content = content[4:].strip()
            ai_data = json.loads(content)
            
            # Map back fields that might have been ignored
            for ai_item in ai_data.get("listings", []):
                matching = next((i for i in listings_data if i["id"] == ai_item["id"]), None)
                if matching:
                    matching["pros"] = ai_item.get("pros", matching["pros"])
                    matching["cons"] = ai_item.get("cons", matching["cons"])
            
            return {
                "listings": listings_data,
                "recommendation": ai_data.get("recommendation", recommendation_text),
                "is_fallback": False
            }
        except Exception:
            return local_comparison
