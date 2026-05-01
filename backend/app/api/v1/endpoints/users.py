from fastapi import APIRouter
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
def list_users():
    """
    Returns a list of all available users (id, name, email).
    The special value 'all' can be passed to any endpoint's user_id param
    to get aggregated data across all users.
    """
    return user_service.get_users()
