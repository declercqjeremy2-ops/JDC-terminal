from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from datetime import datetime

app = FastAPI(title="JDC-Terminal API")

# API Key en URL instellingen
AV_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
AV_BASE_URL = "https://www.alphavantage.co/query"

# CORS instellingen geoptimaliseerd voor Safari en Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "source": "Alpha Vantage API", 
        "version": "1.0.5",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/price/{ticker}")
async def get_price(ticker: str):
    """Haalt de actuele prijs op"""
    try:
        params = {
            "function": "GLOBAL_QUOTE", 
            "symbol": ticker.upper(), 
            "apikey": AV_API_KEY
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(AV_BASE_URL, params=params)
            data = response.json()
            quote = data.get("Global Quote", {})
            
            if not quote:
                return {"error": "Geen data gevonden", "ticker": ticker.upper()}
                
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

@app.get("/api/ohlc/{ticker}")
async def get_ohlc(ticker: str):
    """Haalt historische data op voor de grafiek"""
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
                return {"error": "Geen historische data", "ticker": ticker.upper()}
            
            formatted_data = []
            # Neem de laatste 30 dagen
            for date, stats in list(time_series.items())[:30]:
                formatted_data.append({
                    "date": date,
                    "open": float(stats["1. open"]),
                    "high": float(stats["2. high"]),
                    "low": float(stats["3. low"]),
                    "close": float(stats["4. close"]),
                    "volume": int(stats["5. volume"])
                })
            
            return {"ticker": ticker.upper(), "data": formatted_data[::-1]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/news/{ticker}")
async def get_news(ticker: str):
    """Haalt nieuws sentiment op"""
    try:
        params = {
            "function": "NEWS_SENTIMENT", 
            "tickers": ticker.upper(), 
            "apikey": AV_API_KEY, 
            "limit": 5
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(AV_BASE_URL, params=params)
            data = response.json()
            feed = data.get("feed", [])
            return {
                "ticker": ticker.upper(),
                "news": [
                    {
                        "title": item.get("title"), 
                        "provider": item.get("source"), 
                        "link": item.get("url")
                    } for item in feed
                ]
            }
    except Exception as e:
        return {"error": str(e)}