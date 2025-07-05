const WebSocket = require("ws");
const cron = require("node-cron");

let wss;
let clients = new Set();

// Initialize WebSocket server
function initializeWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection established");
    clients.add(ws);

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "welcome",
        message: "Connected to Stock Tracker WebSocket",
        timestamp: new Date().toISOString(),
      })
    );

    // Handle incoming messages
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(ws, data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
            timestamp: new Date().toISOString(),
          })
        );
      }
    });

    // Handle connection close
    ws.on("close", () => {
      console.log("WebSocket connection closed");
      clients.delete(ws);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });

  // Start real-time data broadcasting
  startRealTimeDataBroadcast();

  console.log("WebSocket server initialized");
}

// Handle WebSocket messages
function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case "subscribe":
      handleSubscription(ws, data);
      break;
    case "unsubscribe":
      handleUnsubscription(ws, data);
      break;
    case "ping":
      ws.send(
        JSON.stringify({
          type: "pong",
          timestamp: new Date().toISOString(),
        })
      );
      break;
    default:
      ws.send(
        JSON.stringify({
          type: "error",
          message: `Unknown message type: ${data.type}`,
          timestamp: new Date().toISOString(),
        })
      );
  }
}

// Handle stock subscription
function handleSubscription(ws, data) {
  const { symbols } = data;

  if (!symbols || !Array.isArray(symbols)) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Invalid subscription request - symbols array required",
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Store subscription info on the WebSocket connection
  ws.subscriptions = ws.subscriptions || new Set();
  symbols.forEach((symbol) => ws.subscriptions.add(symbol.toUpperCase()));

  ws.send(
    JSON.stringify({
      type: "subscription_confirmed",
      symbols: Array.from(ws.subscriptions),
      timestamp: new Date().toISOString(),
    })
  );
}

// Handle stock unsubscription
function handleUnsubscription(ws, data) {
  const { symbols } = data;

  if (!symbols || !Array.isArray(symbols)) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Invalid unsubscription request - symbols array required",
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (ws.subscriptions) {
    symbols.forEach((symbol) => ws.subscriptions.delete(symbol.toUpperCase()));
  }

  ws.send(
    JSON.stringify({
      type: "unsubscription_confirmed",
      symbols: symbols,
      timestamp: new Date().toISOString(),
    })
  );
}

// Broadcast real-time stock data
function startRealTimeDataBroadcast() {
  // Mock stock symbols and their base prices
  const stockData = {
    TSLA: { basePrice: 177.97, lastPrice: 177.97 },
    AAPL: { basePrice: 189.25, lastPrice: 189.25 },
    GOOGL: { basePrice: 2456.78, lastPrice: 2456.78 },
    MSFT: { basePrice: 345.67, lastPrice: 345.67 },
    NVDA: { basePrice: 456.89, lastPrice: 456.89 },
    AMZN: { basePrice: 123.45, lastPrice: 123.45 },
    META: { basePrice: 234.56, lastPrice: 234.56 },
    AVGO: { basePrice: 1234.56, lastPrice: 1234.56 },
  };

  // Broadcast updated prices every 5 seconds
  cron.schedule("*/5 * * * * *", () => {
    const updates = {};

    Object.keys(stockData).forEach((symbol) => {
      // Generate random price movement (±2%)
      const fluctuation = (Math.random() - 0.5) * 0.04;
      const newPrice = stockData[symbol].basePrice * (1 + fluctuation);
      const change =
        ((newPrice - stockData[symbol].lastPrice) /
          stockData[symbol].lastPrice) *
        100;

      stockData[symbol].lastPrice = newPrice;

      updates[symbol] = {
        symbol,
        price: +newPrice.toFixed(2),
        change: +change.toFixed(2),
        volume: Math.floor(Math.random() * 1000000) + 500000,
        timestamp: new Date().toISOString(),
      };
    });

    // Send updates to subscribed clients
    broadcastToSubscribedClients(updates);
  });
}

// Broadcast data to clients subscribed to specific symbols
function broadcastToSubscribedClients(updates) {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN && ws.subscriptions) {
      const relevantUpdates = {};

      ws.subscriptions.forEach((symbol) => {
        if (updates[symbol]) {
          relevantUpdates[symbol] = updates[symbol];
        }
      });

      if (Object.keys(relevantUpdates).length > 0) {
        ws.send(
          JSON.stringify({
            type: "price_update",
            data: relevantUpdates,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }
  });
}

// Broadcast message to all connected clients
function broadcastToAll(message) {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

// Send alert notification via WebSocket
function sendAlertNotification(alert) {
  const message = {
    type: "alert",
    data: alert,
    timestamp: new Date().toISOString(),
  };

  broadcastToAll(message);
}

module.exports = {
  initializeWebSocket,
  broadcastToAll,
  sendAlertNotification,
};
