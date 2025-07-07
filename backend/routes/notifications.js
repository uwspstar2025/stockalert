const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// In-memory storage for demo (use database in production)
const notifications = [];
const userSettings = new Map();

// Email transporter setup (use environment variables in production)
const createTransporter = () => {
  // For demo purposes, we'll use a test account
  // In production, use your actual email service (Gmail, SendGrid, etc.)
  return nodemailer.createTransporter({
    host: "smtp.ethereal.email", // Test SMTP server
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "test@example.com",
      pass: process.env.EMAIL_PASS || "test123",
    },
  });
};

// Send email notification
router.post("/email", async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, subject, body",
      });
    }

    // For demo purposes, we'll simulate email sending
    // In production, uncomment the actual email sending code below

    /*
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@stocktracker.com',
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007acc;">股票监控系统通知</h2>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            ${body.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            这是一封来自股票监控系统的自动通知邮件。
            <br>如果您不希望收到此类邮件，请在系统设置中关闭邮件通知。
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    */

    // Log the notification (simulate sending)
    const notification = {
      id: Date.now().toString(),
      to,
      subject,
      body,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    notifications.push(notification);
    console.log("📧 Email notification logged:", notification);

    res.json({
      success: true,
      message: "邮件通知已发送成功",
      notificationId: notification.id,
    });
  } catch (error) {
    console.error("Email notification error:", error);
    res.status(500).json({
      success: false,
      error: "邮件发送失败",
      details: error.message,
    });
  }
});

// Get notification history
router.get("/history", (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  const paginatedNotifications = notifications
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
    .reverse(); // Most recent first

  res.json({
    success: true,
    data: paginatedNotifications,
    total: notifications.length,
  });
});

// Save user notification settings
router.post("/settings", (req, res) => {
  try {
    const { userId = "default", settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        error: "Settings are required",
      });
    }

    userSettings.set(userId, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "通知设置已保存",
      settings: userSettings.get(userId),
    });
  } catch (error) {
    console.error("Settings save error:", error);
    res.status(500).json({
      success: false,
      error: "设置保存失败",
      details: error.message,
    });
  }
});

// Get user notification settings
router.get("/settings/:userId?", (req, res) => {
  const userId = req.params.userId || "default";
  const settings = userSettings.get(userId);

  if (!settings) {
    // Return default settings
    return res.json({
      success: true,
      data: {
        email: "",
        enableEmail: false,
        enableBrowser: true,
        enableSound: true,
        priceAlerts: true,
        strategyAlerts: true,
        marketAlerts: true,
      },
    });
  }

  res.json({
    success: true,
    data: settings,
  });
});

// Create stock price alert
router.post("/stock-alert", async (req, res) => {
  try {
    const { stockSymbol, currentPrice, targetPrice, condition, userEmail } =
      req.body;

    if (!stockSymbol || !currentPrice || !targetPrice || !condition) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Create alert notification
    const alert = {
      id: Date.now().toString(),
      type: "stock_alert",
      stockSymbol,
      currentPrice,
      targetPrice,
      condition,
      userEmail,
      triggered: false,
      createdAt: new Date().toISOString(),
    };

    // In production, save to database
    console.log("📊 Stock alert created:", alert);

    // If email is provided and alert is triggered, send notification
    if (userEmail && shouldTriggerAlert(currentPrice, targetPrice, condition)) {
      const emailSubject = `股价提醒: ${stockSymbol} 达到目标价格`;
      const emailBody = `
        您关注的股票 ${stockSymbol} 已达到设定的价格条件：
        
        当前价格: $${currentPrice}
        目标价格: $${targetPrice}
        触发条件: ${condition === "above" ? "高于" : "低于"}目标价格
        
        建议您及时查看并考虑相应的投资操作。
      `;

      // Send email notification (simulated)
      console.log("📧 Stock alert email would be sent to:", userEmail);
    }

    res.json({
      success: true,
      message: "股价提醒已创建",
      alertId: alert.id,
    });
  } catch (error) {
    console.error("Stock alert creation error:", error);
    res.status(500).json({
      success: false,
      error: "股价提醒创建失败",
      details: error.message,
    });
  }
});

// Helper function to check if alert should be triggered
function shouldTriggerAlert(currentPrice, targetPrice, condition) {
  if (condition === "above") {
    return currentPrice >= targetPrice;
  } else if (condition === "below") {
    return currentPrice <= targetPrice;
  }
  return false;
}

// Test notification endpoint
router.post("/test", (req, res) => {
  const testNotification = {
    id: Date.now().toString(),
    type: "test",
    message: "这是一条测试通知",
    timestamp: new Date().toISOString(),
  };

  notifications.push(testNotification);

  res.json({
    success: true,
    message: "测试通知已创建",
    notification: testNotification,
  });
});

module.exports = router;
