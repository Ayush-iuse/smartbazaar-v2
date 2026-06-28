import pytest
from backend.app.services.spam_detector import SpamDetector
from backend.app.core.redis import redis_client

def test_spam_keywords():
    # Test safe messages
    assert not SpamDetector.contains_spam_keywords("Hello, is this item still available?")
    assert not SpamDetector.contains_spam_keywords("Can I pick this up tomorrow?")

    # Test spam keywords
    assert SpamDetector.contains_spam_keywords("Connect with me on WhatsApp please!")
    assert SpamDetector.contains_spam_keywords("Join my Telegram channel")
    assert SpamDetector.contains_spam_keywords("Best Crypto options here")
    assert SpamDetector.contains_spam_keywords("Buy bitcoin now")
    assert SpamDetector.contains_spam_keywords("Please make an advance deposit to lock this")
    assert SpamDetector.contains_spam_keywords("Pay via Western Union")

    # Test URLs
    assert SpamDetector.contains_spam_keywords("Visit http://spam-site.com")
    assert SpamDetector.contains_spam_keywords("Check www.external-link.org/scam")

def test_spam_flood_detector():
    user_id = 9999
    content = "Hello, buy my stuff!"
    
    # Clean keys
    redis_client.delete(f"spam:last_msg:{user_id}", f"spam:count:{user_id}")

    # First send is safe
    assert not SpamDetector.is_repeated_flood(user_id, content)

    # Next 2 sends are safe
    assert not SpamDetector.is_repeated_flood(user_id, content)
    assert not SpamDetector.is_repeated_flood(user_id, content)

    # 4th send matches pattern and triggers flood block
    assert SpamDetector.is_repeated_flood(user_id, content)

    # Different message resets it
    assert not SpamDetector.is_repeated_flood(user_id, "Something else completely")

def test_spam_rate_limiter():
    user_id = 8888
    redis_client.delete(f"spam:rate:{user_id}")

    # Under 10 messages should be allowed
    for _ in range(9):
        assert not SpamDetector.is_rate_limited(user_id)

    # 10th is allowed, but sets the limit
    assert not SpamDetector.is_rate_limited(user_id)

    # 11th triggers rate limiting
    assert SpamDetector.is_rate_limited(user_id)
