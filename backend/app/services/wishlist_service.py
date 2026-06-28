from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import json
from backend.app.models.saved_listing import SavedListing
from backend.app.models.listing import Listing

class WishlistService:
    @staticmethod
    def toggle_wishlist(db: Session, listing_id: int, user_id: int):
        # Fetch listing
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        # Enforce self-wishlist guard (403 as requested)
        if listing.seller_id == user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot save own listing"
            )
            
        # Check if already saved
        saved = db.query(SavedListing).filter(
            SavedListing.user_id == user_id,
            SavedListing.listing_id == listing_id
        ).first()
        
        if saved:
            db.delete(saved)
            db.commit()
            return {"listing_id": listing_id, "saved": False}
        else:
            new_save = SavedListing(
                user_id=user_id,
                listing_id=listing_id
            )
            db.add(new_save)
            db.commit()
            return {"listing_id": listing_id, "saved": True}

    @staticmethod
    def get_wishlist(db: Session, user_id: int):
        saved_items = db.query(SavedListing).filter(SavedListing.user_id == user_id).all()
        results = []
        for item in saved_items:
            listing = item.listing
            if not listing:
                continue
                
            # Parse listing images
            image_url = ""
            try:
                images = json.loads(listing.image_urls or "[]")
                if isinstance(images, list) and len(images) > 0:
                    image_url = images[0]
            except Exception:
                image_url = listing.image_urls or ""
                
            results.append({
                "id": item.id,
                "user_id": item.user_id,
                "listing_id": item.listing_id,
                "created_at": item.created_at,
                "listing_title": listing.title,
                "listing_price": listing.price,
                "listing_image": image_url
            })
        return results
