import json
from app.config import AA_FILE


def get_users() -> list:
    """Return list of all users from the AA file (id, name, email)."""
    with open(AA_FILE, "r") as f:
        raw = json.load(f)

    users = []
    for u in raw.get("users", []):
        user_meta = u.get("user", {})
        user_id = user_meta.get("userId", "")
        email = user_meta.get("email", "")
        name = ""
        for acc in u.get("accounts", []):
            profile = acc.get("profile", [])
            if profile and isinstance(profile, list):
                name = profile[0].get("name", "").strip()
                break
        if user_id:
            users.append({"id": user_id, "name": name, "email": email})

    return users


def get_user_email(user_id: str) -> str:
    """Return the email address for a given userId, or '' if not found."""
    for u in get_users():
        if u["id"] == user_id:
            return u["email"]
    return ""
