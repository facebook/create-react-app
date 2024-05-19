import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import StockInfo from './components/StockInfo';
import { fetchFilings } from './api/edgarAPI';

function App() {
  const [stockData, setStockData] = useState(null);

  const handleTickerSubmit = async ticker => {
    const data = await fetchFilings(ticker);
    setStockData(data);
  };

  return (
    <div className="App">
      <h1>Stock Insights</h1>
      <SearchBar onSubmitTicker={handleTickerSubmit} />
      <StockInfo data={stockData} />
    </div>
  );
}

export default App;
