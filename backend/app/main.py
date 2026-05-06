from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from datetime import datetime
import yfinance as yf

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
        stock = yf.Ticker(ticker.upper())
        info = stock.info
        
        if not info or 'regularMarketPrice' not in info:
            return {"error": "Geen data gevonden", "ticker": ticker.upper()}
        
        # Bereken change percent
        previous_close = info.get('previousClose', 0)
        current_price = info.get('regularMarketPrice', 0)
        change_percent = ((current_price - previous_close) / previous_close * 100) if previous_close else 0
        
        return {
            "ticker": ticker.upper(),
            "price": current_price,
            "change": change_percent,
            "dayHigh": info.get('dayHigh', 0),
            "dayLow": info.get('dayLow', 0),
            "volume": info.get('volume', 0),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/ohlc/{ticker}")
async def get_ohlc(ticker: str):
    """Haalt historische data op voor de grafiek"""
    try:
        stock = yf.Ticker(ticker.upper())
        hist = stock.history(period="1mo")
        
        if hist.empty:
            return {"error": "Geen historische data", "ticker": ticker.upper()}
        
        formatted_data = []
        for date, row in hist.iterrows():
            formatted_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
        
        return {"ticker": ticker.upper(), "data": formatted_data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/profile/{ticker}")
async def get_profile(ticker: str):
    """Haalt profiel informatie op"""
    try:
        stock = yf.Ticker(ticker.upper())
        info = stock.info
        
        if not info:
            return {"error": "Geen profiel data", "ticker": ticker.upper()}
        
        return {
            "ticker": ticker.upper(),
            "name": info.get('longName', ''),
            "summary": info.get('longBusinessSummary', ''),
            "sector": info.get('sector', ''),
            "industry": info.get('industry', ''),
            "employees": info.get('fullTimeEmployees', 0),
            "website": info.get('website', ''),
            "logo": info.get('logo_url', '')
        }
    except Exception as e:
        return {"error": str(e)}