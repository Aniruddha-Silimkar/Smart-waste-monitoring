const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const config = require("../config/env");
const localAuthStore = require("../utils/localAuthStore");

const router = express.Router();

function createToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = isMongoConnected()
      ? await User.findOne({ email: normalizedEmail })
      : localAuthStore.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    };
    const user = isMongoConnected()
      ? await User.create(userData)
      : localAuthStore.createUser(userData);

    const token = createToken({
      userId: user._id.toString(),
      role: user.role || "user",
    });
    return res.status(201).json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (role === "admin") {
      if (normalizedEmail !== config.adminEmail || password !== config.adminPassword) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }

      const token = createToken({
        role: "admin",
        adminEmail: config.adminEmail,
        adminName: config.adminName,
      });
      return res.json({
        token,
        user: {
          id: "admin",
          name: config.adminName,
          email: config.adminEmail,
          role: "admin",
        },
      });
    }

    const user = isMongoConnected()
      ? await User.findOne({ email: normalizedEmail })
      : localAuthStore.findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken({
      userId: user._id.toString(),
      role: user.role || "user",
    });
    return res.json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Failed to log in" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.role === "admin") {
      return res.json({
        user: {
          id: "admin",
          name: payload.adminName || config.adminName,
          email: payload.adminEmail || config.adminEmail,
          role: "admin",
        },
      });
    }

    const user = isMongoConnected()
      ? await User.findById(payload.userId).select("-password")
      : localAuthStore.findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
