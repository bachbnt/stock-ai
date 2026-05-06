from vnstock import Listing, Quote, Company, Market, Reference, Trading
from app.config import settings


def _register_api_key():
    if settings.vnstock_api_key:
        from vnstock import register_user
        register_user(api_key=settings.vnstock_api_key)


def get_stock_list(source: str = "KBS") -> list[dict]:
    _register_api_key()
    listing = Listing(source=source)
    df = listing.all_symbols()
    return df.to_dict(orient="records")


def get_stock_history(
    symbol: str,
    start: str,
    end: str,
    interval: str = "1D",
    source: str = "KBS",
) -> list[dict]:
    _register_api_key()
    quote = Quote(symbol=symbol, source=source)
    df = quote.history(start=start, end=end, interval=interval)
    return df.to_dict(orient="records")


def get_company_info(symbol: str, source: str = "KBS") -> dict:
    _register_api_key()
    company = Company(symbol=symbol, source=source)
    overview = company.overview()
    if hasattr(overview, "to_dict"):
        result = overview.to_dict(orient="records")
        return result[0] if result else {}
    return overview if isinstance(overview, dict) else {}


def get_latest_quotes(symbols: list[str], source: str = "KBS") -> dict[str, dict]:
    """Lấy giá hiện tại cho nhiều mã — 1 API call duy nhất qua price_board."""
    _register_api_key()
    try:
        df = Trading(source=source).price_board(symbols)
        if df is None or len(df) == 0:
            return {s: {} for s in symbols}

        # Map linh hoạt vì tên cột có thể khác nhau tuỳ version vnstock
        cols = {c.lower(): c for c in df.columns}

        def pick(row: dict, *candidates: str):
            for c in candidates:
                v = row.get(cols.get(c))
                if v is not None and v != "":
                    return v
            return None

        results: dict[str, dict] = {}
        for row in df.to_dict(orient="records"):
            sym = str(pick(row, "symbol", "ticker") or "")
            if not sym:
                continue
            close  = pick(row, "match_price", "price", "close", "last_price")
            high   = pick(row, "high", "high_price", "highest_price")
            low    = pick(row, "low", "low_price", "lowest_price")
            volume = pick(row, "match_volume", "volume", "match_qtty", "total_volume")
            ref    = pick(row, "ref_price", "reference_price", "ref")
            chg_pct = pick(row, "pct_change", "change_pct", "percent_change")

            if chg_pct is None and ref and close:
                ref_f = float(ref)
                chg_pct = (float(close) - ref_f) / ref_f * 100 if ref_f > 0 else 0.0

            results[sym] = {
                "close":      float(close)  if close  is not None else 0,
                "high":       float(high)   if high   is not None else 0,
                "low":        float(low)    if low    is not None else 0,
                "volume":     int(float(volume)) if volume is not None else 0,
                "change_pct": round(float(chg_pct), 2) if chg_pct is not None else 0,
            }
        return results
    except BaseException:
        return {s: {} for s in symbols}
