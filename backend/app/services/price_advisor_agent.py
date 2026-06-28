from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from backend.app.models.listing import Listing
from backend.app.services.ai_service import AIService

class PriceAdvisorAgent:
    @staticmethod
    def analyze_price(
        db: Session,
        listing_id: Optional[int] = None,
        category: Optional[str] = None,
        input_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Compares an item's price to the average of listings in its category,
        returning price differences, statistical averages, and trading advice.
        """
        # If listing_id is provided, retrieve its details
        target_price = input_price
        target_category = category
        title = ""
        
        if listing_id:
            listing = db.query(Listing).filter(Listing.id == listing_id).first()
            if listing:
                target_price = listing.price
                target_category = listing.category
                title = listing.title
            else:
                return {
                    "price_status": "Unknown",
                    "item_price": 0.0,
                    "category_average": 0.0,
                    "difference_pct": 0.0,
                    "advice": "Listing not found.",
                    "suggested_min": 0.0,
                    "suggested_max": 0.0
                }

        if not target_category:
            return {
                "price_status": "Unknown",
                "item_price": target_price or 0.0,
                "category_average": 0.0,
                "difference_pct": 0.0,
                "advice": "Category parameter or valid listing is required.",
                "suggested_min": 0.0,
                "suggested_max": 0.0
            }

        # Calculate category average from active listings in database
        avg_res = db.query(func.avg(Listing.price)).filter(
            Listing.category.ilike(target_category),
            Listing.status == "Active",
            Listing.fraud_level != "High"
        ).scalar()
        
        category_average = float(avg_res) if avg_res is not None else 0.0

        # Retrieve AI recommended price bounds as reference bounds
        ai_min, ai_max, _ = AIService.recommend_price(title or target_category, "Used")
        
        # If database category average is zero, fallback to the AI recommendation mid-point
        if category_average == 0.0:
            category_average = (ai_min + ai_max) / 2.0

        if target_price is None:
            # If no price input, just provide average and bounds
            return {
                "price_status": "Info Only",
                "item_price": None,
                "category_average": round(category_average, 2),
                "difference_pct": 0.0,
                "advice": f"The average price for {target_category} listings is ₹{category_average:.2f}.",
                "suggested_min": ai_min,
                "suggested_max": ai_max
            }

        # Calculate percentage difference
        diff_pct = 0.0
        if category_average > 0:
            diff_pct = ((target_price - category_average) / category_average) * 100.0

        # Classify price status
        # Underpriced: > 20% below average or below AI min
        # Overpriced: > 15% above average or above AI max
        # Fair: otherwise
        if target_price < ai_min or diff_pct < -20.0:
            price_status = "Underpriced"
            advice = "This listing is priced significantly below market average. It is a great deal! Just verify listing description details for quality status."
        elif target_price > ai_max or diff_pct > 15.0:
            price_status = "Overpriced"
            advice = f"This listing is priced high compared to category average (₹{category_average:.2f}). Consider offering a lower price around ₹{category_average:.0f} - ₹{ai_max:.0f}."
        else:
            price_status = "Fair Price"
            advice = "This listing is priced fairly and aligns with the category average. Safe to purchase at this rate."

        return {
            "price_status": price_status,
            "item_price": target_price,
            "category_average": round(category_average, 2),
            "difference_pct": round(diff_pct, 2),
            "advice": advice,
            "suggested_min": ai_min,
            "suggested_max": ai_max
        }
