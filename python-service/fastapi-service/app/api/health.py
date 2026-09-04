from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str | bool]:
    return {"success": True, "service": "CareRoute LK Python Service", "status": "healthy"}
