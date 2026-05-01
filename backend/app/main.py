from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import API_TITLE, API_VERSION, API_PREFIX
from app.api.v1.router import router as v1_router

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description="Aggregates financial data from Orders, MF Central, and Account Aggregator sources.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # tightened in production; fine for this assignment
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix=API_PREFIX)


@app.get(f"{API_PREFIX}/health", tags=["health"])
def health_check():
    return {"status": "ok", "version": API_VERSION}
