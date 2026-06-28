from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.models.listing import Listing
from backend.app.models.listing_score import ListingScore
from backend.app.models.seller_score import SellerScore

class TrustService:
    @staticmethod
    def get_seller_score_precalculated(db: Session, seller_id: int) -> dict:
        db_seller_score = db.query(SellerScore).filter(SellerScore.seller_id == seller_id).first()
        if db_seller_score:
            return {
                "trust_score": db_seller_score.trust_score,
                "response_rate": db_seller_score.response_rate,
                "quality_score": db_seller_score.quality_score,
                "fraud_score": db_seller_score.fraud_score,
                "level": db_seller_score.level
            }
        return TrustService.calculate_trust_score(db, seller_id)

    @staticmethod
    def calculate_trust_score(db: Session, seller_id: int) -> dict:
        user = db.query(User).filter(User.id == seller_id).first()
        if not user:
            return {
                "trust_score": 50,
                "response_rate": 1.0,
                "quality_score": 50,
                "fraud_score": 0,
                "level": "New Seller"
            }

        # 1. Profile Completion (25 points)
        # Check if full_name is present and has reasonable length
        profile_score = 0
        if user.full_name and len(user.full_name.strip()) > 3:
            profile_score += 25

        # 2. Average Listing Quality (25 points)
        listings = db.query(Listing).filter(Listing.seller_id == seller_id).all()
        avg_quality = 0.0
        if listings:
            total_quality = 0
            quality_count = 0
            for l in listings:
                score_rec = db.query(ListingScore).filter(ListingScore.listing_id == l.id).first()
                if score_rec:
                    total_quality += score_rec.listing_score
                    quality_count += 1
            if quality_count > 0:
                avg_quality = total_quality / quality_count
                
        quality_score = 0
        if avg_quality >= 80:
            quality_score = 25
        elif avg_quality > 0:
            # Scale quality points proportionally up to 80 listing score
            quality_score = int((avg_quality / 80) * 25)

        # 3. Fraud Weighting Logic (30 points)
        # Zero listings with "High" fraud risk -> +30 points.
        has_high_fraud = any(l.fraud_level == "High" for l in listings)
        fraud_points = 30 if not has_high_fraud else 0
        
        # Calculate fraud_score out of 100 for storage (mean of fraud scores)
        total_fraud_score = sum(l.fraud_score for l in listings)
        avg_fraud_score = (total_fraud_score / len(listings)) if listings else 0.0

        # 4. Response Rate Calculator (20 points)
        # Load existing response rate from DB if present, otherwise default to 1.0 (100%)
        db_seller_score = db.query(SellerScore).filter(SellerScore.seller_id == seller_id).first()
        response_rate = 1.0
        if db_seller_score:
            response_rate = db_seller_score.response_rate
        
        response_points = int(response_rate * 20)

        # Total trust score
        trust_score = profile_score + quality_score + fraud_points + response_points
        trust_score = max(0, min(100, trust_score))

        # Assign level badge based on trust score tier
        if trust_score >= 85:
            level = "Trusted Seller"
        elif trust_score >= 60:
            level = "Verified Seller"
        else:
            level = "New Seller"

        # Save to database
        if not db_seller_score:
            db_seller_score = SellerScore(seller_id=seller_id)
            db.add(db_seller_score)
            
        db_seller_score.trust_score = trust_score
        db_seller_score.response_rate = response_rate
        db_seller_score.quality_score = int(avg_quality) if avg_quality > 0 else 50
        db_seller_score.fraud_score = int(avg_fraud_score)
        db_seller_score.level = level
        
        db.commit()
        db.refresh(db_seller_score)

        return {
            "trust_score": trust_score,
            "response_rate": response_rate,
            "quality_score": db_seller_score.quality_score,
            "fraud_score": db_seller_score.fraud_score,
            "level": level
        }
