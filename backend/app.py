from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)


# For testing purposes, in computer database, replace with real database
portfolios = {}

def generate_price(previous_price):
  change = random.uniform(-0.03, 0.03)
  new_price = previous_price * (1 + change)
  return new_price

def get_current_prices(symbols):
  prices = {}
  initial_prices = {'AAPL': 170.00, 'GOOGL': 2500.50, 'MSFT': 280.75, 'AMZN': 150.20}

  for symbol in symbols:
    if symbol in initial_prices:
      prices[symbol] = generate_price(initial_prices[symbol])
    else:
      prices[symbol] = None

  return prices

@app.route('/')
def canary():
  return jsonify({'message': 'Hello from Flask!'})

@app.route('/api/stocks')
def get_available_stocks():
  available_stocks = [{'symbol': 'AAPL', 'name': 'Apple Inc.'},
                      {'symbol': 'GOOGL', 'name': 'Alphabet Inc. (Google)'},
                      {'symbol': 'MSFT', 'name': 'Microsoft Corp.'},
                      {'symbol': 'AMZN', 'name': 'Amazon.com Inc.'}]
  
  return jsonify(available_stocks)

@app.route('/api/prices', methods=['POST'])
def get_stock_prices():
  data = request.get_json()
  symbols = data.get('symbols', [])
  prices = get_current_prices(symbols)

  return jsonify(prices)

@app.route('/api/portfolio/<user_id>', methods=['GET'])
def get_user_portfolio(user_id):
  return jsonify(portfolios.get(user_id, []))

@app.route('/api/portfolio/<user_id>/buy', methods=['POST'])
def buy_stock(user_id):
  data = request.get_json()
  symbol = data.get('symbol')
  quantity = data.get('quantity', 0)
  price = get_current_prices([symbol]).get(symbol)

  if not symbol or quantity <= 0 or price is None:
    return jsonify({'error': 'Invalid buy request.'})
  
  if user_id not in portfolios:
    portfolios[user_id] = []

  portfolios[user_id].append({'symbol': symbol, 'quantity': quantity, 'purchase_price': price})
  return jsonify({'message': f'Bought {quantity} of {symbol} at ${price}'}), 201

if __name__ == '__main__':
  app.run(debug=True)
