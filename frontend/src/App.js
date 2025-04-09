import React from "react";
import { useState, useEffect } from "react";

function App() {
  const [availableStocks, setAvailableStocks] = useState([]);
  const [prices, setPrices] = useState({});
  const [portfolio, setPortfolio] = useState([]);
  const [buySymbol, setBuySymbol] = useState('');
  const [buyQuantity, setBuyQuantity] = useState(1);


  // temp user
  const userId = 'user123'

  useEffect(() => {
    fetch('/api/stocks')
      .then(response => response.json())
      .then(data => {
        setAvailableStocks(data);
      })
      .catch(error => console.error('Error fetching available stocks: ', error));

      fetchPortfolio();
  }, []);



  useEffect(()=> {
    const symbols = availableStocks.map(stock => stock.symbol);
    
    if (symbols.length > 0) {
      fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols })
      })
      .then(response => response.json())
      .then(data => setPrices(data))
      .catch(error => console.error('Error fetching prices: ', error));
    }
  }, [availableStocks]);

  const fetchPortfolio = () => {
    fetch(`/api/portfolio/${userId}`)
      .then(response => response.json())
      .then(data => setPortfolio(data))
      .catch(error => console.error('Error fetching portfolio: ', error));
  };

  const handleBuy = (e) => {
    e.preventDefault();
    
    if (buySymbol && buyQuantity > 0) {
      fetch(`/api/portfolio/${userId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: buySymbol, quantity: parseInt(buyQuantity) }),
      })
        .then(response => {
          if (response.ok) {
            fetchPortfolio();
            setBuySymbol('');
            setBuyQuantity(1);
          } else {
            return response.json().then(data => alert(data.error || 'Failed to buy.'));
          }
        })
        .then(data => {
          alert(data.message || 'Purchase successful!');
          fetchPortfolio();
          setBuySymbol('');
          setBuyQuantity(1);
        })
        .catch(error => console.error('Error purchasing stock: ', error));
    }
  };

  return (
    <>
    <div>
      <h1> Stock Buying Simulator</h1>

      <h2>Available Stocks</h2>
      <ul>
        {availableStocks.map(stock => (
          <li key={stock.symbol}>
            {stock.name} ({stock.symbol}): ${prices[stock.symbol]?.toFixed(2) || 'Loading...'}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <h2>Buy Stocks</h2>

        <form onSubmit={handleBuy}>
          <div>
            <select
              value={buySymbol}
              onChange={(e) => setBuySymbol(e.target.value)}
              required
            >
              <option value="">Select a Stock</option>
              {availableStocks.map(stock => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.name} ({stock.symbol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              min="1"
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(e.target.value)}
              required
            />
          </div>
          <button type="submit">Buy Stock</button>
        </form>
    </div>

    <div>
      <h2>Your Portfolio</h2>
        {portfolio.length === 0 ? (
          <p>No stocks in your portfolio</p>
        ) : (
          <ul>
            {portfolio.map((item, index) => (
              <li key={index}>
                {item.symbol}: {item.quantity} shares @ ${item.purchase_price.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
    </div>
    </>
  )
}

export default App;