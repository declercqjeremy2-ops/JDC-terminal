from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from datetime import datetime

app = FastAPI(title="JDC-Terminal API")

# API Key ophalen uit Environment Variables
AV_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
AV_BASE_URL = "https://www.alphavantage.co/query"

# GEOPTIMALISEERDE CORS VOOR SAFARI
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
    return {
        "status": "ok", 
        "source": "Alpha Vantage API", 
        "version": "1.0.3",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/price/{ticker}")
async def get_price(ticker: str):
    """Haalt prijsinformatie op via Alpha Vantage"""
    try:
        if not AV_API_KEY:
            return {"error": "API Key ontbreekt in backend"}

        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker.upper(),
            "apikey": AV_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(AV_BASE_URL, params=params)
            data = response.json()
            
            # Alpha Vantage limiet controle
            if "Note" in data:
                return {"error": "API limiet (5/min) bereikt", "ticker": ticker.upper()}
                
            quote = data.get("Global Quote", {})
            if not quote:
                return {"error": "Ticker niet gevonden", "ticker": ticker.upper()}
                
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
        return {"error": str(e), "ticker": ticker.upper()}

@app.get("/api/news/{ticker}")
async def get_news(ticker: str):
    """Haalt nieuws op via Alpha Vantage"""
    try:
        if not AV_API_KEY:
            return {"error": "API Key ontbreekt"}

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
                        "link": item.get("url"),
                        "datetime": item.get("time_published")
                    } for item in feed[:5]
                ]
            }
    except Exception as e:
        return {"error": str(e), "ticker": ticker.upper()}