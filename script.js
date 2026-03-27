// Determine the color class based on percentage change
function getColorClass(pChange) {
    if (pChange >= 3) return 'gain-high';
    if (pChange > 0 && pChange < 3) return 'gain-mid';
    if (pChange === 0) return 'neutral';
    if (pChange < 0 && pChange > -2.5) return 'loss-mid';
    if (pChange <= -2.5) return 'loss-high';
    return 'neutral';
}

// --- Chart Modal Logic ---
const chartModal = document.getElementById('chart-modal');
const chartCloseBtn = document.getElementById('chart-close-btn');
const chartContainer = document.getElementById('chart-container');
const chartSymbolName = document.getElementById('chart-symbol-name');
const chartStockInfo = document.getElementById('chart-stock-info');

function openChart(symbol, ltp, pChange) {
    // Map NSE symbols to TradingView format (NSE:SYMBOL)
    const tvSymbol = `NSE:${symbol.replace('&', '_')}`;
    const sign = pChange >= 0 ? '+' : '';

    chartSymbolName.textContent = symbol;
    chartStockInfo.textContent = `₹${ltp.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}  •  ${sign}${pChange.toFixed(2)}%`;
    chartStockInfo.style.color = pChange >= 0 ? '#34d399' : '#f87171';

    // Use the TradingView Widget constructor for proper NSE symbol resolution
    chartContainer.innerHTML = '<div id="tv-widget-container" style="width:100%;height:100%;"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.onload = () => {
        new TradingView.widget({
            "autosize": true,
            "symbol": tvSymbol,
            "interval": "D",
            "timezone": "Asia/Kolkata",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#0b0f19",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tv-widget-container",
            "hide_side_toolbar": false,
            "withdateranges": true,
            "details": true,
            "studies": ["Volume@tv-basicstudies"]
        });
    };
    document.head.appendChild(script);

    chartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeChart() {
    chartModal.classList.remove('active');
    document.body.style.overflow = '';
    // Clear iframe after animation to stop loading
    setTimeout(() => { chartContainer.innerHTML = ''; }, 350);
}

chartCloseBtn.addEventListener('click', closeChart);
chartModal.addEventListener('click', (e) => {
    if (e.target === chartModal) closeChart();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeChart();
});

// --- Data Fetching ---
async function fetchLiveNiftyData() {
    try {
        const response = await fetch('/api/nifty50');
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();

        if (json && json.data) {
            renderHeatmap(json.data);
        }
    } catch (error) {
        console.error("Failed to fetch live data:", error);
    }
}

function renderHeatmap(data) {
    const stockData = data.filter(item => item.symbol !== 'NIFTY 50' && item.identifier !== 'NIFTY 50');
    const indexData = data.find(item => item.symbol === 'NIFTY 50' || item.identifier === 'NIFTY 50');

    const sortedData = [...stockData].sort((a, b) => b.pChange - a.pChange);

    const grid = document.getElementById('heatmap-grid');
    grid.innerHTML = '';

    sortedData.forEach(stock => {
        const tile = document.createElement('div');
        tile.className = `tile ${getColorClass(stock.pChange)}`;

        const sign = stock.pChange > 0 ? '+' : '';
        const lastPrice = typeof stock.lastPrice === 'number' ? stock.lastPrice : parseFloat(stock.lastPrice?.toString().replace(/,/g, '') || 0);
        const pChange = typeof stock.pChange === 'number' ? stock.pChange : parseFloat(stock.pChange?.toString() || 0);

        tile.innerHTML = `
            <div class="tile-symbol">${stock.symbol}</div>
            <div class="tile-data">
                <span class="tile-ltp">${lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                <span class="tile-change">${sign}${pChange.toFixed(2)}%</span>
            </div>
        `;

        // Click handler to open the spot chart
        tile.addEventListener('click', () => openChart(stock.symbol, lastPrice, pChange));

        grid.appendChild(tile);
    });

    if (indexData) {
        const indexLtp = typeof indexData.lastPrice === 'number' ? indexData.lastPrice : parseFloat(indexData.lastPrice?.toString().replace(/,/g, '') || 0);
        const indexChange = typeof indexData.pChange === 'number' ? indexData.pChange : parseFloat(indexData.pChange?.toString() || 0);

        document.getElementById('nifty-ltp').innerText = indexLtp.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
        
        const changeEl = document.getElementById('nifty-change');
        const indexSign = indexChange >= 0 ? '+' : '';
        changeEl.innerText = `${indexSign}${indexChange.toFixed(2)}%`;
        changeEl.className = `change ${indexChange >= 0 ? 'positive' : 'negative'}`;
    }
}

// Initialize on load and set up polling for live data
window.addEventListener('DOMContentLoaded', () => {
    fetchLiveNiftyData();
    setInterval(fetchLiveNiftyData, 3000);
});
