from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import stocks

app = FastAPI(
    title="Stock Market API",
    description="API lấy dữ liệu chứng khoán Việt Nam dựa trên thư viện vnstock",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Stock Market API is running"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
