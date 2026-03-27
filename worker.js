const NSE_API = "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.nseindia.com/",
  Connection: "keep-alive",
};

// Fallback data if NSE API is unreachable
const FALLBACK_DATA = [
  { symbol: "NIFTY 50", lastPrice: 22250.0, pChange: 0.5 },
  { symbol: "RELIANCE", lastPrice: 2950.45, pChange: 1.2 },
  { symbol: "HDFCBANK", lastPrice: 1450.2, pChange: -0.5 },
  { symbol: "ICICIBANK", lastPrice: 1080.75, pChange: 2.1 },
  { symbol: "INFY", lastPrice: 1640.1, pChange: -1.2 },
  { symbol: "TCS", lastPrice: 4120.5, pChange: 0.8 },
  { symbol: "ITC", lastPrice: 420.3, pChange: 0.2 },
  { symbol: "LARSEN", lastPrice: 3540.8, pChange: 3.4 },
  { symbol: "SBIN", lastPrice: 760.25, pChange: 1.5 },
  { symbol: "BHARTIARTL", lastPrice: 1150.6, pChange: 2.8 },
  { symbol: "BAJFINANCE", lastPrice: 6800.0, pChange: -2.4 },
  { symbol: "KOTAKBANK", lastPrice: 1750.9, pChange: -0.8 },
  { symbol: "AXISBANK", lastPrice: 1050.4, pChange: 1.1 },
  { symbol: "HINDUNILVR", lastPrice: 2400.15, pChange: 0.4 },
  { symbol: "M&M", lastPrice: 1950.8, pChange: 4.2 },
  { symbol: "MARUTI", lastPrice: 11200.5, pChange: -1.5 },
  { symbol: "HCLTECH", lastPrice: 1580.3, pChange: 0.9 },
  { symbol: "ASIANPAINT", lastPrice: 2850.7, pChange: -0.3 },
  { symbol: "SUNPHARMA", lastPrice: 1540.2, pChange: 1.8 },
  { symbol: "TITAN", lastPrice: 3650.4, pChange: 2.5 },
  { symbol: "TATASTEEL", lastPrice: 155.6, pChange: 5.1 },
  { symbol: "BAJAJFINSV", lastPrice: 1600.8, pChange: -1.1 },
  { symbol: "NTPC", lastPrice: 340.5, pChange: 2.2 },
  { symbol: "TATAMOTORS", lastPrice: 980.3, pChange: 3.1 },
  { symbol: "POWERGRID", lastPrice: 280.9, pChange: 1.4 },
  { symbol: "ULTRACEMCO", lastPrice: 9850.0, pChange: -0.6 },
  { symbol: "WIPRO", lastPrice: 520.4, pChange: 0.5 },
  { symbol: "TECHM", lastPrice: 1250.7, pChange: -3.5 },
  { symbol: "NESTLEIND", lastPrice: 2550.8, pChange: 0.1 },
  { symbol: "ONGC", lastPrice: 275.4, pChange: 1.9 },
  { symbol: "JSWSTEEL", lastPrice: 850.6, pChange: 2.7 },
  { symbol: "GRASIM", lastPrice: 2200.3, pChange: -0.9 },
  { symbol: "ADANIENT", lastPrice: 3150.5, pChange: 4.8 },
  { symbol: "HINDALCO", lastPrice: 580.2, pChange: 3.5 },
  { symbol: "ADANIPORTS", lastPrice: 1340.9, pChange: 2.9 },
  { symbol: "DIVISLAB", lastPrice: 3800.4, pChange: -1.8 },
  { symbol: "DRREDDY", lastPrice: 6200.5, pChange: 0.7 },
  { symbol: "COALINDIA", lastPrice: 450.6, pChange: 1.6 },
  { symbol: "CIPLA", lastPrice: 1480.2, pChange: 0.3 },
  { symbol: "BAJAJ-AUTO", lastPrice: 8500.1, pChange: 2.4 },
  { symbol: "BPCL", lastPrice: 620.8, pChange: 1.2 },
  { symbol: "EICHERMOT", lastPrice: 3950.4, pChange: -0.7 },
  { symbol: "APOLLOHOSP", lastPrice: 6100.9, pChange: 1.5 },
  { symbol: "BRITANNIA", lastPrice: 5050.3, pChange: -0.2 },
  { symbol: "TATACONSUM", lastPrice: 1150.6, pChange: 0.6 },
  { symbol: "HEROMOTOCO", lastPrice: 4800.2, pChange: 1.1 },
  { symbol: "INDUSINDBK", lastPrice: 1520.4, pChange: -2.1 },
  { symbol: "SHRIRAMFIN", lastPrice: 2450.8, pChange: 5.77 },
  { symbol: "HDFCLIFE", lastPrice: 610.5, pChange: 0.4 },
  { symbol: "SBILIFE", lastPrice: 1480.7, pChange: 0.8 },
  { symbol: "TRENT", lastPrice: 4120.3, pChange: 4.67 },
];

async function fetchNSEData() {
  try {
    const response = await fetch(NSE_API, { headers: HEADERS });

    if (!response.ok) {
      console.log(`NSE API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data && data.data) {
      return data.data.map((item) => ({
        symbol: item.symbol || "",
        lastPrice: item.lastPrice || 0,
        pChange: Math.round((item.pChange || 0) * 100) / 100,
        change: Math.round((item.change || 0) * 100) / 100,
        open: item.open || 0,
        dayHigh: item.dayHigh || 0,
        dayLow: item.dayLow || 0,
        previousClose: item.previousClose || 0,
        totalTradedVolume: item.totalTradedVolume || 0,
      }));
    }

    return null;
  } catch (error) {
    console.error("NSE fetch error:", error.message);
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle the API endpoint
    if (url.pathname === "/api/nifty50") {
      const liveData = await fetchNSEData();
      const responseData = { data: liveData || FALLBACK_DATA };

      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // All other requests are handled by the [assets] config (static files)
    return new Response("Not Found", { status: 404 });
  },
};
