const express = require("express");
const router = express.Router();

// Mock alerts data
let alerts = [];

// Get all alerts
router.get("/", async (req, res) => {
  try {
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch alerts",
      message: error.message,
    });
  }
});

// Create new alert
router.post("/", async (req, res) => {
  try {
    const {
      symbol,
      type, // 'price_above', 'price_below', 'change_percent'
      value,
      notification_method, // 'email', 'sms', 'push'
    } = req.body;

    if (!symbol || !type || !value || !notification_method) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "symbol, type, value, and notification_method are required",
      });
    }

    const alert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      type,
      value: parseFloat(value),
      notification_method,
      active: true,
      created_at: new Date().toISOString(),
      triggered_at: null,
    };

    alerts.push(alert);

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create alert",
      message: error.message,
    });
  }
});

// Update alert
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const alertIndex = alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
        message: `Alert with id ${id} not found`,
      });
    }

    alerts[alertIndex] = { ...alerts[alertIndex], ...updates };

    res.json({
      success: true,
      message: "Alert updated successfully",
      data: alerts[alertIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update alert",
      message: error.message,
    });
  }
});

// Delete alert
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const alertIndex = alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
        message: `Alert with id ${id} not found`,
      });
    }

    alerts.splice(alertIndex, 1);

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete alert",
      message: error.message,
    });
  }
});

// Trigger alert (for testing)
router.post("/:id/trigger", async (req, res) => {
  try {
    const { id } = req.params;

    const alertIndex = alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
        message: `Alert with id ${id} not found`,
      });
    }

    alerts[alertIndex].triggered_at = new Date().toISOString();

    // Here you would send the actual notification
    console.log(
      `Alert triggered: ${alerts[alertIndex].symbol} - ${alerts[alertIndex].type}`
    );

    res.json({
      success: true,
      message: "Alert triggered successfully",
      data: alerts[alertIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to trigger alert",
      message: error.message,
    });
  }
});

module.exports = router;
