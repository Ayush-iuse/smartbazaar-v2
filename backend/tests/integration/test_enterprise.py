import pytest
from datetime import datetime
from backend.app.models.user import User
from backend.app.models.listing import Listing
from backend.app.models.enterprise import Notification, SavedSearch, PriceWatch, AuditLog, BackgroundJob, LoginHistory
from backend.app.services.saved_search_service import SavedSearchService
from backend.app.services.price_watch_service import PriceWatchService
from backend.app.services.job_service import JobService
from backend.app.services.notification_service import NotificationService
from backend.app.utils.jwt import create_access_token

def test_observability_endpoints(client):
    # Test health check (existing)
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    # Test /ready
    res = client.get("/ready")
    assert res.status_code == 200
    assert res.json()["status"] == "ready"

    # Test /metrics
    res = client.get("/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "total_requests" in data
    assert "average_latency_seconds" in data
    assert "error_count" in data

def test_user_suspension(client, db_session, test_buyer):
    # Verify client works normally
    token = create_access_token(data={"sub": test_buyer.email})
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    
    # Suspend user in DB
    test_buyer.is_suspended = True
    db_session.commit()

    # Verify requests now fail with 403 Forbidden
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 403
    assert "suspended" in res.json()["detail"].lower()

def test_saved_searches(client, db_session, test_buyer, test_seller):
    # Create saved search for the buyer
    ss = SavedSearchService.save_search(
        db=db_session,
        user_id=test_buyer.id,
        query="gaming laptop",
        filters={"category": "Electronics", "max_price": 50000}
      )
    assert ss.id is not None
    assert ss.query == "gaming laptop"

    # Create matching listing from seller
    listing = Listing(
        title="Cheap Gaming Laptop",
        description="Like new condition",
        price=45000.0,
        category="Electronics",
        location="Mumbai",
        seller_id=test_seller.id,
        image_urls="[]"
    )
    db_session.add(listing)
    db_session.commit()

    # Trigger saved searches check
    SavedSearchService.check_listing_against_saved_searches(db_session, listing)

    # Verify notification was generated for the buyer
    notif = db_session.query(Notification).filter(Notification.user_id == test_buyer.id).first()
    assert notif is not None
    assert notif.type == "saved_search_match"
    assert "gaming laptop" in notif.message.lower()

def test_price_watches(client, db_session, test_buyer, test_listing):
    # Buyer watches seller's listing
    watch = PriceWatchService.watch_listing(db_session, test_buyer.id, test_listing.id)
    assert watch is not None
    assert watch.last_notified_price == test_listing.price

    # Seller drops price
    test_listing.price = 40000.0
    db_session.commit()

    # Trigger price change check
    PriceWatchService.handle_price_change(db_session, test_listing.id, 40000.0)

    # Verify notification was generated for buyer
    notif = db_session.query(Notification).filter(
        Notification.user_id == test_buyer.id,
        Notification.type == "price_drop"
    ).first()
    assert notif is not None
    assert "dropped" in notif.message.lower()

def test_audit_logs(client, db_session, test_buyer):
    from backend.app.services.audit_service import AuditService
    log = AuditService.log_action(
        db=db_session,
        user_id=test_buyer.id,
        action="create_listing",
        entity_type="listing",
        entity_id=1,
        details={"title": "Test Title"}
    )
    assert log.id is not None
    assert log.action == "create_listing"

    # Verify log is in DB
    db_log = db_session.query(AuditLog).filter(AuditLog.id == log.id).first()
    assert db_log is not None
    assert db_log.user_id == test_buyer.id

def test_background_jobs(client, db_session):
    # Queue a job
    job = JobService.queue_job(
        db=db_session,
        job_type="email_send",
        payload={"to": "test@example.com", "subject": "Hello", "body": "World"}
    )
    assert job.id is not None
    assert job.status == "pending"

    # Run the worker cycle directly or wait
    # We can check that the pending job is retrieved
    pending = db_session.query(BackgroundJob).filter(BackgroundJob.status == "pending").first()
    assert pending is not None
    assert pending.id == job.id

def test_admin_actions(client, db_session, test_seller):
    # Make user an admin
    admin_user = User(
        email="admin@example.com",
        full_name="Test Admin",
        hashed_password="hashedpassword",
        is_admin=True
    )
    db_session.add(admin_user)
    db_session.commit()

    admin_token = create_access_token(data={"sub": admin_user.email})
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Test GET users
    res = client.get("/api/admin/users", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 2  # admin + seller + buyer (from other tests/fixtures)

    # Suspend user
    res = client.post(f"/api/admin/users/{test_seller.id}/suspend", headers=headers)
    assert res.status_code == 200
    assert db_session.query(User).filter(User.id == test_seller.id).first().is_suspended is True

    # Restore user
    res = client.post(f"/api/admin/users/{test_seller.id}/restore", headers=headers)
    assert res.status_code == 200
    assert db_session.query(User).filter(User.id == test_seller.id).first().is_suspended is False

def test_backup_and_restore(client, db_session, test_buyer):
    # Make user admin
    admin_user = User(
        email="admin_backup@example.com",
        full_name="Backup Admin",
        hashed_password="hashedpassword",
        is_admin=True
    )
    db_session.add(admin_user)
    db_session.commit()

    admin_token = create_access_token(data={"sub": admin_user.email})
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Export backup
    res = client.post("/api/admin/backup/export", headers=headers)
    assert res.status_code == 200
    backup_data = res.json()
    assert "users" in backup_data
    assert "listings" in backup_data

    # Restore backup
    res = client.post("/api/admin/backup/restore", json=backup_data, headers=headers)
    assert res.status_code == 200
    assert res.json()["detail"] == "Database restored successfully"
