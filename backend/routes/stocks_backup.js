const express = require("express");
const router = express.Router();
const axios = require("axios");
const yahooFinance = require('yahoo-finance2').default;

// Default stock symbols to fetch
const defaultSymbols = [
  "TSLA", "AAPL", "GOOGL", "MSFT", "NVDA", "AMZN", "META", "AVGO"
];

// Cache for storing stock data with timestamps
let stockCache = {
  data: [],
  lastUpdate: null,
  cacheDuration: 5 * 60 * 1000 // 5 minutes cache
};

// Function to fetch stock data from Yahoo Finance
async function fetchStockData(symbols) {
  try {
    console.log(`Fetching stock data for: ${symbols.join(', ')}`);
    
    const quotes = await yahooFinance.quote(symbols);
    const stockData = [];
    
    for (const symbol of symbols) {
      const quote = Array.isArray(quotes) ? quotes.find(q => q.symbol === symbol) : quotes;
      
      if (quote && quote.regularMarketPrice) {
        const currentPrice = quote.regularMarketPrice;
        const previousClose = quote.regularMarketPreviousClose || currentPrice;
        const change = ((currentPrice - previousClose) / previousClose * 100);
        
        stockData.push({
          symbol: quote.symbol,
          name: quote.longName || quote.shortName || symbol,
          price: currentPrice,
          change: parseFloat(change.toFixed(2)),
          volume: quote.regularMarketVolume || 0,
          lastUpdated: new Date().toISOString(),
          marketCap: quote.marketCap,
          dayLow: quote.regularMarketDayLow,
          dayHigh: quote.regularMarketDayHigh
        });
      }
    }
    
    console.log(`Successfully fetched ${stockData.length} stocks`);
    return stockData;
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    throw error;
  }
}

// Function to get cached data or fetch new data
async function getStockData() {
  const now = Date.now();
  
  // Check if cache is valid
  if (stockCache.lastUpdate && (now - stockCache.lastUpdate) < stockCache.cacheDuration) {
    console.log('Returning cached stock data');
    return stockCache.data;
  }
  
  try {
    // Fetch fresh data
    const freshData = await fetchStockData(defaultSymbols);
    
    // Update cache
    stockCache.data = freshData;
    stockCache.lastUpdate = now;
    
    return freshData;
  } catch (error) {
    // If fresh fetch fails and we have cached data, return it
    if (stockCache.data.length > 0) {
      console.log('Returning stale cached data due to fetch error');
      return stockCache.data;
    }
    throw error;
  }
}

// Get all stocks
router.get("/", async (req, res) => {
  try {
    console.log('GET /api/stocks - Fetching stock data...');
    const stockData = await getStockData();
    
    res.json({
      success: true,
      data: stockData,
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance API',
      cached: stockCache.lastUpdate && (Date.now() - stockCache.lastUpdate) < stockCache.cacheDuration
    });
  } catch (error) {
    console.error('Error in GET /api/stocks:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stock data",
      message: error.message,
    });
  }
});

// Get specific stock by symbol
router.get("/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`GET /api/stocks/${symbol} - Fetching specific stock data...`);
    
    // Try to get from cache first
    const cachedStocks = stockCache.data;
    let stock = cachedStocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());
    
    // If not in cache or cache is stale, fetch fresh data for this symbol
    if (!stock || !stockCache.lastUpdate || (Date.now() - stockCache.lastUpdate) > stockCache.cacheDuration) {
      try {
        const freshData = await fetchStockData([symbol.toUpperCase()]);
        if (freshData.length > 0) {
          stock = freshData[0];
          
          // Update cache for this symbol
          const existingIndex = stockCache.data.findIndex(s => s.symbol.toLowerCase() === symbol.toLowerCase());
          if (existingIndex >= 0) {
            stockCache.data[existingIndex] = stock;
          } else {
            stockCache.data.push(stock);
          }
        }
      } catch (fetchError) {
        console.error(`Error fetching fresh data for ${symbol}:`, fetchError.message);
        // Continue with cached data if available
      }
    }

    if (!stock) {
      return res.status(404).json({
        success: false,
        error: "Stock not found",
        message: `Stock with symbol ${symbol} not found`,
      });
    }

    res.json({
      success: true,
      data: stock,
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance API'
    });
  } catch (error) {
    console.error(`Error in GET /api/stocks/${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stock data",
      message: error.message,
    });
  }
});
    const updatedStock = {
      ...stock,
      price: +(stock.price * (1 + fluctuation)).toFixed(2),
      change: +(stock.change + fluctuation * 100).toFixed(2),
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: updatedStock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch stock data",
      message: error.message,
    });
  }
});

// Get stock price history
router.get("/:symbol/history", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = "1d" } = req.query;

    // Generate mock historical data
    const basePrice =
      mockStocks.find((s) => s.symbol.toLowerCase() === symbol.toLowerCase())
        ?.price || 100;
    const dataPoints = period === "1d" ? 24 : period === "1w" ? 7 : 30;

    const history = Array.from({ length: dataPoints }, (_, i) => {
      const time = new Date();
      time.setHours(time.getHours() - (dataPoints - i));

      const fluctuation = (Math.random() - 0.5) * 0.05;
      return {
        timestamp: time.toISOString(),
        price: +(basePrice * (1 + fluctuation)).toFixed(2),
        volume: Math.floor(Math.random() * 1000000) + 500000,
      };
    });

    res.json({
      success: true,
      data: {
        symbol,
        period,
        history,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch stock history",
      message: error.message,
    });
  }
});

// Add stock to watchlist
router.post("/watchlist", async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        message: "symbols array is required",
      });
    }

    // In production, this would save to database
    res.json({
      success: true,
      message: "Stocks added to watchlist",
      data: { symbols, addedAt: new Date().toISOString() },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to add stocks to watchlist",
      message: error.message,
    });
  }
});

module.exports = router;
