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

chartCloseBtn.addEventListener('click', closeChart);
chartModal.addEventListener('click', (e) => {
    if (e.target === chartModal) closeChart();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeChart();
});

// --- Maximize Toggle ---
const chartMaximizeBtn = document.getElementById('chart-maximize-btn');
let isMaximized = false;

function toggleMaximize() {
    const modal = document.querySelector('.chart-modal');
    isMaximized = !isMaximized;
    modal.classList.toggle('maximized', isMaximized);
    chartMaximizeBtn.textContent = isMaximized ? '⤡' : '⤢';
    chartMaximizeBtn.title = isMaximized ? 'Restore' : 'Toggle Fullscreen';
}

function closeChart() {
    chartModal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset maximized state
    if (isMaximized) {
        isMaximized = false;
        document.querySelector('.chart-modal').classList.remove('maximized');
        chartMaximizeBtn.textContent = '⤢';
    }
    setTimeout(() => { chartContainer.innerHTML = ''; }, 350);
}

chartMaximizeBtn.addEventListener('click', toggleMaximize);

// --- Data Fetching ---
async function fetchLiveNiftyData() {
    try {
        const response = await fetch('/api/nifty50');
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();

        if (json && json.data) {
            renderHeatmap(json.data);
            
            if (json.metadata && json.advance) {
                renderMarketMetrics(json.metadata, json.advance);
            }
        }
    } catch (error) {
        console.error("Failed to fetch live data:", error);
    }
}

// --- Market Metrics Rendering ---
function renderMarketMetrics(metadata, advance) {
    const metricsPanel = document.getElementById('market-metrics');
    metricsPanel.style.display = 'flex'; // Show it once data is loaded

    // Top Row Metrics
    document.getElementById('metric-prev-close').textContent = metadata.previousClose.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('metric-open').textContent = metadata.open.toLocaleString('en-IN', {minimumFractionDigits: 2});
    
    const volLakhs = metadata.totalTradedVolume / 100000;
    document.getElementById('metric-volume').textContent = volLakhs.toLocaleString('en-IN', {maximumFractionDigits: 2});
    
    const valCrores = metadata.totalTradedValue / 10000000;
    document.getElementById('metric-value').textContent = valCrores.toLocaleString('en-IN', {maximumFractionDigits: 2});
    
    const ffmCapLakhsCr = metadata.ffmc_sum / 10000000; // Assuming raw metadata is already large enough
    document.getElementById('metric-ffm').textContent = ffmCapLakhsCr.toLocaleString('en-IN', {maximumFractionDigits: 2});

    document.getElementById('metric-advance').textContent = advance.advances;
    document.getElementById('metric-decline').textContent = advance.declines;

    const currentPrice = metadata.last;

    // 52 Week Slider
    const w52High = metadata.yearHigh;
    const w52Low = metadata.yearLow;
    document.getElementById('slider-52w-high').textContent = w52High.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('slider-52w-low').textContent = w52Low.toLocaleString('en-IN', {minimumFractionDigits: 2});
    
    if (w52High > w52Low) {
        let pct52 = ((currentPrice - w52Low) / (w52High - w52Low)) * 100;
        pct52 = Math.max(0, Math.min(100, pct52)); // Clamp to 0-100
        const tooltip52 = document.getElementById('slider-52w-tooltip');
        tooltip52.style.left = `${pct52}%`;
        document.getElementById('slider-52w-current').textContent = currentPrice.toLocaleString('en-IN', {minimumFractionDigits: 2});
    }

    // Intraday Slider
    const intraHigh = metadata.high;
    const intraLow = metadata.low;
    document.getElementById('slider-intra-high').textContent = intraHigh.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('slider-intra-low').textContent = intraLow.toLocaleString('en-IN', {minimumFractionDigits: 2});
    
    if (intraHigh > intraLow) {
        let pctIntra = ((currentPrice - intraLow) / (intraHigh - intraLow)) * 100;
        pctIntra = Math.max(0, Math.min(100, pctIntra));
        const tooltipIntra = document.getElementById('slider-intra-tooltip');
        tooltipIntra.style.left = `${pctIntra}%`;
        document.getElementById('slider-intra-current').textContent = currentPrice.toLocaleString('en-IN', {minimumFractionDigits: 2});
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

        // Check for level breaks on each price update
        checkLevelBreaks(indexLtp);
    }
}

// Initialize on load and set up polling for live data
window.addEventListener('DOMContentLoaded', () => {
    fetchLiveNiftyData();
    setInterval(fetchLiveNiftyData, 3000);
    initAlertSystem();
});

// ==============================
// LEVEL BREAK ALERT SYSTEM
// ==============================

const DEFAULT_LEVELS = [
    { price: 22500, type: 'support', label: 'Key Support' },
    { price: 22750, type: 'support', label: 'Minor Support' },
    { price: 23000, type: 'resistance', label: 'Psychological' },
    { price: 23250, type: 'resistance', label: 'Key Resistance' },
    { price: 23500, type: 'resistance', label: 'Major Resistance' },
    { price: 22000, type: 'support', label: 'Major Support' },
];

let alertLevels = [];
let previousNiftyPrice = null;
let soundEnabled = true;
const ALERT_COOLDOWN = 60000; // 1 minute cooldown per level
const levelCooldowns = {};

// --- Audio beep using Web Audio API ---
function playAlertBeep(type) {
    if (!soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Resistance break = high pitch ascending, Support break = low pitch descending
        if (type === 'resistance') {
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.15);
        } else {
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.15);
        }

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);

        // Play second beep
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(type === 'resistance' ? 1000 : 250, ctx.currentTime);
            gain2.gain.setValueAtTime(0.12, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.2);
        }, 200);
    } catch (e) {
        console.log('Audio not available:', e);
    }
}

// ==============================
// OPTIONS RECOMMENDATION ENGINE
// ==============================

function getNextWeeklyExpiry() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 4=Thu
    let daysUntilThursday = (4 - day + 7) % 7;
    if (daysUntilThursday === 0) {
        // If today is Thursday, check if market is still open (before 3:30 PM)
        const hours = now.getHours();
        const mins = now.getMinutes();
        if (hours > 15 || (hours === 15 && mins >= 30)) {
            daysUntilThursday = 7; // Next week's expiry
        }
    }
    const expiry = new Date(now);
    expiry.setDate(now.getDate() + daysUntilThursday);
    return expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getNiftyStrike(price, offset) {
    // Nifty options trade in 50-point strike intervals
    return Math.round(price / 50) * 50 + offset;
}

function getOptionsRecommendation(levelPrice, currentPrice, levelType) {
    const expiry = getNextWeeklyExpiry();
    const atmStrike = getNiftyStrike(currentPrice, 0);

    if (levelType === 'resistance') {
        // Resistance broken upward → Bullish → Buy CE
        const otmStrike = atmStrike + 100;
        return {
            action: 'BUY CE',
            strategy: 'Bullish Breakout',
            primary: { strike: atmStrike, type: 'CE', label: 'ATM Call' },
            secondary: { strike: otmStrike, type: 'CE', label: 'OTM Call (aggressive)' },
            stopLoss: `SL below ${levelPrice}`,
            target: `Target: ${atmStrike + 200} – ${atmStrike + 350}`,
            expiry: expiry,
            rationale: `Nifty broke above ${levelPrice} resistance. Bullish momentum expected.`,
            risk: 'High risk if breakout fails. Use strict stop-loss.',
        };
    } else {
        // Support broken downward → Bearish → Buy PE
        const otmStrike = atmStrike - 100;
        return {
            action: 'BUY PE',
            strategy: 'Bearish Breakdown',
            primary: { strike: atmStrike, type: 'PE', label: 'ATM Put' },
            secondary: { strike: otmStrike, type: 'PE', label: 'OTM Put (aggressive)' },
            stopLoss: `SL above ${levelPrice}`,
            target: `Target: ${atmStrike - 200} – ${atmStrike - 350}`,
            expiry: expiry,
            rationale: `Nifty broke below ${levelPrice} support. Bearish momentum expected.`,
            risk: 'High risk if breakdown reverses. Use strict stop-loss.',
        };
    }
}

// Store last recommendations for display
const levelRecommendations = {};

// --- Toast Notification ---
function showToast(title, message, type, recommendation) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.position = 'relative';

    const icon = type === 'resistance' ? '🔺' : '🔻';

    let recHtml = '';
    if (recommendation) {
        const actionColor = type === 'resistance' ? '#6ee7b7' : '#fca5a5';
        const actionEmoji = type === 'resistance' ? '📈' : '📉';
        recHtml = `
            <div class="toast-rec">
                <div class="toast-rec-action" style="color:${actionColor}">
                    ${actionEmoji} ${recommendation.action}  •  ${recommendation.strategy}
                </div>
                <div class="toast-rec-detail">
                    ▸ ${recommendation.primary.label}: <strong>NIFTY ${recommendation.primary.strike} ${recommendation.primary.type}</strong>
                </div>
                <div class="toast-rec-detail">
                    ▸ ${recommendation.secondary.label}: <strong>NIFTY ${recommendation.secondary.strike} ${recommendation.secondary.type}</strong>
                </div>
                <div class="toast-rec-detail">
                    ▸ ${recommendation.stopLoss}  •  ${recommendation.target}
                </div>
                <div class="toast-rec-detail" style="opacity:0.5">
                    Expiry: ${recommendation.expiry}  •  ⚠️ ${recommendation.risk}
                </div>
            </div>
        `;
    }

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
            ${recHtml}
        </div>
        <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 350)">&times;</button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Auto-remove after 10 seconds (longer for recommendation)
    const timeout = recommendation ? 10000 : 6000;
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 350);
        }
    }, timeout);
}

// --- Browser Notification ---
function showBrowserNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '🔔',
            badge: '📊',
            tag: 'nifty-alert-' + Date.now(),
        });
    }
}

// --- Level Management ---
function loadLevels() {
    const saved = localStorage.getItem('nifty_alert_levels');
    if (saved) {
        alertLevels = JSON.parse(saved);
    } else {
        alertLevels = [...DEFAULT_LEVELS];
        saveLevels();
    }
}

function saveLevels() {
    localStorage.setItem('nifty_alert_levels', JSON.stringify(alertLevels));
}

function addLevel(price, type, label) {
    // Prevent duplicates
    if (alertLevels.some(l => l.price === price)) return;
    alertLevels.push({ price, type, label: label || `${type === 'resistance' ? 'Resistance' : 'Support'} ${price}` });
    alertLevels.sort((a, b) => b.price - a.price);
    saveLevels();
    renderLevels();
}

function removeLevel(price) {
    alertLevels = alertLevels.filter(l => l.price !== price);
    saveLevels();
    renderLevels();
}

function renderLevels() {
    const grid = document.getElementById('levels-grid');
    if (alertLevels.length === 0) {
        grid.innerHTML = '<div class="levels-empty">No alert levels set. Click "+ Add Level" to monitor important price levels.</div>';
        return;
    }

    grid.innerHTML = alertLevels.map(level => {
        const isCooling = levelCooldowns[level.price] && (Date.now() - levelCooldowns[level.price] < ALERT_COOLDOWN);
        const breachedClass = isCooling ? 'triggered' : '';
        const rec = levelRecommendations[level.price];

        let recHtml = '';
        if (isCooling && rec) {
            const color = level.type === 'resistance' ? '#6ee7b7' : '#fca5a5';
            recHtml = `
                <div class="level-rec">
                    <span class="level-rec-action" style="color:${color}">
                        ${rec.action}: NIFTY ${rec.primary.strike} ${rec.primary.type}
                    </span>
                </div>
            `;
        }

        return `
            <div class="level-card ${level.type} ${breachedClass}" data-price="${level.price}">
                <div class="level-info">
                    <span class="level-price">₹${level.price.toLocaleString('en-IN')}</span>
                    <span class="level-label">${level.label}</span>
                    ${recHtml}
                </div>
                <div class="level-status">
                    <span class="level-badge ${level.type} ${isCooling ? 'breached' : ''}">${isCooling ? '⚡ BREACHED' : level.type}</span>
                    <button class="level-delete-btn" onclick="removeLevel(${level.price})">✕</button>
                </div>
            </div>
        `;
    }).join('');
}

// --- Level Break Detection ---
function checkLevelBreaks(currentPrice) {
    if (previousNiftyPrice === null) {
        previousNiftyPrice = currentPrice;
        return;
    }

    const now = Date.now();

    for (const level of alertLevels) {
        // Check cooldown
        if (levelCooldowns[level.price] && (now - levelCooldowns[level.price] < ALERT_COOLDOWN)) {
            continue;
        }

        let breached = false;

        if (level.type === 'resistance') {
            // Price crossed above resistance
            if (previousNiftyPrice <= level.price && currentPrice > level.price) {
                breached = true;
            }
        } else if (level.type === 'support') {
            // Price crossed below support
            if (previousNiftyPrice >= level.price && currentPrice < level.price) {
                breached = true;
            }
        }

        if (breached) {
            levelCooldowns[level.price] = now;
            const direction = level.type === 'resistance' ? 'broke above' : 'broke below';
            const title = `⚡ NIFTY ${direction} ₹${level.price.toLocaleString('en-IN')}`;
            const message = `${level.label} • CMP: ₹${currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })} • ${new Date().toLocaleTimeString('en-IN')}`;

            // Generate options recommendation
            const rec = getOptionsRecommendation(level.price, currentPrice, level.type);
            levelRecommendations[level.price] = rec;

            // Fire all alerts with recommendation
            showToast(title, message, level.type, rec);
            showBrowserNotification(
                title,
                `${message}\n${rec.action}: NIFTY ${rec.primary.strike} ${rec.primary.type} | ${rec.stopLoss}`
            );
            playAlertBeep(level.type);

            // Re-render to show breached state + recommendation
            renderLevels();
        }
    }

    previousNiftyPrice = currentPrice;
}

// --- Init Alert System ---
function initAlertSystem() {
    loadLevels();
    renderLevels();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Sound toggle
    const soundBtn = document.getElementById('toggle-sound-btn');
    const savedSound = localStorage.getItem('nifty_sound_enabled');
    if (savedSound !== null) soundEnabled = savedSound === 'true';
    soundBtn.classList.toggle('active', soundEnabled);
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';

    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.classList.toggle('active', soundEnabled);
        soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
        localStorage.setItem('nifty_sound_enabled', soundEnabled);
    });

    // Add level modal
    const addBtn = document.getElementById('add-level-btn');
    const modal = document.getElementById('add-level-modal');
    const cancelBtn = document.getElementById('cancel-level-btn');
    const saveBtn = document.getElementById('save-level-btn');
    const priceInput = document.getElementById('level-price-input');
    const typeInput = document.getElementById('level-type-input');
    const labelInput = document.getElementById('level-label-input');

    addBtn.addEventListener('click', () => {
        modal.classList.add('active');
        priceInput.value = '';
        labelInput.value = '';
        priceInput.focus();
    });

    cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    saveBtn.addEventListener('click', () => {
        const price = parseFloat(priceInput.value);
        if (!price || price <= 0) {
            priceInput.style.borderColor = 'rgba(239,68,68,0.6)';
            setTimeout(() => priceInput.style.borderColor = '', 1500);
            return;
        }
        addLevel(price, typeInput.value, labelInput.value.trim());
        modal.classList.remove('active');
    });

    // Enter key to save
    priceInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveBtn.click(); });
    labelInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveBtn.click(); });
}
