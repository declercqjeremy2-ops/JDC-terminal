from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI()

# Belangrijk voor Safari:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

AV_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

@app.get("/api/price/{ticker}")
async def get_price(ticker: str):
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={AV_API_KEY}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        quote = data.get("Global Quote", {})
        return {
            "ticker": ticker,
            "price": float(quote.get("05. price", 0)),
            "change": float(quote.get("10. change percent", "0").replace('%', ''))
        }

@app.get("/")
def health():
    return {"status": "ok"}