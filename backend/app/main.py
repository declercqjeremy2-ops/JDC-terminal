from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime
import asyncio
import json
import os

app = FastAPI(title="JDC-Terminal API")

# Environment detection
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS origins based on environment
if ENVIRONMENT == "production":
    origins = [
        "https://jdc-terminal.vercel.app",
        "https://*.vercel.app",  # Allows preview deployments
    ]
else:
    origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
            "price": info.get("currentPrice", 0),
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
    """Recent news for a ticker. Uses yfinance if available, otherwise returns mock items."""
    try:
        stock = yf.Ticker(ticker)
        news_items = []

        # Try to fetch news from yfinance
        try:
            if hasattr(stock, 'news') and stock.news:
                for item in stock.news[:limit]:
                    title = item.get('title') or item.get('headline') or ''
                    if title:  # Only include if title exists
                        news_items.append({
                            "title": title,
                            "provider": item.get('publisher') or item.get('provider') or 'News',
                            "link": item.get('link') or item.get('url') or '',
                            "summary": item.get('summary') or item.get('summary_text') or '',
                            "datetime": item.get('providerPublishTime') or item.get('time') or None
                        })
        except Exception:
            pass

        # Fallback: mock news if none available
        if len(news_items) < limit:
            now = datetime.utcnow().isoformat()
            mock_news = [
                {"title": f"{ticker.upper()} posts solid quarter results","provider":"MarketNews","link":"","summary":"Company exceeded analyst expectations this quarter with strong revenue growth.","datetime": now},
                {"title": f"Analysts upgrade {ticker.upper()} price target","provider":"Research","link":"","summary":"Multiple analysts raised estimates following strong earnings report and positive guidance.","datetime": now},
                {"title": f"{ticker.upper()} announces new product line","provider":"Press Release","link":"","summary":"Company unveils innovative product to expand market presence in key segments.","datetime": now},
                {"title": f"Strategic partnership announced for {ticker.upper()}","provider":"Corporate","link":"","summary":"New collaboration expected to drive growth and enhance competitive positioning.","datetime": now},
                {"title": f"{ticker.upper()} stock reaches new 52-week high","provider":"Market","link":"","summary":"Equity continues strong uptrend on positive investor sentiment and earnings momentum.","datetime": now}
            ]
            news_items.extend(mock_news[:(limit - len(news_items))])

        return {"ticker": ticker.upper(), "news": news_items[:limit]}
    except Exception as e:
        return {"error": str(e), "ticker": ticker.upper()}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Live price updates via WebSocket"""
    await websocket.accept()
    tickers = ["AAPL", "GOOGL", "MSFT"]
    
    try:
        while True:
            prices = {}
            for ticker in tickers:
                stock = yf.Ticker(ticker)
                info = stock.info
                prices[ticker] = {
                    "price": info.get("currentPrice", 0),
                    "change": info.get("regularMarketChangePercent", 0)
                }
            
            await websocket.send_text(json.dumps(prices))
            await asyncio.sleep(5)  # Update elke 5 seconden
    except Exception as e:
        print(f"WebSocket error: {e}")