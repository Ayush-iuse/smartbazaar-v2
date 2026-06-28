import json
from sqlalchemy.orm import Session
from backend.app.models.enterprise import SavedSearch
from backend.app.models.listing import Listing
from backend.app.services.notification_service import NotificationService

class SavedSearchService:
    @staticmethod
    def save_search(db: Session, user_id: int, query: str, filters: dict) -> SavedSearch:
        db_search = SavedSearch(
            user_id=user_id,
            query=query,
            filters=json.dumps(filters) if filters else "{}"
        )
        db.add(db_search)
        db.commit()
        db.refresh(db_search)
        return db_search

    @staticmethod
    def get_user_searches(db: Session, user_id: int):
        return db.query(SavedSearch).filter(SavedSearch.user_id == user_id).all()

    @staticmethod
    def delete_search(db: Session, user_id: int, search_id: int) -> bool:
        db_search = db.query(SavedSearch).filter(SavedSearch.id == search_id, SavedSearch.user_id == user_id).first()
        if db_search:
            db.delete(db_search)
            db.commit()
            return True
        return False

    @staticmethod
    def check_listing_against_saved_searches(db: Session, listing: Listing):
        """
        Check a newly created listing against all saved searches.
        If matches, create a notification.
        """
        saved_searches = db.query(SavedSearch).all()
        for ss in saved_searches:
            # Prevent notifying the seller themselves
            if ss.user_id == listing.seller_id:
                continue

            matches = True

            # Match query (case insensitive title check)
            if ss.query:
                query_words = ss.query.lower().split()
                title_lower = listing.title.lower()
                desc_lower = (listing.description or "").lower()
                if not any(word in title_lower or word in desc_lower for word in query_words):
                    matches = False

            # Match filters
            if ss.filters:
                try:
                    filters_dict = json.loads(ss.filters)
                    
                    # Category
                    category_filter = filters_dict.get("category")
                    if category_filter and category_filter.lower() != listing.category.lower():
                        matches = False
                        
                    # Location
                    location_filter = filters_dict.get("location")
                    if location_filter and location_filter.lower() != listing.location.lower():
                        matches = False
                        
                    # Price bounds
                    min_price = filters_dict.get("min_price")
                    if min_price is not None and listing.price < float(min_price):
                        matches = False
                        
                    max_price = filters_dict.get("max_price")
                    if max_price is not None and listing.price > float(max_price):
                        matches = False
                except Exception:
                    # Ignore malformed filters
                    pass

            if matches:
                # Create match notification
                NotificationService.create_notification(
                    db=db,
                    user_id=ss.user_id,
                    type="saved_search_match",
                    title="Saved Search Match Found!",
                    message=f"A new listing matching your saved search '{ss.query}' has been posted: {listing.title} for ₹{listing.price}.",
                    link=f"/listing/{listing.id}"
                )
