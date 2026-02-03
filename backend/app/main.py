from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime
import asyncio
import json
import os

app = FastAPI(title="JDC-Terminal API")

# Environment detection (Render vult deze in)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS origins configuratie
if ENVIRONMENT == "production":
    origins = [
        "https://jdc-terminal.vercel.app",
        "https://jdc-terminal-api.onrender.com",
        # Voeg hier eventueel je custom domein toe als je die hebt
    ]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    # We gebruiken allow_origin_regex voor Vercel preview deploys
    allow_origins=origins,
    allow_origin_regex="https://jdc-terminal-.*\.vercel\.app", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "JDC-Terminal API",
        "version": "1.0.0",
        "environment": ENVIRONMENT
    }

@app.get("/api/price/{ticker}")
def get_price(ticker: str):
    """Huidige prijs en metrics van een ticker"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        return {
            "ticker": ticker.upper(),
            "price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
            "change": info.get("regularMarketChangePercent", 0),
            "dayHigh": info.get("dayHigh", 0),
            "dayLow": info.get("dayLow", 0),
            "week52High": info.get("fiftyTwoWeekHigh", 0),
            "week52Low": info.get("fiftyTwoWeekLow", 0),
            "volume": info.get("volume", 0),
            "marketCap": info.get("marketCap", 0),
            "pe": info.get("trailingPE", 0),
            "dividend": info.get("dividendRate", 0),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e), "ticker": ticker.upper()}

@app.get("/api/ohlc/{ticker}")
def get_ohlc(ticker: str, period: str = "1mo"):
    """Historische OHLC data"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        
        data = []
        for index, row in hist.iterrows():
            data.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"])
            })
        
        return {"ticker": ticker.upper(), "data": data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/profile/{ticker}")
def get_profile(ticker: str):
    """Company profile and basic metadata for a ticker"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        profile = {
            "ticker": ticker.upper(),
            "name": info.get("shortName") or info.get("longName") or ticker.upper(),
            "summary": info.get("longBusinessSummary", ""),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "employees": info.get("fullTimeEmployees"),
            "website": info.get("website"),
            "logo": info.get("logo_url") or info.get("image") or None
        }
        return profile
    except Exception as e:
        return {"error": str(e), "ticker": ticker.upper()}

@app.get("/api/news/{ticker}")
def get_news(ticker: str, limit: int = 5):
    """Recent news for a ticker"""
    try:
        stock = yf.Ticker(ticker)
        news_items = []

        try:
            if hasattr(stock, 'news') and stock.news:
                for item in stock.news[:limit]:
                    title = item.get('title') or item.get('headline') or ''
                    if title:
                        news_items.append({
                            "title": title,
                            "provider": item.get('publisher') or item.get('provider') or 'News',
                            "link": item.get('link') or item.get('url') or '',
                            "summary": item.get('summary') or item.get('summary_text') or '',
                            "datetime": item.get('providerPublishTime') or item.get('time') or None
                        })
        except Exception:
            pass

        if len(news_items) < limit:
            now = datetime.utcnow().isoformat()
            mock_news = [
                {"title": f"{ticker.upper()} posts solid quarter results","provider":"MarketNews","link":"","summary":"Company exceeded analyst expectations.","datetime": now},
                {"title": f"Analysts upgrade {ticker.upper()}","provider":"Research","link":"","summary":"Positive guidance drives upgrades.","datetime": now}
            ]
            news_items.extend(mock_news[:(limit - len(news_items))])

        return {"ticker": ticker.upper(), "news": news_items[:limit]}
    except Exception as e:
        return {"error": str(e), "ticker": ticker.upper()}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Live price updates via WebSocket"""
    await websocket.accept()
    # In een echte app zouden we de tickers van de client ontvangen
    tickers = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]
    
    try:
        while True:
            prices = {}
            for ticker in tickers:
                try:
                    stock = yf.Ticker(ticker)
                    # We gebruiken fast_info voor snelheid in websockets
                    info = stock.fast_info 
                    prices[ticker] = {
                        "price": round(info.last_price, 2),
                        "change": round(((info.last_price / info.previous_close) - 1) * 100, 2)
                    }
                except:
                    continue
            
            await websocket.send_text(json.dumps(prices))
            await asyncio.sleep(10) # Iets minder agressief voor de gratis server
    except Exception as e:
        print(f"WebSocket error: {e}")