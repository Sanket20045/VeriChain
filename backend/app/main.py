from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database.db import init_db
from app.routes import auth, certificates, issuers, verification, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    os.makedirs("uploads", exist_ok=True)
    yield
    # Shutdown

app = FastAPI(
    title="VeriChain API",
    description="AI and Blockchain-Based College Certificate Verification System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded certificates (served securely)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from fastapi import APIRouter

# Primary API router with /api prefix
api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
api_router.include_router(issuers.router, prefix="/issuers", tags=["Issuers"])
api_router.include_router(verification.router, prefix="/verify", tags=["Verification"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(api_router)

# Direct routes for backward-compatibility
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
app.include_router(issuers.router, prefix="/issuers", tags=["Issuers"])
app.include_router(verification.router, prefix="/verify", tags=["Verification"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

@app.get("/")
async def root():
    return {
        "name": "VeriChain API",
        "version": "1.0.0",
        "description": "College Certificate Verification Platform",
        "status": "running",
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
