from datetime import datetime
import os

import pandas as pd
import yfinance as yf
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="JDC-Terminal API")

STOCK_DATABASE = [
    {"ticker": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
    {"ticker": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
    {"ticker": "MSFT", "name": "Microsoft Corp.", "exchange": "NASDAQ"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},
    {"ticker": "NVDA", "name": "NVIDIA Corp.", "exchange": "NASDAQ"},
    {"ticker": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
    {"ticker": "META", "name": "Meta Platforms", "exchange": "NASDAQ"},
    {"ticker": "NFLX", "name": "Netflix Inc.", "exchange": "NASDAQ"},
    {"ticker": "ASML.AS", "name": "ASML Holding", "exchange": "Euronext Amsterdam"},
    {"ticker": "NVO.CO", "name": "Novo Nordisk", "exchange": "Copenhagen"},
    {"ticker": "SAP.DE", "name": "SAP SE", "exchange": "Xetra"},
    {"ticker": "ADYEN.AS", "name": "Adyen", "exchange": "Euronext Amsterdam"},
    {"ticker": "UBER.AS", "name": "Uber Technologies", "exchange": "Euronext Amsterdam"},
    {"ticker": "ABI.BR", "name": "Anheuser-Busch InBev", "exchange": "Brussels"},
    {"ticker": "KBC.BR", "name": "KBC Group", "exchange": "Brussels"},
    {"ticker": "PROX.BR", "name": "Proximus", "exchange": "Brussels"},
    {"ticker": "ACKB.BR", "name": "Ackermans & van Haaren", "exchange": "Brussels"},
    {"ticker": "UMI.BR", "name": "Umicore", "exchange": "Brussels"},
    {"ticker": "JPM", "name": "JPMorgan Chase", "exchange": "NYSE"},
    {"ticker": "BAC", "name": "Bank of America", "exchange": "NYSE"},
    {"ticker": "WFC", "name": "Wells Fargo", "exchange": "NYSE"},
    {"ticker": "GS", "name": "Goldman Sachs", "exchange": "NYSE"},
    {"ticker": "MS", "name": "Morgan Stanley", "exchange": "NYSE"},
    {"ticker": "XOM", "name": "Exxon Mobil", "exchange": "NYSE"},
    {"ticker": "CVX", "name": "Chevron", "exchange": "NYSE"},
    {"ticker": "COP", "name": "ConocoPhillips", "exchange": "NYSE"},
    {"ticker": "EOG", "name": "EOG Resources", "exchange": "NYSE"},
    {"ticker": "SLB", "name": "Schlumberger", "exchange": "NYSE"},
]


def normalize_text(value: str) -> str:
    return (value or '').strip().lower()


def json_safe_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    return str(value)


def dataframe_to_json(df: pd.DataFrame) -> list[dict]:
    if df is None or df.empty:
        return []

    rows = []
    for index, row in df.iterrows():
        item = {"period": str(index)}
        for column in df.columns:
            item[str(column)] = json_safe_value(row[column])
        rows.append(item)

    return rows


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

@app.get("/api/search")
def search_stocks(q: str = Query(..., min_length=1), limit: int = 10):
    query = normalize_text(q)
    candidates = []

    for stock in STOCK_DATABASE:
        ticker = normalize_text(stock['ticker'])
        name = normalize_text(stock['name'])
        if query in ticker or query in name:
            score = 0 if ticker.startswith(query) else 1
            candidates.append((score, stock))

    candidates.sort(key=lambda item: (item[0], item[1]['name']))
    return [stock for _, stock in candidates][:limit]

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
async def get_ohlc(ticker: str, period: str = '1mo'):
    """Haalt historische data op voor de grafiek"""
    try:
        stock = yf.Ticker(ticker.upper())
        hist = stock.history(period=period)
        
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

@app.get("/api/stock/{ticker}/overview")
async def get_stock_overview(ticker: str):
    try:
        stock = yf.Ticker(ticker.upper())
        info = stock.info

        if not info or "regularMarketPrice" not in info:
            return {"error": "Geen data gevonden", "ticker": ticker.upper()}

        previous_close = info.get("previousClose", 0) or 0
        current_price = info.get("regularMarketPrice", 0) or 0
        change_percent = ((current_price - previous_close) / previous_close * 100) if previous_close else 0
        dividend_yield = info.get("dividendYield")

        return {
            "ticker": ticker.upper(),
            "name": info.get("longName", "") or "",
            "exchange": info.get("exchange", "") or "",
            "price": current_price,
            "change": change_percent,
            "marketCap": info.get("marketCap", 0) or 0,
            "pe": info.get("trailingPE"),
            "forwardPE": info.get("forwardPE"),
            "dividendYield": float(dividend_yield * 100) if dividend_yield is not None else None,
            "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh"),
            "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow"),
            "volume": info.get("volume", 0) or 0,
            "averageVolume": info.get("averageDailyVolume10Day") or info.get("averageVolume"),
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
            "summary": info.get("longBusinessSummary", ""),
            "website": info.get("website", ""),
            "logo": info.get("logo_url", ""),
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/stock/{ticker}/financials")
async def get_financials(ticker: str, period: str = "annual"):
    try:
        stock = yf.Ticker(ticker.upper())

        if period == "quarterly":
            income = stock.quarterly_financials
            balance = stock.quarterly_balance_sheet
            cashflow = stock.quarterly_cashflow
        else:
            income = stock.financials
            balance = stock.balance_sheet
            cashflow = stock.cashflow

        return {
            "ticker": ticker.upper(),
            "period": period,
            "incomeStatement": dataframe_to_json(income),
            "balanceSheet": dataframe_to_json(balance),
            "cashFlow": dataframe_to_json(cashflow),
        }
    except Exception as e:
        return {"error": str(e)}

