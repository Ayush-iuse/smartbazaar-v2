from typing import List, Tuple
from backend.app.services.ai_service import AIService

class FraudService:
    @staticmethod
    def scan_listing(title: str, description: str) -> Tuple[float, str, List[str], bool]:
        """
        Runs fraud scanning using the AI Service layer.
        Returns a tuple of (fraud_score, fraud_level, flagged_phrases, is_fallback).
        """
        return AIService.detect_fraud(title, description)
