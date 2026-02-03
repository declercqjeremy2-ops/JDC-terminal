from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime
import asyncio
import json
import os

app = FastAPI(title="JDC-Terminal API")

# Environment detection (Render vult deze in via Dashboard)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS CONFIGURATIE - Geoptimaliseerd voor Safari & Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Toestaan voor alle domeinen
    allow_credentials=False,       # MOET False zijn als origins "*" is (fix voor Safari)
    allow_methods=["*"],           # Alle methodes (GET, POST, etc.) toestaan
    allow_headers=["*"],           # Alle headers toestaan
)

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "JDC-Terminal API",
        "version": "1.0.1",
        "environment": ENVIRONMENT
    }

@app.get("/api/price/{ticker}")
def get_price(ticker: str):
    """Huidige prijs en metrics van een ticker"""
    try:
        stock = yf.Ticker(ticker)
        # Gebruik fast_info voor snelheid of info voor details
        info = stock.info
        
        # Soms geeft currentPrice None, dan pakken we regularMarketPrice
        current_price = info.get("currentPrice") or info.get("regularMarketPrice") or 0
        
        return {
            "ticker": ticker.upper(),
            "price": current_price,
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
    """Company profile data"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "ticker": ticker.upper(),
            "name": info.get("shortName") or info.get("longName") or ticker.upper(),
            "summary": info.get("longBusinessSummary", ""),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "employees": info.get("fullTimeEmployees"),
            "website": info.get("website")
        }
    except Exception as e:
        return {"error": str(e), "ticker": ticker.upper()}

@app.get("/api/news/{ticker}")
def get_news(ticker: str, limit: int = 5):
    """Recent news voor een ticker"""
    try:
        stock = yf.Ticker(ticker)
        news_items = []

        try:
            if hasattr(stock, 'news') and stock.news:
                for item in stock.news[:limit]:
                    news_items.append({
                        "title": item.get('title', ''),
                        "provider": item.get('publisher', 'News'),
                        "link": item.get('link', ''),
                        "datetime": item.get('providerPublishTime', None)
                    })
        except:
            pass

        # Fallback als yfinance geen nieuws geeft
        if not news_items:
            news_items = [{"title": f"Update over {ticker.upper()}", "provider": "System", "link": "#", "datetime": None}]

        return {"ticker": ticker.upper(), "news": news_items}
    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Live price updates via WebSocket"""
    await websocket.accept()
    tickers = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]
    
    try:
        while True:
            prices = {}
            for ticker in tickers:
                try:
                    stock = yf.Ticker(ticker)
                    # Gebruik fast_info voor minder overhead op de server
                    last_price = stock.fast_info.last_price
                    prices[ticker] = {"price": round(last_price, 2)}
                except:
                    continue
            
            await websocket.send_text(json.dumps(prices))
            await asyncio.sleep(15) # 15 sec pauze om Render niet te overbelasten
    except Exception as e:
        print(f"WebSocket error: {e}")