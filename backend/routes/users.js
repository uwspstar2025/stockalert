const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock users data (in production, use a database)
let users = [];

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "email, password, and name are required",
      });
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      created_at: new Date().toISOString(),
      watchlist: [],
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to register user",
      message: error.message,
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing credentials",
        message: "email and password are required",
      });
    }

    // Find user
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to login",
      message: error.message,
    });
  }
});

// Get user profile (protected route)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = users.find((user) => user.id === req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        message: "User profile not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        watchlist: user.watchlist,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
      message: error.message,
    });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied",
      message: "No token provided",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: "Invalid token",
          message: "Token is not valid",
        });
      }
      req.user = user;
      next();
    }
  );
}

module.exports = router;
