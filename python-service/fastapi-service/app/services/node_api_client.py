from typing import Any

import httpx

from app.core.config import Settings, get_settings


class NodeApiError(RuntimeError):
    """A safe service-level error for failed Node API communication."""


class NodeApiClient:
    def __init__(self, settings: Settings | None = None, timeout_seconds: float = 10.0) -> None:
        config = settings or get_settings()
        self._client = httpx.AsyncClient(
            base_url=str(config.node_api_base_url), timeout=timeout_seconds
        )

    async def request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        try:
            response = await self._client.request(method, path, **kwargs)
            response.raise_for_status()
            return response
        except httpx.HTTPError as exc:
            raise NodeApiError("Node API request failed") from exc

    async def close(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "NodeApiClient":
        return self

    async def __aexit__(self, *_: object) -> None:
        await self.close()
