from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
from backend.app.models.user import User
from backend.app.models.offer import Offer
from backend.app.models.lead_status import LeadStatus
from backend.app.models.risk_score import RiskScore
from backend.app.models.buyer_trust_score import BuyerTrustScore
from backend.app.models.buyer_trust_event import BuyerTrustEvent
from backend.app.models.enums import TrustLevel

class TrustScoreService:
    @staticmethod
    def get_trust_level(score: int) -> str:
        if score >= 76:
            return TrustLevel.ELITE_BUYER.value
        elif score >= 51:
            return TrustLevel.VERIFIED_BUYER.value
        elif score >= 26:
            return TrustLevel.TRUSTED_BUYER.value
        else:
            return TrustLevel.NEW_BUYER.value

    @staticmethod
    def calculate_completed_deal_score(completed_deals: int) -> int:
        # Completed deals (Weight: 30%)
        if completed_deals == 0:
            return 0
        elif completed_deals == 1:
            return 10
        elif completed_deals <= 4:
            return 20
        else:
            return 30

    @staticmethod
    def calculate_offer_reliability_score(db: Session, buyer_id: int) -> int:
        # Offer reliability (Weight: 20%)
        total_offers = db.query(Offer).filter(Offer.buyer_id == buyer_id).count()
        if total_offers == 0:
            return 20  # Default full score if no offers made
        
        accepted_offers = db.query(Offer).filter(Offer.buyer_id == buyer_id, Offer.status == "Accepted").count()
        reliability = accepted_offers / total_offers
        if reliability >= 0.8:
            return 20
        elif reliability >= 0.5:
            return 12
        elif reliability >= 0.3:
            return 6
        else:
            return 0

    @staticmethod
    def calculate_response_score(response_rate: float) -> int:
        # Response Rate (Weight: 15%)
        return int(response_rate * 15)

    @staticmethod
    def calculate_account_age_score(created_at: datetime) -> int:
        # Account Age (Weight: 10%)
        age_days = (datetime.utcnow() - created_at).days
        if age_days >= 90:
            return 10
        elif age_days >= 30:
            return 7
        elif age_days >= 7:
            return 4
        else:
            return 1

    @staticmethod
    def calculate_conversation_quality_score(spam_reports: int) -> int:
        # Conversation Quality (Weight: 10%)
        if spam_reports == 0:
            return 10
        return 0

    @staticmethod
    def calculate_penalties(db: Session, buyer_id: int, spam_reports: int, cancelled_deals: int) -> int:
        # Spam Reports Penalty: -10 to -30
        spam_penalty = min(30, spam_reports * 15)
        
        # Cancelled Deals Penalty: -5 to -20
        cancelled_penalty = min(20, cancelled_deals * 10)
        
        # Blocked By Sellers Penalty: -10 each occurrence
        blocked_count = db.query(LeadStatus).filter(
            LeadStatus.buyer_id == buyer_id,
            LeadStatus.status == "BLOCKED"
        ).count()
        blocked_penalty = blocked_count * 10
        
        return spam_penalty + cancelled_penalty + blocked_penalty

    @staticmethod
    def calculate_trust_score(db: Session, buyer_id: int) -> BuyerTrustScore:
        buyer = db.query(User).filter(User.id == buyer_id).first()
        if not buyer:
            raise ValueError(f"Buyer not found: {buyer_id}")
            
        trust_record = db.query(BuyerTrustScore).filter(BuyerTrustScore.buyer_id == buyer_id).first()
        if not trust_record:
            # Create a default trust score record
            trust_record = BuyerTrustScore(
                buyer_id=buyer_id,
                trust_score=50,
                trust_level=TrustLevel.TRUSTED_BUYER.value,
                completed_deals=0,
                cancelled_deals=0,
                spam_reports=0,
                response_rate=1.0
            )
            db.add(trust_record)
            db.flush()

        old_score = trust_record.trust_score

        # 1. Base Score calculation (max 85 points + 15 points = 100 points)
        comp_score = TrustScoreService.calculate_completed_deal_score(trust_record.completed_deals)
        off_score = TrustScoreService.calculate_offer_reliability_score(db, buyer_id)
        resp_score = TrustScoreService.calculate_response_score(trust_record.response_rate)
        age_score = TrustScoreService.calculate_account_age_score(buyer.created_at)
        conv_score = TrustScoreService.calculate_conversation_quality_score(trust_record.spam_reports)

        raw_score = comp_score + off_score + resp_score + age_score + conv_score

        # 2. Subtract Penalties
        activity_penalties = TrustScoreService.calculate_penalties(
            db, buyer_id, trust_record.spam_reports, trust_record.cancelled_deals
        )
        
        # 3. Risk Engine Integration
        risk_penalty = 0
        risk_record = db.query(RiskScore).filter(RiskScore.user_id == buyer_id).first()
        if risk_record:
            if risk_record.risk_level == "HIGH":
                risk_penalty = 15
            elif risk_record.risk_level == "CRITICAL":
                risk_penalty = 30

        total_score = raw_score - activity_penalties - risk_penalty
        total_score = max(0, min(100, total_score))

        trust_record.trust_score = total_score
        trust_record.trust_level = TrustScoreService.get_trust_level(total_score)
        trust_record.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(trust_record)

        # 4. Log trust event if score has changed
        if old_score != total_score:
            reason = f"Trust score recalculated. Raw: {raw_score}, Penalties: {activity_penalties}, Risk: {risk_penalty}"
            TrustScoreService.log_trust_event(
                db,
                buyer_id=buyer_id,
                event_type="Trust Score Changed",
                old_score=old_score,
                new_score=total_score,
                reason=reason
            )

        return trust_record

    @staticmethod
    def log_trust_event(db: Session, buyer_id: int, event_type: str, old_score: int, new_score: int, reason: Optional[str] = None):
        # Anti-gaming rule: ignore duplicate events of same type within a short window (30 seconds)
        last_event = db.query(BuyerTrustEvent).filter(
            BuyerTrustEvent.buyer_id == buyer_id,
            BuyerTrustEvent.event_type == event_type
        ).order_by(BuyerTrustEvent.created_at.desc()).first()

        if last_event and (datetime.utcnow() - last_event.created_at).total_seconds() < 30:
            return  # Suppress duplicate logging

        trust_event = BuyerTrustEvent(
            buyer_id=buyer_id,
            event_type=event_type,
            old_score=old_score,
            new_score=new_score,
            reason=reason
        )
        db.add(trust_event)
        db.commit()

    @staticmethod
    def run_nightly_batch_recalculation(db: Session):
        # Sweps all users in buyer_trust_scores
        records = db.query(BuyerTrustScore).all()
        for rec in records:
            try:
                TrustScoreService.calculate_trust_score(db, rec.buyer_id)
            except Exception as e:
                print(f"Error during nightly trust score recalc for user {rec.buyer_id}: {e}")
