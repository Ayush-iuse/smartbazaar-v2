import os
import sys
import random
import json
from datetime import datetime, timedelta

# Adjust PYTHONPATH to project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.user import User
from backend.app.models.listing import Listing
from backend.app.models.message import Message
from backend.app.models.listing_score import ListingScore
from backend.app.models.seller_score import SellerScore
from backend.app.models.analytics_snapshot import AnalyticsSnapshot
from backend.app.models.conversation import Conversation
from backend.app.models.offer import Offer
from backend.app.models.saved_listing import SavedListing
from backend.app.models.recently_viewed import RecentlyViewed
from backend.app.models.listing_view import ListingView
from backend.app.models.online_status import UserPresence
from backend.app.utils.jwt import hash_password

# Import CRM and Trust/Verification SQLAlchemy models
from backend.app.models.buyer_trust_score import BuyerTrustScore
from backend.app.models.buyer_trust_event import BuyerTrustEvent
from backend.app.models.seller_verification import SellerVerification
from backend.app.models.verification_document import VerificationDocument
from backend.app.models.buyer_label import BuyerLabel
from backend.app.models.buyer_note import BuyerNote
from backend.app.models.lead_status import LeadStatus
from backend.app.models.lead_score import LeadScore
from backend.app.models.crm_activity import CRMActivity
from backend.app.models.buyer_timeline import BuyerTimeline
from backend.app.models.risk_score import RiskScore

def seed_database():
    # If production environment or Supabase database detected, skip schema teardown and verify if data exists
    is_production = (
        os.getenv("APP_ENV") == "production"
        or "supabase.co" in str(engine.url)
    )
    
    db = SessionLocal()
    try:
        if is_production:
            print("Production environment or remote Supabase DB detected. Skipping database teardown.")
            try:
                user_count = db.query(User).count()
                if user_count > 0:
                    print(f"Database already contains {user_count} users. Skipping seeding to prevent overwriting production data.")
                    return
            except Exception as e:
                print(f"Checking for existing database data: {e}")
                print("Tables might not exist yet. Please run backend startup first to apply migrations.")
                return
        else:
            print("Re-initializing tables...")
            if engine.url.drivername.startswith("postgresql"):
                from sqlalchemy import text
                try:
                    db.execute(text("DROP SCHEMA public CASCADE;"))
                    db.execute(text("CREATE SCHEMA public;"))
                    db.execute(text("GRANT ALL ON SCHEMA public TO public;"))
                    db.commit()
                except Exception as e:
                    print(f"Postgres schema drop failed: {e}")
                    db.rollback()
            else:
                Base.metadata.drop_all(bind=engine)
            
            # Apply migrations via Alembic to keep schema and alembic_version in sync
            print("Running database migrations via Alembic...")
            from alembic.config import Config
            from alembic import command
            alembic_ini_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../alembic.ini"))
            alembic_cfg = Config(alembic_ini_path)
            command.upgrade(alembic_cfg, "head")
    finally:
        db.close()
        
    db = SessionLocal()
    try:
        print("Seeding Users...")
        # Hashed password for speed
        hashed_pass = hash_password("Password123!")

        # Create 5 Sellers
        sellers_data = [
            {"email": "seller1@smartbazaar.ai", "name": "Sameer 'Quick-List' Sen"},
            {"email": "seller2@smartbazaar.ai", "name": "Rajesh Delhi Electronics"},
            {"email": "seller3@smartbazaar.ai", "name": "Karan Furniture Hub"},
            {"email": "seller4@smartbazaar.ai", "name": "Preeti Auto Dealers"},
            {"email": "seller5@smartbazaar.ai", "name": "Nisha Book Collector"}
        ]
        
        sellers = []
        for s in sellers_data:
            user = User(email=s["email"], full_name=s["name"], hashed_password=hashed_pass)
            db.add(user)
            db.flush()
            sellers.append(user)

        # Create 20 Buyers
        buyers_data = [
            {"email": "buyer1@smartbazaar.ai", "name": "Divya Sharma"},
            {"email": "buyer2@smartbazaar.ai", "name": "Amit Patil"},
            {"email": "buyer3@smartbazaar.ai", "name": "Rohan Malhotra"},
            {"email": "buyer4@smartbazaar.ai", "name": "Siddharth Gupta"},
            {"email": "buyer5@smartbazaar.ai", "name": "Neha Kapoor"},
            {"email": "buyer6@smartbazaar.ai", "name": "Vikram Mehta"},
            {"email": "buyer7@smartbazaar.ai", "name": "Priyanka Joshi"},
            {"email": "buyer8@smartbazaar.ai", "name": "Aditya Verma"},
            {"email": "buyer9@smartbazaar.ai", "name": "Shalini Nair"},
            {"email": "buyer10@smartbazaar.ai", "name": "Rahul Deshmukh"},
            {"email": "buyer11@smartbazaar.ai", "name": "Ananya Roy"},
            {"email": "buyer12@smartbazaar.ai", "name": "Manish Pandey"},
            {"email": "buyer13@smartbazaar.ai", "name": "Kriti Saxena"},
            {"email": "buyer14@smartbazaar.ai", "name": "Sanjay Rao"},
            {"email": "buyer15@smartbazaar.ai", "name": "Ritu Singhal"},
            {"email": "buyer16@smartbazaar.ai", "name": "Gaurav Chawla"},
            {"email": "buyer17@smartbazaar.ai", "name": "Pooja Reddy"},
            {"email": "buyer18@smartbazaar.ai", "name": "Vivek Iyer"},
            {"email": "buyer19@smartbazaar.ai", "name": "Deepika Sen"},
            {"email": "buyer20@smartbazaar.ai", "name": "Abhishek Nair"}
        ]

        buyers = []
        for b in buyers_data:
            user = User(email=b["email"], full_name=b["name"], hashed_password=hashed_pass)
            db.add(user)
            db.flush()
            buyers.append(user)

        # Add admin account
        admin = User(email="admin@smartbazaar.ai", full_name="System Administrator", hashed_password=hashed_pass)
        db.add(admin)
        db.flush()

        print("Seeding Seller Scores...")
        # Create seller scores
        scores_data = [
            {"seller_id": sellers[0].id, "trust": 92, "rate": 95.0, "quality": 90, "fraud": 0, "level": "Trusted Seller"},
            {"seller_id": sellers[1].id, "trust": 82, "rate": 88.0, "quality": 80, "fraud": 5, "level": "Verified Seller"},
            {"seller_id": sellers[2].id, "trust": 95, "rate": 99.0, "quality": 95, "fraud": 0, "level": "Trusted Seller"},
            {"seller_id": sellers[3].id, "trust": 65, "rate": 70.0, "quality": 60, "fraud": 10, "level": "New Seller"},
            {"seller_id": sellers[4].id, "trust": 50, "rate": 0.0, "quality": 50, "fraud": 0, "level": "New Seller"}
        ]
        for s in scores_data:
            score = SellerScore(
                seller_id=s["seller_id"],
                trust_score=s["trust"],
                response_rate=s["rate"],
                quality_score=s["quality"],
                fraud_score=s["fraud"],
                level=s["level"]
            )
            db.add(score)

        print("Seeding Listings...")
        listings_data = [
            {"title": "iPhone 13 Pro - Sierra Blue", "desc": "Selling my iPhone 13 Pro sierra blue 128GB.", "price": 42000.0, "cat": "Electronics", "loc": "Delhi", "seller": sellers[1].id},
            {"title": "MacBook Air M1 - 256GB SSD", "desc": "MacBook Air M1 in space grey. College use only.", "price": 55000.0, "cat": "Electronics", "loc": "Delhi", "seller": sellers[1].id},
            {"title": "Solid Wood Table with 4 Chairs", "desc": "Teak wood table with cushions chairs. bandra.", "price": 14500.0, "cat": "Furniture", "loc": "Mumbai", "seller": sellers[0].id},
            {"title": "Ergonomic Office Chair - Lumbar support", "desc": "High back office chair adjustable headrest.", "price": 4800.0, "cat": "Furniture", "loc": "Pune", "seller": sellers[2].id},
            {"title": "Honda Activa 5G - New Tyres", "desc": "Active 5G scooter in good running shape.", "price": 38000.0, "cat": "Vehicles", "loc": "Pune", "seller": sellers[3].id},
            {"title": "Harry Potter Boxset Hardcover", "desc": "Boxset with all 7 volumes sealed book pack.", "price": 2200.0, "cat": "Books", "loc": "Kolkata", "seller": sellers[4].id}
        ]
        
        listings = []
        for l in listings_data:
            listing = Listing(
                title=l["title"],
                description=l["desc"],
                price=l["price"],
                category=l["cat"],
                location=l["loc"],
                image_urls=json.dumps(["https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500"]),
                seller_id=l["seller"]
            )
            db.add(listing)
            db.flush()
            listings.append(listing)

        print("Seeding 20 Buyer Trust Scores...")
        trust_levels = ["NEW BUYER", "TRUSTED BUYER", "VERIFIED BUYER", "ELITE BUYER"]
        for i, b in enumerate(buyers):
            # Deterministic but realistic variations
            completed = random.randint(0, 15)
            cancelled = random.randint(0, 3)
            spam = random.randint(0, 2)
            resp = round(random.uniform(0.7, 1.0), 2)
            
            # Trust score calculation
            score = 50 + (completed * 4) - (cancelled * 8) - (spam * 15)
            score = max(0, min(100, score))
            
            level = "NEW BUYER"
            if score >= 85:
                level = "ELITE BUYER"
            elif score >= 70:
                level = "VERIFIED BUYER"
            elif score >= 55:
                level = "TRUSTED BUYER"

            trust_score = BuyerTrustScore(
                buyer_id=b.id,
                trust_score=score,
                trust_level=level,
                completed_deals=completed,
                cancelled_deals=cancelled,
                spam_reports=spam,
                response_rate=resp
            )
            db.add(trust_score)

        print("Seeding 20 Lead Scores...")
        lead_categories = ["COLD", "WARM", "HOT", "PRIORITY"]
        for i in range(20):
            buyer = buyers[i % len(buyers)]
            seller = sellers[i % len(sellers)]
            score = random.randint(10, 98)
            
            category = "COLD"
            if score >= 80:
                category = "PRIORITY"
            elif score >= 60:
                category = "HOT"
            elif score >= 35:
                category = "WARM"

            lead_score = LeadScore(
                seller_id=seller.id,
                buyer_id=buyer.id,
                score=score,
                category=category,
                last_calculated=datetime.utcnow() - timedelta(minutes=random.randint(5, 120))
            )
            db.add(lead_score)

        print("Seeding 30 Private Notes...")
        notes_templates = [
            "Very responsive buyer, interested in fast courier delivery.",
            "Offered low budget, negotiated down significantly.",
            "Suspicious inquiry about cash advance, proceed with caution.",
            "Repeat buyer. Friendly and prompt payment.",
            "Asked for additional product photos over chat.",
            "VIP client, high purchase intent.",
            "Did not reply to my latest quote yet.",
            "Requested discount on shipping charges.",
            "Wants to pick up locally Connaught Place.",
            "Budget restricted but serious."
        ]
        for i in range(30):
            buyer = buyers[random.randint(0, len(buyers)-1)]
            seller = sellers[random.randint(0, len(sellers)-1)]
            note_text = random.choice(notes_templates) + f" (Ref: #{i+1})"
            
            buyer_note = BuyerNote(
                seller_id=seller.id,
                buyer_id=buyer.id,
                note=note_text
            )
            db.add(buyer_note)

        print("Seeding 20 Labels...")
        label_types = ["VIP", "Repeat Buyer", "Negotiating", "High Intent", "Blocked"]
        for i in range(20):
            buyer = buyers[i % len(buyers)]
            seller = sellers[i % len(sellers)]
            lbl = random.choice(label_types)
            
            buyer_label = BuyerLabel(
                seller_id=seller.id,
                buyer_id=buyer.id,
                label=lbl
            )
            db.add(buyer_label)

        print("Seeding 50 CRM Activities...")
        activity_types = ["Message Sent", "Offer Sent", "Offer Accepted", "Label Added", "Note Added", "Status Changed"]
        for i in range(50):
            buyer = buyers[random.randint(0, len(buyers)-1)]
            seller = sellers[random.randint(0, len(sellers)-1)]
            act = random.choice(activity_types)
            
            crm_activity = CRMActivity(
                seller_id=seller.id,
                buyer_id=buyer.id,
                activity_type=act,
                metadata=json.dumps({"detail": f"Activity seed log {i+1}", "timestamp": datetime.utcnow().isoformat()}),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            )
            db.add(crm_activity)

        print("Seeding 20 Lead Statuses...")
        statuses_list = ["NEW", "INTERESTED", "ENGAGED", "NEGOTIATING", "OFFER_SENT", "OFFER_ACCEPTED", "DEAL_COMPLETED", "LOST", "BLOCKED"]
        for i in range(20):
            buyer = buyers[i % len(buyers)]
            seller = sellers[i % len(sellers)]
            st = random.choice(statuses_list)
            
            lead_status = LeadStatus(
                seller_id=seller.id,
                buyer_id=buyer.id,
                status=st
            )
            db.add(lead_status)

        print("Seeding Buyer Timelines...")
        timeline_events = ["Conversation Started", "Offer Sent", "Offer Accepted", "Offer Rejected", "Listing Saved", "Verification Earned", "Trust Score Changed"]
        for i in range(20):
            buyer = buyers[i % len(buyers)]
            seller = sellers[i % len(sellers)]
            evt = random.choice(timeline_events)
            
            timeline = BuyerTimeline(
                seller_id=seller.id,
                buyer_id=buyer.id,
                event_type=evt,
                event_data=json.dumps({"info": f"Seed event log {i+1}"}),
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 5))
            )
            db.add(timeline)

        print("Seeding Risk Scores...")
        risk_levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        for b in buyers:
            lvl = random.choice(risk_levels)
            score = 10 if lvl == "LOW" else 45 if lvl == "MEDIUM" else 75 if lvl == "HIGH" else 95
            rs = RiskScore(
                user_id=b.id,
                risk_score=score,
                risk_level=lvl,
                reason="Automatic seed check evaluation profile."
            )
            db.add(rs)

        print("Seeding Trust Events...")
        for i in range(10):
            buyer = buyers[i % len(buyers)]
            old_s = random.randint(50, 80)
            new_s = old_s + random.choice([-10, 10])
            te = BuyerTrustEvent(
                buyer_id=buyer.id,
                event_type="Deal Completed",
                old_score=old_s,
                new_score=new_s,
                reason="Auto seed event"
            )
            db.add(te)

        print("Seeding Seller Verifications & Documents...")
        for i in range(5):
            seller = sellers[i % len(sellers)]
            sv = SellerVerification(
                seller_id=seller.id,
                verification_type=random.choice(["EMAIL", "PHONE", "GOVERNMENT_ID"]),
                status=random.choice(["PENDING", "APPROVED", "REJECTED"]),
                submitted_at=datetime.utcnow() - timedelta(days=random.randint(1, 3))
            )
            db.add(sv)
            db.flush()
            
            if sv.verification_type == "GOVERNMENT_ID":
                doc = VerificationDocument(
                    verification_id=sv.id,
                    file_path=f"/uploads/verification/seed_doc_{i+1}.pdf",
                    document_type=random.choice(["Passport", "Driving License", "National ID"])
                )
                db.add(doc)

        db.commit()
        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
