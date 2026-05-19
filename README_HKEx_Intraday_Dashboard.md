# HKEx Intraday Market Dashboard

A single-file, JavaScript-powered HTML dashboard for analyzing daily / intraday HKEx stock performance.

## How to use

1. Open `hkex_intraday_dashboard.html` in Chrome, Edge, or Safari.
2. Choose a data provider:
   - `Yahoo Finance chart via public CORS proxy`: no API key, convenient demo, may be blocked or rate-limited.
   - `Yahoo Finance chart direct`: no proxy, often blocked by browser CORS.
   - `Finnhub quote API`: requires a Finnhub token.
   - `Custom quote endpoint`: recommended for production or licensed data feeds.
   - `Sample intraday data`: offline demo mode.
3. Click **Refresh Intraday Data**.
4. Edit the stock universe in the page if needed. Use CSV columns: `symbol,name,sector`.
5. Download the generated report CSV from the dashboard.

## Custom endpoint format

The Custom endpoint should accept a symbol, for example:

```text
https://your-api.example.com/quote?symbol={symbol}
```

It should return JSON with fields such as:

```json
{
  "symbol": "0700.HK",
  "price": 388.2,
  "previousClose": 381.0,
  "high": 390.0,
  "low": 380.4,
  "volume": 18200000,
  "turnoverM": 7065.2,
  "spark": [381.0, 383.2, 386.1, 388.2]
}
```

For production use, connect this to a licensed market-data feed or your internal backend.
