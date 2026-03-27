from http.server import SimpleHTTPRequestHandler, HTTPServer
import json
import urllib.request
import ssl
import time
import threading
import sys
import http.cookiejar

# --- Live NSE Data Fetcher ---
live_data_cache = {"data": [], "last_fetched": 0}
FETCH_INTERVAL = 5  # seconds between background fetches

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/",
    "Connection": "keep-alive",
}

NSE_API = "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050"

# SSL context
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE


def log(msg):
    """Flush print for daemon threads."""
    print(msg, flush=True)


def fetch_nse_live_data():
    """Fetch live Nifty 50 data from NSE India API."""
    global live_data_cache
    try:
        cj = http.cookiejar.CookieJar()
        opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(cj),
            urllib.request.HTTPSHandler(context=ssl_ctx),
        )

        req = urllib.request.Request(NSE_API, headers=HEADERS)
        response = opener.open(req, timeout=15)
        raw_data = response.read()
        data = json.loads(raw_data.decode("utf-8"))

        if "data" in data:
            stocks = []
            for item in data["data"]:
                stocks.append(
                    {
                        "symbol": item.get("symbol", ""),
                        "lastPrice": item.get("lastPrice", 0),
                        "pChange": round(item.get("pChange", 0), 2),
                        "change": round(item.get("change", 0), 2),
                        "open": item.get("open", 0),
                        "dayHigh": item.get("dayHigh", 0),
                        "dayLow": item.get("dayLow", 0),
                        "previousClose": item.get("previousClose", 0),
                        "totalTradedVolume": item.get("totalTradedVolume", 0),
                    }
                )

            live_data_cache["data"] = stocks
            live_data_cache["last_fetched"] = time.time()
            nifty = next((s for s in stocks if s["symbol"] == "NIFTY 50"), None)
            if nifty:
                log(f"[NSE] ✅ Live data: NIFTY 50 = ₹{nifty['lastPrice']} ({nifty['pChange']}%) | {len(stocks)} stocks @ {time.strftime('%H:%M:%S')}")
            else:
                log(f"[NSE] ✅ Fetched {len(stocks)} stocks @ {time.strftime('%H:%M:%S')}")
        else:
            log(f"[NSE] ⚠️ Unexpected response keys: {list(data.keys())}")

    except Exception as e:
        log(f"[NSE] ❌ Fetch error: {e}")


def background_fetcher():
    """Background thread that continuously polls NSE for live data."""
    while True:
        fetch_nse_live_data()
        time.sleep(FETCH_INTERVAL)


# Start background fetcher thread
fetcher_thread = threading.Thread(target=background_fetcher, daemon=True)
fetcher_thread.start()

# --- Fallback data (used only if NSE API hasn't responded yet) ---
fallback_data = [
    {"symbol": "NIFTY 50", "lastPrice": 22250.00, "pChange": 0.5},
    {"symbol": "RELIANCE", "lastPrice": 2950.45, "pChange": 1.2},
    {"symbol": "HDFCBANK", "lastPrice": 1450.20, "pChange": -0.5},
    {"symbol": "ICICIBANK", "lastPrice": 1080.75, "pChange": 2.1},
    {"symbol": "INFY", "lastPrice": 1640.10, "pChange": -1.2},
    {"symbol": "TCS", "lastPrice": 4120.50, "pChange": 0.8},
    {"symbol": "ITC", "lastPrice": 420.30, "pChange": 0.2},
    {"symbol": "LARSEN", "lastPrice": 3540.80, "pChange": 3.4},
    {"symbol": "SBIN", "lastPrice": 760.25, "pChange": 1.5},
    {"symbol": "BHARTIARTL", "lastPrice": 1150.60, "pChange": 2.8},
    {"symbol": "BAJFINANCE", "lastPrice": 6800.00, "pChange": -2.4},
    {"symbol": "KOTAKBANK", "lastPrice": 1750.90, "pChange": -0.8},
    {"symbol": "AXISBANK", "lastPrice": 1050.40, "pChange": 1.1},
    {"symbol": "HINDUNILVR", "lastPrice": 2400.15, "pChange": 0.4},
    {"symbol": "M&M", "lastPrice": 1950.80, "pChange": 4.2},
    {"symbol": "MARUTI", "lastPrice": 11200.50, "pChange": -1.5},
    {"symbol": "HCLTECH", "lastPrice": 1580.30, "pChange": 0.9},
    {"symbol": "ASIANPAINT", "lastPrice": 2850.70, "pChange": -0.3},
    {"symbol": "SUNPHARMA", "lastPrice": 1540.20, "pChange": 1.8},
    {"symbol": "TITAN", "lastPrice": 3650.40, "pChange": 2.5},
    {"symbol": "TATASTEEL", "lastPrice": 155.60, "pChange": 5.1},
    {"symbol": "BAJAJFINSV", "lastPrice": 1600.80, "pChange": -1.1},
    {"symbol": "NTPC", "lastPrice": 340.50, "pChange": 2.2},
    {"symbol": "TATAMOTORS", "lastPrice": 980.30, "pChange": 3.1},
    {"symbol": "POWERGRID", "lastPrice": 280.90, "pChange": 1.4},
    {"symbol": "ULTRACEMCO", "lastPrice": 9850.00, "pChange": -0.6},
    {"symbol": "WIPRO", "lastPrice": 520.40, "pChange": 0.5},
    {"symbol": "TECHM", "lastPrice": 1250.70, "pChange": -3.5},
    {"symbol": "NESTLEIND", "lastPrice": 2550.80, "pChange": 0.1},
    {"symbol": "ONGC", "lastPrice": 275.40, "pChange": 1.9},
    {"symbol": "JSWSTEEL", "lastPrice": 850.60, "pChange": 2.7},
    {"symbol": "GRASIM", "lastPrice": 2200.30, "pChange": -0.9},
    {"symbol": "ADANIENT", "lastPrice": 3150.50, "pChange": 4.8},
    {"symbol": "HINDALCO", "lastPrice": 580.20, "pChange": 3.5},
    {"symbol": "ADANIPORTS", "lastPrice": 1340.90, "pChange": 2.9},
    {"symbol": "DIVISLAB", "lastPrice": 3800.40, "pChange": -1.8},
    {"symbol": "DRREDDY", "lastPrice": 6200.50, "pChange": 0.7},
    {"symbol": "COALINDIA", "lastPrice": 450.60, "pChange": 1.6},
    {"symbol": "CIPLA", "lastPrice": 1480.20, "pChange": 0.3},
    {"symbol": "BAJAJ-AUTO", "lastPrice": 8500.10, "pChange": 2.4},
    {"symbol": "BPCL", "lastPrice": 620.80, "pChange": 1.2},
    {"symbol": "EICHERMOT", "lastPrice": 3950.40, "pChange": -0.7},
    {"symbol": "APOLLOHOSP", "lastPrice": 6100.90, "pChange": 1.5},
    {"symbol": "BRITANNIA", "lastPrice": 5050.30, "pChange": -0.2},
    {"symbol": "TATACONSUM", "lastPrice": 1150.60, "pChange": 0.6},
    {"symbol": "HEROMOTOCO", "lastPrice": 4800.20, "pChange": 1.1},
    {"symbol": "INDUSINDBK", "lastPrice": 1520.40, "pChange": -2.1},
    {"symbol": "SHRIRAMFIN", "lastPrice": 2450.80, "pChange": 5.77},
    {"symbol": "HDFCLIFE", "lastPrice": 610.50, "pChange": 0.4},
    {"symbol": "SBILIFE", "lastPrice": 1480.70, "pChange": 0.8},
    {"symbol": "TRENT", "lastPrice": 4120.30, "pChange": 4.67},
]


class ProxyHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        if self.path == "/api/nifty50":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()

            # Serve live data if available, otherwise fallback
            if live_data_cache["data"]:
                response_data = {"data": live_data_cache["data"]}
            else:
                response_data = {"data": fallback_data}

            self.wfile.write(json.dumps(response_data).encode("utf-8"))
        else:
            super().do_GET()


if __name__ == "__main__":
    server_address = ("", 8000)
    httpd = HTTPServer(server_address, ProxyHTTPRequestHandler)
    log("🚀 Market Server running on http://localhost:8000")
    log("📡 Fetching live data from NSE India...")
    httpd.serve_forever()
