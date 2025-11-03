import React, { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, AlertCircle, Settings, Activity,
  DollarSign, Target, Bell, LineChart, Percent, Clock, ChevronRight,
  X, Plus, Zap, Server, Wifi, WifiOff
} from "lucide-react";

const CryptoTradingBot = () => {
  // Estados principais
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [botActive, setBotActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ symbol: "BTCUSDT", price: "", condition: "above" });
  const [webhookUrl, setWebhookUrl] = useState("https://seu-dominio.com/webhook/demo-client");
  const [apiConnected, setApiConnected] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [stats, setStats] = useState({
    balance: 10000,
    profit: 1250.5,
    profitPercent: 12.51,
    activeTrades: 3,
    winRate: 68.5,
    totalTrades: 47
  });
  const [prices, setPrices] = useState({
    BTCUSDT: 67845.32,
    ETHUSDT: 3456.78,
    DOGEUSDT: 0.1234,
    SHIBUSDT: 0.00001234,
    PEPEUSDT: 0.00000123,
    SOLUSDT: 156.89
  });
  const [signals, setSignals] = useState([
    {
      id: 1,
      symbol: "BTCUSDT",
      action: "BUY",
      entry: 67500,
      stopLoss: 66800,
      takeProfit: 69500,
      score: 7,
      time: "10:25:33",
      status: "active",
      analysis: {
        elliot: "Wave 3 detected",
        wyckoff: "Accumulation",
        ict: "Bullish FVG",
        fibonacci: "0.618 retracement"
      }
    },
    {
      id: 2,
      symbol: "ETHUSDT",
      action: "SELL",
      entry: 3480,
      stopLoss: 3520,
      takeProfit: 3380,
      score: 6,
      time: "09:15:22",
      status: "active",
      analysis: {
        elliot: "Wave 5 completion",
        wyckoff: "Distribution",
        ict: "Order Block",
        fibonacci: "1.618 extension"
      }
    }
  ]);
  const [trades, setTrades] = useState([
    { id: 1, symbol: "BTCUSDT", type: "BUY", entry: 65000, exit: 67500, profit: 385.5, profitPercent: 3.85, date: "2025-11-03 08:30" },
    { id: 2, symbol: "SOLUSDT", type: "SELL", entry: 160, exit: 155, profit: 312.5, profitPercent: 3.13, date: "2025-11-03 07:15" },
    { id: 3, symbol: "ETHUSDT", type: "BUY", entry: 3300, exit: 3450, profit: 454.55, profitPercent: 4.55, date: "2025-11-02 22:45" },
    { id: 4, symbol: "DOGEUSDT", type: "BUY", entry: 0.118, exit: 0.123, profit: 423.73, profitPercent: 4.24, date: "2025-11-02 18:20" }
  ]);
  const [fibLevels, setFibLevels] = useState({
    high: 70000,
    low: 65000,
    levels: {
      '0': 70000,
      '0.236': 68820,
      '0.382': 68090,
      '0.5': 67500,
      '0.618': 66910,
      '0.786': 66070,
      '1': 65000,
      '1.272': 63640,
      '1.618': 61910
    }
  });

  // Simulação de atualização de preços e alertas
  useEffect(() => {
    if (!isLoggedIn || !botActive) return;
    const interval = setInterval(() => {
      setPrices(prev => {
        const newPrices = {};
        Object.keys(prev).forEach(symbol => {
          const change = (Math.random() - 0.5) * (prev[symbol] * 0.002);
          newPrices[symbol] = Math.max(0, prev[symbol] + change);
        });
        return newPrices;
      });
      setPriceAlerts(prevAlerts =>
        prevAlerts.map(alert => {
          if (alert.triggered) return alert;
          const currentPrice = prices[alert.symbol];
          if (
            (alert.condition === "above" && currentPrice >= parseFloat(alert.price)) ||
            (alert.condition === "below" && currentPrice <= parseFloat(alert.price))
          ) {
            return { ...alert, triggered: true };
          }
          return alert;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [isLoggedIn, botActive]);

  // Login
  const handleLogin = e => {
    e.preventDefault();
    if (credentials.username && credentials.password) setIsLoggedIn(true);
  };

  // Alertas de preço
  const handleAddAlert = () => {
    if (newAlert.price) {
      setPriceAlerts([
        ...priceAlerts,
        { ...newAlert, id: Date.now(), triggered: false, created: new Date().toLocaleTimeString() }
      ]);
      setNewAlert({ symbol: "BTCUSDT", price: "", condition: "above" });
      setShowAlertModal(false);
    }
  };
  const handleDeleteAlert = id => setPriceAlerts(priceAlerts.filter(alert => alert.id !== id));

  // Fibonacci
  const calculateFibLevels = () => {
    const diff = fibLevels.high - fibLevels.low;
    setFibLevels({
      ...fibLevels,
      levels: {
        '0': fibLevels.high,
        '0.236': fibLevels.high - diff * 0.236,
        '0.382': fibLevels.high - diff * 0.382,
        '0.5': fibLevels.high - diff * 0.5,
        '0.618': fibLevels.high - diff * 0.618,
        '0.786': fibLevels.high - diff * 0.786,
        '1': fibLevels.low,
        '1.272': fibLevels.low - diff * 0.272,
        '1.618': fibLevels.low - diff * 0.618
      }
    });
  };

  // Login page
  if (!isLoggedIn)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-600 rounded-full mb-4">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Crypto Trading Bot</h1>
            <p className="text-gray-400">Elliot + Wyckoff + ICT + Fibonacci</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Usuário</label>
              <input
                type="text"
                value={credentials.username}
                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite seu usuário"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
              <input
                type="password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite sua senha"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Entrar no Sistema
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Demo: use qualquer usuário e senha</p>
          </div>
        </div>
      </div>
    );

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold">Crypto Trading Bot</h1>
              {apiConnected ? (
                <span className="flex items-center text-green-400 text-sm">
                  <Wifi className="w-4 h-4 mr-1" /> API Conectada
                </span>
              ) : (
                <span className="flex items-center text-red-400 text-sm">
                  <WifiOff className="w-4 h-4 mr-1" /> API Desconectada
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowAlertModal(true)} className="p-2 hover:bg-gray-700 rounded-lg transition relative">
                <Bell className="w-6 h-6" />
                {priceAlerts.some(a => a.triggered) && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-700 rounded-lg transition">
                <Settings className="w-6 h-6" />
              </button>
              <button onClick={() => setIsLoggedIn(false)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition">
                Sair
              </button>
            </div>
          </div>
          {/* Menu */}
          <div className="flex items-center space-x-4 mt-4">
            <button onClick={() => setCurrentPage("dashboard")}
              className={`px-4 py-2 rounded-lg transition ${currentPage === "dashboard" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
              Dashboard
            </button>
            <button onClick={() => setCurrentPage("charts")}
              className={`px-4 py-2 rounded-lg transition ${currentPage === "charts" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
              Gráficos
            </button>
            <button onClick={() => setCurrentPage("analysis")}
              className={`px-4 py-2 rounded-lg transition ${currentPage === "analysis" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
              Análise Técnica
            </button>
            <button onClick={() => setCurrentPage("history")}
              className={`px-4 py-2 rounded-lg transition ${currentPage === "history" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
              Histórico
            </button>
            <button onClick={() => setCurrentPage("webhook")}
              className={`px-4 py-2 rounded-lg transition ${currentPage === "webhook" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
              <Server className="w-4 h-4 inline mr-2" /> Webhook/API
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">

        {/* Dashboard */}
        {currentPage === "dashboard" && (
          <div className="space-y-6">
            {/* Status do Bot */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Status do Bot</h2>
                  <p className="text-gray-400">Sistema de trading automatizado</p>
                </div>
                <button onClick={() => setBotActive(!botActive)}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${botActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
                  {botActive ? "🛑 Parar Bot" : "▶️ Iniciar Bot"}
                </button>
              </div>
              {botActive && (
                <div className="mt-4 flex items-center space-x-2 text-green-400">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Bot ativo - Analisando mercado...</span>
                </div>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Saldo */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Saldo Total</p>
                    <p className="text-2xl font-bold">${stats.balance.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              {/* Lucro */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Lucro Total</p>
                    <p className="text-2xl font-bold text-green-400">+${stats.profit.toFixed(2)}</p>
                    <p className="text-sm text-green-400">+{stats.profitPercent}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500" />
                </div>
              </div>
              {/* Trades Ativos */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Trades Ativos</p>
                    <p className="text-2xl font-bold">{stats.activeTrades}</p>
                  </div>
                  <Activity className="w-10 h-10 text-yellow-500" />
                </div>
              </div>
              {/* Taxa de Acerto */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Taxa de Acerto</p>
                    <p className="text-2xl font-bold">{stats.winRate}%</p>
                    <p className="text-sm text-gray-400">{stats.totalTrades} trades</p>
                  </div>
                  <Target className="w-10 h-10 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Preços de Mercado */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Preços de Mercado (Tempo Real)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(prices).map(([symbol, price]) => (
                  <div key={symbol} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition cursor-pointer">
                    <p className="text-sm text-gray-400">{symbol}</p>
                    <p className="text-lg font-bold">${price.toFixed(symbol.includes("SHIB") || symbol.includes("PEPE") ? 8 : 2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sinais Ativos */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Sinais Ativos</h3>
              <div className="space-y-4">
                {signals.map(signal => (
                  <div key={signal.id}
                    className={`bg-gray-700 rounded-lg p-4 border-l-[6px]`}
                    style={{ borderColor: signal.action === "BUY" ? "#10b981" : "#ef4444" }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-[14px] py-[5px] rounded-full font-semibold ${signal.action === "BUY" ? "bg-green-600" : "bg-red-600"
                            }`}>
                          {signal.action}
                        </span>
                        <span className="text-xl font-bold">{signal.symbol}</span>
                        <span className="text-sm text-gray-400">{signal.time}</span>
                      </div>
                      {/* Score */}
                      <div className="flex items-center space-x-[7px]">
                        <span className="text-sm text-gray-400">Score:</span>
                        <span className="text-lg font-bold text-yellow-400">{signal.score}/9</span>
                      </div>
                    </div>

                    {/* Preços */}
                    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-[16px] mb-[12px]">
                      {/* Entry */}
                      <div><p className="text-xs text-gray-400">Entry</p><p className="font-semibold">${signal.entry}</p></div>
                      {/* Stop Loss */}
                      <div><p className="text-xs text-gray-400">Stop Loss</p><p className="font-semibold text-red-400">${signal.stopLoss}</p></div>
                      {/* Take Profit */}
                      <div><p className="text-xs text-gray-400">Take Profit</p><p className="font-semibold text-green-400">${signal.takeProfit}</p></div>
                    </div>

                    {/* Análises */}
                    <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-[8px] text-sm">
                      {/* Elliot */}
                      <div className="bg-gray-800 rounded px-[8px] py-[5px]"><p className="text-xs text-gray-400">Elliot</p><p className="font-semibold">{signal.analysis.elliot}</p></div>
                      {/* Wyckoff */}
                      <div className="bg-gray-800 rounded px-[8px] py-[5px]"><p className="text-xs text-gray--400">Wyckoff</p><p className="font-semibold">{signal.analysis.wyckoff}</p></div>
                      {/* ICT */}
                      <div className="bg-gray--800 rounded px-[8px] py-[5px]"><p className="text-xs text-gray--400">ICT</p><p className="font-semibold">{signal.analysis.ict}</p></div>
                      {/* Fibonacci */}
                      <div className="bg-gray--800 rounded px-[8px] py-[5px]"><p className="text-xs text-gray--400">Fibonacci</p><p className="font-semibold">{signal.analysis.fibonacci}</p></div>
                    </div>

                  </div>))}
              </div>
            </div>

          </div>)}

        {/* Charts Page - Gráficos reais do TradingView */}
        {currentPage === "charts" && (
          <div className="space-y-[24px]">
            {/* Gráficos principais */}
            <div className="bg-gray--800 rounded-lg p-[16px] border border-gray--700">
              {/* Header */}
              <div className="flex items-center justify-between mb-[16px]">
                <h3 className="text-xl font-bold">Gráficos TradingView</h3>
                {/* Seleção de símbolo */}
                <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}
                  className="px-[16px] py-[8px] bg-gray--700 rounded-lg border border-gray--600"
                >
                  {["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT"].map(sym =>
                    (<option key={sym} value={sym}>{sym.replace("USDT", "/USDT")}</option>)
                  )}
                </select>
              </div>

              {/* Gráficos TradingView */}
              {/* Use BINANCE para maior liquidez nos widgets públicos */}
              {/* https://www.tradingview.com/widget/advanced-chart/ */}
              {/* https://www.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=15&theme=dark&style=1&locale=br */}
              {/* https://www.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=60&theme=dark&style=1&locale=br */}

              {/* Dois gráficos lado a lado (15m e H1) */}
              <div className="grid grid-cols--1 lg:grid-cols--2 gap-[16px]">
                {/* Gráfico de 15 minutos */}
                <div className="bg-gray--900 rounded h-[384px] overflow-hidden">
                  {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
                  <iframe
                    title={`TradingView Chart ${selectedSymbol} - M15`}
                    src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=BINANCE%3A${selectedSymbol}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=br`}
                    frameBorder={0}
                    allowTransparency={true}
                    scrolling={"no"}
                    allowFullScreen={true}
                    style={{ width:"100%", height:"100%" }}
                  ></iframe>
                </div>

                {/* Gráfico de H1 */}
                <div className="bg-gray--900 rounded h-[384px] overflow-hidden">
                  {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
                  <iframe
                    title={`TradingView Chart ${selectedSymbol} - H1`}
                    src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_2&symbol=BINANCE%3A${selectedSymbol}&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=br`}
                    frameBorder={0}
                    allowTransparency={true}
                    scrolling={"no"}
                    allowFullScreen={true}
                    style={{ width:"100%", height:"100%" }}
                  ></iframe>
                </div>

              </div>

            </div>

          </div>)}

        {/* Analysis Page */}
        {currentPage === "analysis" && (
          // ... (igual ao seu exemplo anterior)
          // Por questão de espaço não repito aqui mas mantenha o bloco do seu exemplo!
          // Se quiser o bloco completo da análise técnica também em detalhe peça!
          <>
            {/* Níveis de Fibonacci */}
            {/* ... */}
          </>
        )}

        {/* History Page */}
        {currentPage === "history" && (
          // ... (igual ao seu exemplo anterior)
          <>
            {/* Histórico de Trades */}
            {/* ... */}
          </>
        )}

        {/* Webhook/API Page */}
        {currentPage === "webhook" && (
          // ... (igual ao seu exemplo anterior)
          <>
            {/* Webhook/API Configuração e Logs */}
            {/* ... */}
          </>
        )}

      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        // ... (igual ao seu exemplo anterior)
        <>
          {/* Modal de Alertas de Preço */}
          {/* ... */}
        </>
      )}

      {/* Settings Modal */}
      {showSettings && (
        // ... (igual ao seu exemplo anterior)
        <>
          {/* Modal de Configurações do Bot/API */}
          {/* ... */}
        </>
      )}

    </div >
  );
};

export default CryptoTradingBot;

