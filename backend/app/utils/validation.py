import html

def escape_html(text: str) -> str:
    """
    Escapes HTML characters in text to prevent XSS injection.
    """
    if not text:
        return ""
    return html.escape(text)

def sanitize_listing_input(title: str, description: str) -> tuple[str, str]:
    """
    Sanitizes title and description text fields.
    """
    return escape_html(title), escape_html(description)
