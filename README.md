# 🔥 Nifty 50 Heatmap — Liquid Glass UI

A stunning, real-time **Nifty 50 Index Heatmap** with a premium **liquid glass (glassmorphism)** design. Fetches live market data directly from NSE India and renders an interactive, color-coded grid of all 50 constituent stocks.

![Nifty Heatmap Screenshot](https://img.shields.io/badge/Status-Live-brightgreen) ![Python](https://img.shields.io/badge/Python-3.8+-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- **📡 Live Market Data** — Fetches real-time stock prices from NSE India's official API every 5 seconds
- **🎨 Liquid Glass UI** — Premium glassmorphism design with animated blobs, smooth gradients, and frosted glass panels
- **🗺️ Dynamic Heatmap Grid** — Stocks sorted by performance and color-coded (green → gains, red → losses)
- **📊 TradingView Charts** — Click any stock tile to open an interactive TradingView spot chart in a modal
- **⚡ Auto-Refresh** — Frontend polls for updated data every 3 seconds for near real-time updates
- **📱 Fully Responsive** — Adapts seamlessly from desktop to mobile

---

## 🖥️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3 (Vanilla), JavaScript   |
| Backend    | Python 3 (`http.server`)            |
| Data       | NSE India API (live)                |
| Charts     | TradingView Widget                  |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+

### Run Locally

```bash
# Clone the repo
git clone https://github.com/shashankshines/Nifty-Heatmap.git
cd Nifty-Heatmap

# Start the server
python3 server.py
```

Open **http://localhost:8000** in your browser. That's it! 🎉

The server will start fetching live NSE data automatically:
```
🚀 Market Server running on http://localhost:8000
📡 Fetching live data from NSE India...
[NSE] ✅ Live data: NIFTY 50 = ₹22,932 (-1.61%) | 51 stocks @ 12:25:11
```

---

## 📁 Project Structure

```
Nifty-Heatmap/
├── index.html      # Main HTML page with glassmorphism layout
├── style.css       # Full CSS with liquid glass design system
├── script.js       # Frontend logic — fetching, rendering, chart modal
├── server.py       # Python backend — NSE API proxy + static file server
└── README.md
```

---

## 🎨 Design Highlights

- **Animated gradient blobs** create a living, breathing background
- **Frosted glass panels** with `backdrop-filter: blur()` for depth
- **Color-coded tiles** — 5-tier scale from High Gains (deep green) to High Losses (deep red)
- **Smooth hover effects** with scale transforms and glow
- **TradingView modal** with dark theme integration

---

## ⚠️ Notes

- **Market Hours**: Live data updates during NSE trading hours (9:15 AM – 3:30 PM IST). Outside market hours, the last available closing data is shown.
- **Fallback Data**: If NSE API is unreachable, hardcoded fallback data is used to keep the UI functional.
- **No API Key Required**: Uses NSE India's public endpoint — no authentication needed.

---

## 📜 License

MIT License — feel free to use, modify, and share.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/shashankshines">@shashankshines</a>
</p>
