import React, { useState } from 'react';

function SearchBar({ onSubmitTicker }) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    onSubmitTicker(ticker);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={ticker}
        onChange={e => setTicker(e.target.value)}
        placeholder="Enter a ticker symbol"
        required
      />
      <button type="submit">Get Info</button>
    </form>
  );
}

export default SearchBar;
