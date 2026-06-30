import os
import uuid
import logging
from typing import Optional
import cloudinary
import cloudinary.uploader

logger = logging.getLogger(__name__)

# Initialize Cloudinary configuration if credentials exist in the environment
cloudinary_enabled = False
cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")

if cloud_name and api_key and api_secret:
    try:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        cloudinary_enabled = True
        logger.info("Cloudinary SDK configured and enabled successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Cloudinary SDK configuration: {e}")
        cloudinary_enabled = False
else:
    logger.info("Cloudinary credentials are not set. Media uploads will fall back to local disk storage.")

def upload_to_cloudinary(file_content: bytes, filename: str, resource_type: str = "auto") -> Optional[str]:
    """
    Uploads a file to Cloudinary and returns the secure URL.
    Returns None if upload fails or Cloudinary is not configured.
    """
    if not cloudinary_enabled:
        logger.debug("Cloudinary is disabled. Skipping cloud upload.")
        return None
    try:
        # Extract public ID base from filename or generate unique UUID
        public_id = f"sb_file_{uuid.uuid4().hex}"
        folder = "smartbazaar/chat"
        
        options = {
            "folder": folder,
            "public_id": public_id,
            "resource_type": resource_type,
        }
        
        # Apply transformation/optimization rules for images
        if resource_type == "image":
            options.update({
                "transformation": [
                    {"width": 1200, "crop": "limit"},  # Limit max image width to 1200px
                    {"quality": "auto"},               # Auto optimize quality based on format
                    {"fetch_format": "auto"}           # Choose optimal format (WebP, AVIF etc.) dynamically
                ]
            })
            
        logger.info(f"Uploading file '{filename}' to Cloudinary folder '{folder}'...")
        response = cloudinary.uploader.upload(file_content, **options)
        secure_url = response.get("secure_url")
        logger.info(f"Cloudinary upload successful. URL: {secure_url}")
        return secure_url
    except Exception as e:
        logger.error(f"Cloudinary upload failed for file '{filename}': {e}", exc_info=True)
        return None

def delete_from_cloudinary(public_id: str, resource_type: str = "image") -> bool:
    """
    Deletes an asset from Cloudinary using its public_id.
    """
    if not cloudinary_enabled:
        return False
    try:
        logger.info(f"Deleting asset '{public_id}' from Cloudinary...")
        response = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        status = response.get("result") == "ok"
        logger.info(f"Cloudinary delete result for public_id '{public_id}': {response.get('result')}")
        return status
    except Exception as e:
        logger.error(f"Cloudinary deletion failed for public_id '{public_id}': {e}")
        return False

def get_cloudinary_thumbnail(secure_url: str, width: int = 200, height: int = 200) -> str:
    """
    Dynamically generates a thumbnail URL for a given Cloudinary secure URL.
    Injects crop and scale transformation parameters into the asset path.
    """
    if not secure_url or "res.cloudinary.com" not in secure_url:
        return secure_url
    
    # Example insertion: /upload/w_200,h_200,c_thumb,g_auto/
    transformation_str = f"/upload/c_thumb,w_{width},h_{height},g_auto/"
    if "/upload/" in secure_url:
        return secure_url.replace("/upload/", transformation_str, 1)
    return secure_url
