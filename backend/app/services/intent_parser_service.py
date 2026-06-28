import re
from typing import Optional
from backend.app.services.ai_service import get_openai_client

class IntentParserService:
    @staticmethod
    def parse_intent(query: str) -> str:
        """
        Detects user intent from query using LLM if available, otherwise regex rules engine.
        Intents: search, compare, safety, negotiate, price
        """
        # 1. Try LLM if available
        client = get_openai_client()
        if client:
            try:
                prompt = (
                    f"Classify the following user marketplace query into one of these intents: "
                    f"'search', 'compare', 'safety', 'negotiate', 'price'. "
                    f"Output ONLY the intent string (lowercase, no punctuation).\n"
                    f"Query: \"{query}\""
                )
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an intent classifier for a marketplace. Output one of: search, compare, safety, negotiate, price."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=10,
                    temperature=0.0
                )
                intent = response.choices[0].message.content.strip().lower()
                valid_intents = ["search", "compare", "safety", "negotiate", "price"]
                if intent in valid_intents:
                    return intent
            except Exception:
                pass  # Fall back to local rules engine

        # 2. Local Rules Engine (Regex Fallback)
        q = query.lower()
        if any(w in q for w in ["compare", "versus", "vs", "difference between"]):
            return "compare"
        if any(w in q for w in ["safe", "scam", "fraud", "risk", "legit", "report", "fake", "trust", "block", "whatsapp", "telegram"]):
            return "safety"
        if any(w in q for w in ["negotiate", "counter", "discount", "strategy", "closing price", "offer"]):
            return "negotiate"
        if any(w in q for w in ["price", "worth", "cost", "value", "expensive", "cheap", "fair"]):
            return "price"
        
        return "search"
