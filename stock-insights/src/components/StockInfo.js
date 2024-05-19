import React from 'react';

function StockInfo({ data }) {
  return (
    <div>
      {data ? (
        <ul>
          <li>10-K Summary: {data.tenKSummary}</li>
          <li>Quarterly Earnings: {data.earningsSummary}</li>
        </ul>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
}

export default StockInfo;
