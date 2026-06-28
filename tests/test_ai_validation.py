import pytest
from backend.app.services.ai_service import AIService
from backend.app.utils.validation import sanitize_listing_input

def test_copilot_local_rules():
    # Test high quality listing scoring
    res_good = AIService.copilot_analyze(
        db=None,
        title="Brand New iPhone 14 Pro Max 256GB Space Grey",
        description="Selling this iphone 14 in brand new condition. Includes original box, apple warranty, and invoice details. Battery health is at 98%. Selling due to upgrade.",
        price=75000.0,
        category="Electronics",
        location="Bandra, Mumbai",
        condition="New",
        image_count=3
    )
    
    assert res_good["listing_score"] >= 80
    assert res_good["sale_probability"] >= 60
    assert res_good["is_fallback"] is True  # Offline/fallback mode inside unit test environment

    # Test poor listing scoring (short title, no description, overpriced, no images)
    res_bad = AIService.copilot_analyze(
        db=None,
        title="iPhone",
        description="selling phone",
        price=120000.0,  # Exceeds maximum boundary (25000)
        category="Electronics",
        location="Connaught Place, Delhi",
        condition="used",
        image_count=0
    )
    
    assert res_bad["listing_score"] < 50
    assert len(res_bad["recommendations"]) > 1

def test_static_scam_detector():
    # Test scam alert flagging on description keyword triggers
    score, level, flagged, is_fb = AIService.detect_fraud(
        title="iPhone urgent sale",
        description="Advance payment only. Send deposit via western union first. 100% safe guaranteed. Urgent transfer."
    )
    
    assert score >= 70.0
    assert level == "High"
    assert "western union" in flagged
    assert "advance payment only" in flagged
    assert is_fb is True

def test_category_matching_rules():
    # Test correct categorical fallbacks mapping
    assert AIService.predict_category("Dining chair with wood legs")[0] == "Furniture"
    assert AIService.predict_category("Toyota Camry Car")[0] == "Vehicles"
    assert AIService.predict_category("Learn Python Programming Book")[0] == "Books"
    assert AIService.predict_category("Leather shoes size 9")[0] == "Fashion"

def test_html_xss_escaping():
    title_raw = "<script>alert('xss')</script> iPhone 12"
    desc_raw = "<iframe src='malicious'></iframe> Excellent quality"
    
    clean_title, clean_desc = sanitize_listing_input(title_raw, desc_raw)
    
    assert "<script>" not in clean_title
    assert "&lt;script&gt;" in clean_title
    assert "<iframe>" not in clean_desc
    assert "&lt;iframe" in clean_desc
