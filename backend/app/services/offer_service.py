from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from datetime import datetime
from backend.app.models.offer import Offer
from backend.app.models.listing import Listing
from backend.app.models.user import User

class OfferService:
    @staticmethod
    def create_offer(db: Session, listing_id: int, buyer_id: int, offer_amount: float) -> Offer:
        # Fetch listing
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        # Enforce self-offer guard (403 as requested)
        if listing.seller_id == buyer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot make offer on own listing"
            )
            
        # Check if listing is active
        if listing.status != "Active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot make offer on a sold or inactive listing"
            )
            
        # Check if direct buy (amount >= listing.price)
        is_direct_buy = offer_amount >= listing.price
        
        # Check if there is already a pending offer from this buyer
        existing_offer = db.query(Offer).filter(
            Offer.listing_id == listing_id,
            Offer.buyer_id == buyer_id,
            Offer.status == "Pending"
        ).first()
        
        if existing_offer:
            # Update the existing pending offer amount
            existing_offer.offer_amount = offer_amount
            existing_offer.updated_at = datetime.utcnow()
            
            if is_direct_buy:
                existing_offer.status = "Accepted"
                listing.status = "Sold"
                
                # Expire other pending offers
                other_offers = db.query(Offer).filter(
                    Offer.listing_id == listing_id,
                    Offer.id != existing_offer.id,
                    Offer.status == "Pending"
                ).all()
                for other_off in other_offers:
                    other_off.status = "Expired"
                    other_off.updated_at = datetime.utcnow()
                    
            db.commit()
            db.refresh(existing_offer)
            try:
                from backend.app.services.trust_score_service import TrustScoreService
                from backend.app.services.notification_service import NotificationService
                from backend.app.services.price_watch_service import PriceWatchService
                TrustScoreService.calculate_trust_score(db, buyer_id)
                NotificationService.create_notification(
                    db,
                    user_id=existing_offer.seller_id,
                    type="offer_received",
                    title="Offer Updated",
                    message=f"Offer updated to ₹{existing_offer.offer_amount} on '{existing_offer.listing.title if existing_offer.listing else 'Listing'}'",
                    link="/offers"
                )
                PriceWatchService.handle_new_offer(db, listing_id, existing_offer.offer_amount)
            except Exception as e:
                print(f"Error handling offer update hooks: {e}")
            return existing_offer
            
        # Otherwise, create a new offer
        status_val = "Accepted" if is_direct_buy else "Pending"
        offer = Offer(
            listing_id=listing_id,
            buyer_id=buyer_id,
            seller_id=listing.seller_id,
            offer_amount=offer_amount,
            status=status_val
        )
        db.add(offer)
        
        if is_direct_buy:
            listing.status = "Sold"
            db.flush() # ensure offer gets ID before querying other offers
            
            # Expire other pending offers
            other_offers = db.query(Offer).filter(
                Offer.listing_id == listing_id,
                Offer.id != offer.id,
                Offer.status == "Pending"
            ).all()
            for other_off in other_offers:
                other_off.status = "Expired"
                other_off.updated_at = datetime.utcnow()
                
        db.commit()
        db.refresh(offer)
        try:
            from backend.app.services.trust_score_service import TrustScoreService
            from backend.app.services.notification_service import NotificationService
            from backend.app.services.price_watch_service import PriceWatchService
            TrustScoreService.calculate_trust_score(db, buyer_id)
            NotificationService.create_notification(
                db,
                user_id=offer.seller_id,
                type="offer_received",
                title="New Offer Received",
                message=f"You received an offer of ₹{offer.offer_amount} on '{offer.listing.title if offer.listing else 'Listing'}'",
                link="/offers"
            )
            PriceWatchService.handle_new_offer(db, listing_id, offer.offer_amount)
        except Exception as e:
            print(f"Error handling offer create hooks: {e}")
        return offer

    @staticmethod
    def get_user_offers(db: Session, user_id: int):
        # Returns all offers where user is buyer or seller
        offers = db.query(Offer).options(
            joinedload(Offer.buyer),
            joinedload(Offer.seller),
            joinedload(Offer.listing)
        ).filter(
            (Offer.buyer_id == user_id) | (Offer.seller_id == user_id)
        ).order_by(Offer.created_at.desc()).all()
        
        # Populate listing titles and usernames
        results = []
        for off in offers:
            results.append({
                "id": off.id,
                "listing_id": off.listing_id,
                "buyer_id": off.buyer_id,
                "seller_id": off.seller_id,
                "offer_amount": off.offer_amount,
                "status": off.status,
                "created_at": off.created_at,
                "updated_at": off.updated_at,
                "listing_title": off.listing.title if off.listing else "Deleted Listing",
                "buyer_name": off.buyer.full_name if off.buyer else "Unknown Buyer",
                "seller_name": off.seller.full_name if off.seller else "Unknown Seller"
            })
        return results

    @staticmethod
    def get_offer_by_id(db: Session, offer_id: int, user_id: int):
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
            
        # Enforce offer access authorization
        if offer.buyer_id != user_id and offer.seller_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this offer"
            )
            
        return offer

    @staticmethod
    def update_offer_status(db: Session, offer_id: int, user_id: int, new_status: str) -> Offer:
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
            
        # Ensure status is valid
        valid_statuses = ["Pending", "Accepted", "Rejected", "Expired"]
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")
            
        # If transitioning to Accepted/Rejected, must be the seller
        if new_status in ["Accepted", "Rejected"]:
            if offer.seller_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the seller can accept or reject this offer"
                )
                
            if offer.status != "Pending":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot update offer status from {offer.status} to {new_status}"
                )
                
            offer.status = new_status
            offer.updated_at = datetime.utcnow()
            
            if new_status == "Accepted":
                # Mark listing as Sold
                listing = db.query(Listing).filter(Listing.id == offer.listing_id).first()
                if listing:
                    listing.status = "Sold"
                    
                # Mark all other pending offers on this listing as Expired
                other_offers = db.query(Offer).filter(
                    Offer.listing_id == offer.listing_id,
                    Offer.id != offer.id,
                    Offer.status == "Pending"
                ).all()
                for other_off in other_offers:
                    other_off.status = "Expired"
                    other_off.updated_at = datetime.utcnow()
                    
        # If transitioning to Expired (cancelled by buyer)
        elif new_status == "Expired":
            if offer.buyer_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the buyer can cancel this offer"
                )
                
            if offer.status != "Pending":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Can only cancel a pending offer"
                )
                
            offer.status = "Expired"
            offer.updated_at = datetime.utcnow()
            
        db.commit()
        db.refresh(offer)
        try:
            from backend.app.services.trust_score_service import TrustScoreService
            from backend.app.services.notification_service import NotificationService
            TrustScoreService.calculate_trust_score(db, offer.buyer_id)
            if new_status in ["Accepted", "Rejected"]:
                notif_type = "offer_accepted" if new_status == "Accepted" else "offer_rejected"
                title = f"Offer {new_status}"
                msg = f"Your offer of ₹{offer.offer_amount} on '{offer.listing.title if offer.listing else 'Listing'}' has been {new_status.lower()} by the seller."
                NotificationService.create_notification(db, user_id=offer.buyer_id, type=notif_type, title=title, message=msg, link="/offers")
        except Exception as e:
            print(f"Error handling offer status update hooks: {e}")
        return offer

    @staticmethod
    def delete_offer(db: Session, offer_id: int, user_id: int):
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
            
        # Enforce delete permission (creator of the offer only, or seller)
        if offer.buyer_id != user_id and offer.seller_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this offer"
            )
            
        db.delete(offer)
        db.commit()
        return {"detail": "Offer deleted successfully"}
