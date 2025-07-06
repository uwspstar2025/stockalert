const express = require("express");
const router = express.Router();
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;

// Default stock symbols to fetch
const defaultSymbols = [
  "TSLA", // Tesla, Inc.
  "AAPL", // Apple Inc.
  "GOOGL", // Alphabet Inc.
  "MSFT", // Microsoft Corporation
  "NVDA", // NVIDIA Corporation
  "AMZN", // Amazon.com Inc.
  "META", // Meta Platforms Inc.
  "AVGO", // Broadcom Inc.

  // Tech Giants
  "ORCL", // Oracle Corporation
  "CRM", // Salesforce Inc.
  "ADBE", // Adobe Inc.

  // Finance
  "JPM", // JPMorgan Chase & Co.
  "BAC", // Bank of America Corp
  "V", // Visa Inc.
  "MA", // Mastercard Inc.

  // Healthcare
  "JNJ", // Johnson & Johnson
  "UNH", // UnitedHealth Group Inc.
  "PFE", // Pfizer Inc.

  // Consumer
  "KO", // The Coca-Cola Company
  "PG", // Procter & Gamble Co.
  "WMT", // Walmart Inc.
  "HD", // The Home Depot Inc.

  // Energy
  "XOM", // Exxon Mobil Corporation
  "CVX", // Chevron Corporation

  // Entertainment
  "DIS", // The Walt Disney Company
  "NFLX", // Netflix Inc.
];

// Cache for storing stock data with timestamps
let stockCache = {
  data: [],
  lastUpdate: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes cache
};

// Function to fetch stock data from Yahoo Finance
async function fetchStockData(symbols) {
  try {
    console.log(`Fetching stock data for: ${symbols.join(", ")}`);

    const quotes = await yahooFinance.quote(symbols);
    const stockData = [];

    for (const symbol of symbols) {
      const quote = Array.isArray(quotes)
        ? quotes.find((q) => q.symbol === symbol)
        : quotes;

      if (quote && quote.regularMarketPrice) {
        const currentPrice = quote.regularMarketPrice;
        const previousClose = quote.regularMarketPreviousClose || currentPrice;
        const change = ((currentPrice - previousClose) / previousClose) * 100;

        stockData.push({
          symbol: quote.symbol,
          name: quote.longName || quote.shortName || symbol,
          price: currentPrice,
          change: parseFloat(change.toFixed(2)),
          volume: quote.regularMarketVolume || 0,
          lastUpdated: new Date().toISOString(),
          marketCap: quote.marketCap,
          dayLow: quote.regularMarketDayLow,
          dayHigh: quote.regularMarketDayHigh,
        });
      }
    }

    console.log(`Successfully fetched ${stockData.length} stocks`);
    return stockData;
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    throw error;
  }
}

// Function to get cached data or fetch new data
async function getStockData() {
  const now = Date.now();

  // Check if cache is valid
  if (
    stockCache.lastUpdate &&
    now - stockCache.lastUpdate < stockCache.cacheDuration
  ) {
    console.log("Returning cached stock data");
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
      console.log("Returning stale cached data due to fetch error");
      return stockCache.data;
    }
    throw error;
  }
}

// Get all stocks
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/stocks - Fetching stock data...");
    const stockData = await getStockData();

    res.json({
      success: true,
      data: stockData,
      timestamp: new Date().toISOString(),
      source: "Yahoo Finance API",
      cached:
        stockCache.lastUpdate &&
        Date.now() - stockCache.lastUpdate < stockCache.cacheDuration,
    });
  } catch (error) {
    console.error("Error in GET /api/stocks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stock data",
      message: error.message,
    });
  }
});

// Get list of currently tracked symbols (must be before /:symbol route)
router.get("/tracked", async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        symbols: defaultSymbols,
        count: defaultSymbols.length,
        lastUpdated: stockCache.lastUpdate
          ? new Date(stockCache.lastUpdate).toISOString()
          : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in GET /api/stocks/tracked:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get tracked stocks",
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
    let stock = cachedStocks.find(
      (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
    );

    // If not in cache or cache is stale, fetch fresh data for this symbol
    if (
      !stock ||
      !stockCache.lastUpdate ||
      Date.now() - stockCache.lastUpdate > stockCache.cacheDuration
    ) {
      try {
        const freshData = await fetchStockData([symbol.toUpperCase()]);
        if (freshData.length > 0) {
          stock = freshData[0];

          // Update cache for this symbol
          const existingIndex = stockCache.data.findIndex(
            (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
          );
          if (existingIndex >= 0) {
            stockCache.data[existingIndex] = stock;
          } else {
            stockCache.data.push(stock);
          }
        }
      } catch (fetchError) {
        console.error(
          `Error fetching fresh data for ${symbol}:`,
          fetchError.message
        );
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
      source: "Yahoo Finance API",
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

// Get stock price history
router.get("/:symbol/history", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = "1d" } = req.query;

    console.log(
      `GET /api/stocks/${symbol}/history - Fetching historical data...`
    );

    // Map period to Yahoo Finance intervals
    let interval = "1h";
    let range = "1d";

    switch (period) {
      case "1d":
        interval = "5m";
        range = "1d";
        break;
      case "1w":
        interval = "1h";
        range = "5d";
        break;
      case "1m":
        interval = "1d";
        range = "1mo";
        break;
      default:
        interval = "1h";
        range = "1d";
    }

    try {
      const result = await yahooFinance.chart(symbol.toUpperCase(), {
        period1: new Date(
          Date.now() -
            (range === "1d"
              ? 86400000
              : range === "5d"
              ? 432000000
              : 2592000000)
        ),
        period2: new Date(),
        interval: interval,
      });

      const history = result.quotes.map((quote) => ({
        timestamp: new Date(quote.date).toISOString(),
        price: quote.close || quote.open,
        volume: quote.volume || 0,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        close: quote.close,
      }));

      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          period,
          history,
        },
        source: "Yahoo Finance API",
      });
    } catch (yahoError) {
      console.error(
        `Yahoo Finance API error for ${symbol}:`,
        yahoError.message
      );

      // Fallback to mock data if Yahoo Finance fails
      const basePrice = 100;
      const dataPoints = period === "1d" ? 24 : period === "1w" ? 7 : 30;

      const history = Array.from({ length: dataPoints }, (_, i) => {
        const time = new Date();
        time.setHours(time.getHours() - (dataPoints - i));

        const fluctuation = (Math.random() - 0.5) * 0.05;
        const price = +(basePrice * (1 + fluctuation)).toFixed(2);

        return {
          timestamp: time.toISOString(),
          price: price,
          volume: Math.floor(Math.random() * 1000000) + 500000,
          high: price * 1.02,
          low: price * 0.98,
          open: price * (0.99 + Math.random() * 0.02),
          close: price,
        };
      });

      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          period,
          history,
        },
        source: "Fallback Mock Data",
      });
    }
  } catch (error) {
    console.error(
      `Error in GET /api/stocks/${req.params.symbol}/history:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch stock history",
      message: error.message,
    });
  }
});

// Add new stock to tracking list
router.post("/add", async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol || typeof symbol !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        message: "Symbol is required and must be a string",
      });
    }

    const upperSymbol = symbol.toUpperCase().trim();

    // Check if stock already exists in default symbols
    if (defaultSymbols.includes(upperSymbol)) {
      return res.status(409).json({
        success: false,
        error: "Stock already exists",
        message: `${upperSymbol} is already being tracked`,
      });
    }

    try {
      // Validate the symbol by fetching data from Yahoo Finance
      console.log(`Validating new stock symbol: ${upperSymbol}`);
      const stockData = await fetchStockData([upperSymbol]);

      if (stockData.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Stock not found",
          message: `Symbol ${upperSymbol} not found in Yahoo Finance`,
        });
      }

      // Add to default symbols array
      defaultSymbols.push(upperSymbol);

      // Add to cache
      stockCache.data.push(stockData[0]);

      console.log(`Successfully added ${upperSymbol} to tracking list`);

      res.json({
        success: true,
        message: `${upperSymbol} added to tracking list`,
        data: {
          symbol: upperSymbol,
          stockInfo: stockData[0],
          addedAt: new Date().toISOString(),
          totalStocks: defaultSymbols.length,
        },
      });
    } catch (fetchError) {
      console.error(
        `Error validating symbol ${upperSymbol}:`,
        fetchError.message
      );
      return res.status(400).json({
        success: false,
        error: "Invalid stock symbol",
        message: `Unable to fetch data for ${upperSymbol}. Please check the symbol.`,
      });
    }
  } catch (error) {
    console.error("Error in POST /api/stocks/add:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add stock",
      message: error.message,
    });
  }
});

// Remove stock from tracking list
router.delete("/remove/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase().trim();

    // Find index in default symbols
    const symbolIndex = defaultSymbols.indexOf(upperSymbol);

    if (symbolIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Stock not found",
        message: `${upperSymbol} is not being tracked`,
      });
    }

    // Remove from default symbols
    defaultSymbols.splice(symbolIndex, 1);

    // Remove from cache
    const cacheIndex = stockCache.data.findIndex(
      (s) => s.symbol === upperSymbol
    );
    if (cacheIndex >= 0) {
      stockCache.data.splice(cacheIndex, 1);
    }

    console.log(`Successfully removed ${upperSymbol} from tracking list`);

    res.json({
      success: true,
      message: `${upperSymbol} removed from tracking list`,
      data: {
        symbol: upperSymbol,
        removedAt: new Date().toISOString(),
        totalStocks: defaultSymbols.length,
      },
    });
  } catch (error) {
    console.error(
      `Error in DELETE /api/stocks/remove/${req.params.symbol}:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to remove stock",
      message: error.message,
    });
  }
});

// Add stock to watchlist (legacy endpoint)
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

// Add search endpoint for stock symbols
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    console.log(`GET /api/stocks/search/${query} - Searching for stocks...`);

    // For now, search within our default symbols and cached data
    const allStocks =
      stockCache.data.length > 0 ? stockCache.data : await getStockData();

    const searchResults = allStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      success: true,
      data: searchResults,
      query: query,
      timestamp: new Date().toISOString(),
      source: "Yahoo Finance API",
    });
  } catch (error) {
    console.error(
      `Error in GET /api/stocks/search/${req.params.query}:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to search stocks",
      message: error.message,
    });
  }
});

module.exports = router;
