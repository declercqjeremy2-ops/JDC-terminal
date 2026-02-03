from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from datetime import datetime

app = FastAPI(title="JDC-Terminal API")

AV_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
AV_BASE_URL = "https://www.alphavantage.co/query"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "source": "Alpha Vantage API", "version": "1.0.4"}

@app.get("/api/price/{ticker}")
async def get_price(ticker: str):
    try:
        params = {"function": "GLOBAL_QUOTE", "symbol": ticker.upper(), "apikey": AV_API_KEY}
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(AV_BASE_URL, params=params)
            data = response.json()
            quote = data.get("Global Quote", {})
            if not quote: return {"error": "Geen data", "ticker": ticker.upper()}
            return {
                "ticker": ticker.upper(),
                "price": float(quote.get("05. price", 0)),
                "change": float(quote.get("10. change percent", "0").replace('%', '')),
                "dayHigh": float(quote.get("03. high", 0)),
                "dayLow": float(quote.get("04. low", 0)),
                "volume": int(quote.get("06. volume", 0)),
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        return {"error": str(e)}

# NIEUW: OHLC Endpoint voor de grafieken
@app.get("/api/ohlc/{ticker}")
async def get_ohlc(ticker: str):
    try:
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": ticker.upper(),
            "apikey": AV_API_KEY,
            "outputsize": "compact"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(AV_BASE_URL, params=params)
            data = response.json()
            
            time_series = data.get("Time Series (Daily)", {})
            if not time_series:
                return {"error": "Geen historische data gevonden", "ticker": ticker.upper()}
            
            # Formateer data voor de frontend (Recharts/Chart.js)
            formatted_data = []
            for date, stats in list(time_series.items())[:30]: # Laatste 30 dagen
                formatted_data.append({
                    "date": date,
                    "open": float(stats["1. open"]),
                    "high": float(stats["2. high"]),
                    "low": float(stats["3. low"]),
                    "close": float(stats["4. close"]),
                    "volume": int(stats["5. volume"])
                })
            
            return {"ticker": ticker.upper(), "data": formatted_data[::-1]} # Omgekeerd voor chronologische volgorde
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/news/{ticker}")
async def get_news(ticker: str):
    try:
        params = {"function": "NEWS_SENTIMENT", "tickers": ticker.upper(), "apikey": AV_API_KEY, "limit": 5}
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(AV_BASE_URL, params=params)
            data = response.json()
            feed = data.get("feed", [])
            return {
                "ticker": ticker.upper(),
                "news": [{"title": i.get("title"), "provider": i.get("source"), "link": i.get("url")} for i in feed]
            }
    except Exception as e:
        return {"error": str(e)}