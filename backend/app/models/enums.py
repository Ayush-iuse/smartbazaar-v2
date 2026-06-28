from enum import Enum

class TrustLevel(str, Enum):
    NEW_BUYER = "NEW BUYER"
    TRUSTED_BUYER = "TRUSTED BUYER"
    VERIFIED_BUYER = "VERIFIED BUYER"
    ELITE_BUYER = "ELITE BUYER"

class VerificationType(str, Enum):
    EMAIL = "EMAIL"
    PHONE = "PHONE"
    GOVERNMENT_ID = "GOVERNMENT_ID"

class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class DocumentType(str, Enum):
    PASSPORT = "Passport"
    DRIVING_LICENSE = "Driving License"
    NATIONAL_ID = "National ID"

class LeadStatusStage(str, Enum):
    NEW = "NEW"
    INTERESTED = "INTERESTED"
    ENGAGED = "ENGAGED"
    NEGOTIATING = "NEGOTIATING"
    OFFER_SENT = "OFFER_SENT"
    OFFER_ACCEPTED = "OFFER_ACCEPTED"
    DEAL_COMPLETED = "DEAL_COMPLETED"
    LOST = "LOST"
    BLOCKED = "BLOCKED"

class LeadScoreCategory(str, Enum):
    COLD = "COLD"
    WARM = "WARM"
    HOT = "HOT"
    PRIORITY = "PRIORITY"

class CRMActivityType(str, Enum):
    MESSAGE_SENT = "Message Sent"
    OFFER_SENT = "Offer Sent"
    OFFER_ACCEPTED = "Offer Accepted"
    LABEL_ADDED = "Label Added"
    NOTE_ADDED = "Note Added"
    STATUS_CHANGED = "Status Changed"
    WISHLIST_ADDED = "Wishlist Added"
    LISTING_VIEWED = "Listing Viewed"

class BuyerTimelineEventType(str, Enum):
    CONVERSATION_STARTED = "Conversation Started"
    OFFER_SENT = "Offer Sent"
    OFFER_ACCEPTED = "Offer Accepted"
    OFFER_REJECTED = "Offer Rejected"
    LISTING_SAVED = "Listing Saved"
    VERIFICATION_EARNED = "Verification Earned"
    TRUST_SCORE_CHANGED = "Trust Score Changed"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
