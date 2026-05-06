from fastapi import APIRouter, Depends, Query, HTTPException
from app.dependencies import verify_api_key
from app.services import vnstock_service

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("/list")
async def list_stocks(
    source: str = Query("KBS", description="Data source: KBS or VCI"),
    _: str = Depends(verify_api_key),
):
    """Lấy danh sách tất cả mã chứng khoán niêm yết."""
    try:
        data = vnstock_service.get_stock_list(source=source)
        return {"success": True, "total": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def stock_history(
    symbol: str = Query(..., description="Mã chứng khoán, ví dụ: ACB"),
    start: str = Query(..., description="Ngày bắt đầu YYYY-MM-DD"),
    end: str = Query(..., description="Ngày kết thúc YYYY-MM-DD"),
    interval: str = Query("1D", description="Khung thời gian: 1D, 1W, 1M"),
    source: str = Query("KBS", description="Data source: KBS hoặc VCI"),
    _: str = Depends(verify_api_key),
):
    """Lấy dữ liệu giá lịch sử OHLCV của một mã chứng khoán."""
    try:
        data = vnstock_service.get_stock_history(
            symbol=symbol.upper(),
            start=start,
            end=end,
            interval=interval,
            source=source,
        )
        return {"success": True, "symbol": symbol.upper(), "total": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quotes")
async def stock_quotes(
    symbols: str = Query(..., description="Danh sách mã cách nhau bởi dấu phẩy, tối đa 50 mã"),
    source: str = Query("KBS", description="Data source: KBS hoặc VCI"),
    _: str = Depends(verify_api_key),
):
    """Lấy OHLCV + % biến động ngày giao dịch gần nhất của nhiều mã cùng lúc."""
    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()][:50]
    try:
        data = vnstock_service.get_latest_quotes(symbols=symbol_list, source=source)
        return {"success": True, "total": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/company/{symbol}")
async def company_info(
    symbol: str,
    source: str = Query("KBS", description="Data source: KBS hoặc VCI"),
    _: str = Depends(verify_api_key),
):
    """Lấy thông tin tổng quan của công ty theo mã chứng khoán."""
    try:
        data = vnstock_service.get_company_info(symbol=symbol.upper(), source=source)
        return {"success": True, "symbol": symbol.upper(), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
