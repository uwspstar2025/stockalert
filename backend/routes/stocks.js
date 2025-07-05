const express = require("express");
const router = express.Router();
const axios = require("axios");

// Mock stock data - replace with real API integration
const mockStocks = [
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 177.97,
    change: 2.4,
    volume: 45234567,
  },
  {
    symbol: "AVGO",
    name: "Broadcom Inc.",
    price: 1234.56,
    change: -1.2,
    volume: 12345678,
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.25,
    change: 0.8,
    volume: 67890123,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 2456.78,
    change: 1.5,
    volume: 23456789,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 345.67,
    change: -0.5,
    volume: 34567890,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 456.89,
    change: 3.2,
    volume: 45678901,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 123.45,
    change: -2.1,
    volume: 56789012,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 234.56,
    change: -1.8,
    volume: 67890123,
  },
];

// Get all stocks
router.get("/", async (req, res) => {
  try {
    // In production, this would fetch from a real stock API
    res.json({
      success: true,
      data: mockStocks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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
    const stock = mockStocks.find(
      (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
    );

    if (!stock) {
      return res.status(404).json({
        success: false,
        error: "Stock not found",
        message: `Stock with symbol ${symbol} not found`,
      });
    }

    // Simulate real-time price fluctuation
    const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
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
