from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.listing import Listing
from backend.app.models.risk_score import RiskScore
from backend.app.services.ai_service import AIService
from backend.app.services.trust_service import TrustService

class FraudAnalysisAgent:
    @staticmethod
    def evaluate_risk(
        db: Session,
        listing_id: Optional[int] = None,
        user_id: Optional[int] = None,
        query_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates risk parameters for a user and/or a listing, returning a unified risk rating
        ('Safe', 'Moderate Risk', 'High Risk') along with specific reasons and suggestions.
        """
        reasons = []
        overall_score = 0.0
        
        # 1. Evaluate Listing Risk
        listing_fraud_level = "Low"
        listing_fraud_score = 0.0
        if listing_id:
            listing = db.query(Listing).filter(Listing.id == listing_id).first()
            if listing:
                listing_fraud_level = listing.fraud_level
                listing_fraud_score = listing.fraud_score
                if listing_fraud_level == "High":
                    reasons.append(f"Listing #{listing_id} is flagged with high fraud score ({listing_fraud_score}%).")
                    overall_score = max(overall_score, 85.0)
                elif listing_fraud_level == "Medium":
                    reasons.append(f"Listing #{listing_id} is flagged with moderate fraud indicators.")
                    overall_score = max(overall_score, 45.0)
                else:
                    overall_score = max(overall_score, 10.0)
                
                # Check listing seller's trust score/badges
                trust_details = TrustService.get_seller_score_precalculated(db, listing.seller_id)
                seller_trust = trust_details.get("trust_score", 100)
                if seller_trust < 30:
                    reasons.append(f"Seller has a critical trust score ({seller_trust}/100).")
                    overall_score = max(overall_score, 75.0)
                elif seller_trust < 60:
                    reasons.append(f"Seller has a moderate/unverified trust profile ({seller_trust}/100).")
                    overall_score = max(overall_score, 40.0)
            else:
                reasons.append(f"Listing with id {listing_id} not found in database.")
                overall_score = max(overall_score, 90.0)

        # 2. Evaluate User Account Risk
        if user_id:
            user_risk = db.query(RiskScore).filter(RiskScore.user_id == user_id).first()
            if user_risk:
                level = user_risk.risk_level.upper()
                score = user_risk.risk_score
                if level in ["HIGH", "CRITICAL"]:
                    reasons.append(f"User #{user_id} profile triggers safety alerts (Level: {level}, Score: {score}%).")
                    overall_score = max(overall_score, float(score))
                elif level == "MEDIUM":
                    reasons.append(f"User #{user_id} has medium risk flags (Score: {score}%).")
                    overall_score = max(overall_score, float(score))
                else:
                    overall_score = max(overall_score, float(score))

        # 3. Evaluate Query Text Risk
        if query_text:
            text_score, text_level, flagged, _ = AIService.detect_fraud("", query_text)
            if text_level == "High":
                reasons.append(f"Query contains high risk keywords or patterns: {', '.join(flagged)}.")
                overall_score = max(overall_score, text_score)
            elif text_level == "Medium":
                reasons.append(f"Query contains moderate risk phrases: {', '.join(flagged)}.")
                overall_score = max(overall_score, text_score)

        # 4. Resolve overall risk level based on standard limits
        # 0-25: LOW/Safe, 26-50: MEDIUM/Moderate, 51+: HIGH/High Risk
        if overall_score >= 51.0:
            risk_rating = "High Risk"
            advice = "Do not transact. High probability of scam or policy violation."
        elif overall_score >= 26.0:
            risk_rating = "Moderate Risk"
            advice = "Proceed with caution. Verify identity and meet only in public safe spots."
        else:
            risk_rating = "Safe"
            advice = "Low risk detected. Follow standard marketplace safety procedures."

        if not reasons:
            reasons.append("No active security flags or scam indicators triggered.")

        return {
            "risk_rating": risk_rating,
            "risk_score": overall_score,
            "reasons": reasons,
            "advice": advice
        }
