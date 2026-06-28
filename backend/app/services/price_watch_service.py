from sqlalchemy.orm import Session
from backend.app.models.enterprise import PriceWatch
from backend.app.models.listing import Listing
from backend.app.services.notification_service import NotificationService

class PriceWatchService:
    @staticmethod
    def watch_listing(db: Session, user_id: int, listing_id: int) -> PriceWatch | None:
        # Check if listing exists
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            return None

        # Check if already watching
        existing = db.query(PriceWatch).filter(
            PriceWatch.user_id == user_id,
            PriceWatch.listing_id == listing_id
        ).first()
        if existing:
            return existing

        db_watch = PriceWatch(
            user_id=user_id,
            listing_id=listing_id,
            last_notified_price=listing.price
        )
        db.add(db_watch)
        db.commit()
        db.refresh(db_watch)
        return db_watch

    @staticmethod
    def unwatch_listing(db: Session, user_id: int, listing_id: int) -> bool:
        db_watch = db.query(PriceWatch).filter(
            PriceWatch.user_id == user_id,
            PriceWatch.listing_id == listing_id
        ).first()
        if db_watch:
            db.delete(db_watch)
            db.commit()
            return True
        return False

    @staticmethod
    def get_user_watches(db: Session, user_id: int):
        return db.query(PriceWatch).filter(PriceWatch.user_id == user_id).all()

    @staticmethod
    def handle_price_change(db: Session, listing_id: int, new_price: float):
        """
        Notify users watching this listing if the price has dropped.
        """
        watches = db.query(PriceWatch).filter(PriceWatch.listing_id == listing_id).all()
        for w in watches:
            if new_price < w.last_notified_price:
                # Notify price drop
                NotificationService.create_notification(
                    db=db,
                    user_id=w.user_id,
                    type="price_drop",
                    title="Price Drop Alert!",
                    message=f"The price of your watched listing '{w.listing.title}' has dropped from ₹{w.last_notified_price} to ₹{new_price}.",
                    link=f"/listing/{listing_id}"
                )
                w.last_notified_price = new_price
        db.commit()

    @staticmethod
    def handle_seller_verification(db: Session, seller_id: int):
        """
        Notify watchers when a seller's verification is approved.
        """
        # Find all listings owned by this seller
        listings = db.query(Listing).filter(Listing.seller_id == seller_id).all()
        for listing in listings:
            watches = db.query(PriceWatch).filter(PriceWatch.listing_id == listing.id).all()
            for w in watches:
                NotificationService.create_notification(
                    db=db,
                    user_id=w.user_id,
                    type="verification_approved",
                    title="Seller Verified!",
                    message=f"The seller of your watched listing '{listing.title}' has verified their profile.",
                    link=f"/listing/{listing.id}"
                )

    @staticmethod
    def handle_new_offer(db: Session, listing_id: int, offer_price: float):
        """
        Notify watchers when a new offer is received on a listing.
        """
        watches = db.query(PriceWatch).filter(PriceWatch.listing_id == listing_id).all()
        for w in watches:
            NotificationService.create_notification(
                db=db,
                user_id=w.user_id,
                type="offer_received",
                title="New Offer Placed",
                message=f"A new offer of ₹{offer_price} has been placed on your watched listing '{w.listing.title}'.",
                link=f"/listing/{listing_id}"
            )
