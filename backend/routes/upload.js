const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const Dustbin = require("../models/Dustbin");
const DustbinHistory = require("../models/DustbinHistory");
const config = require("../config/env");
const { createAdminNotificationIfCritical } = require("../utils/notifications");

const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post("/", upload.single("image"), async (req, res) => {
  const filePath = req.file ? req.file.path : null;

  try {
    const { dustbinId } = req.body;
    const parsedDustbinId = Number(dustbinId);

    if (!parsedDustbinId || Number.isNaN(parsedDustbinId)) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Valid dustbinId is required" });
    }

    let level = "half-full";
    let percentage = 60;

    if (filePath && fs.existsSync(filePath)) {
      try {
        const form = new FormData();
        form.append("image", fs.createReadStream(filePath));

        const response = await axios.post(config.modelApiUrl, form, {
          headers: form.getHeaders(),
          timeout: 60000,
        });

        if (response.data && response.data.level !== undefined) {
          level = response.data.level;
          percentage = response.data.percentage;
        }
      } catch (modelErr) {
        console.warn("Python Model Server call timeout/notice:", modelErr.message);
      }
    }

    const mongoose = require("mongoose");
    const isMongoConnected = () => mongoose.connection.readyState === 1;

    let updated = {
      id: parsedDustbinId,
      lat: 19.0222,
      lng: 72.8561,
      level,
      percentage,
      updatedAt: "Just now",
    };

    let previousBin = {
      id: parsedDustbinId,
      lat: 19.0222,
      lng: 72.8561,
      level: "empty",
      percentage: 0,
    };

    if (isMongoConnected()) {
      try {
        const existingBin = await Dustbin.findOne({ id: parsedDustbinId });
        if (existingBin) {
          previousBin = existingBin.toObject();
        }

        const dbUpdated = await Dustbin.findOneAndUpdate(
          { id: parsedDustbinId },
          {
            id: parsedDustbinId,
            lat: previousBin.lat || 19.0222,
            lng: previousBin.lng || 72.8561,
            level,
            percentage,
            updatedAt: "Just now",
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        if (dbUpdated) {
          updated = dbUpdated.toObject();
        }

        await DustbinHistory.create({
          dustbinId: parsedDustbinId,
          level,
          percentage,
          source: "upload",
        });

        await createAdminNotificationIfCritical({
          previousBin,
          updatedBin: updated,
          source: "upload",
        });
      } catch (dbErr) {
        console.warn("MongoDB database write notice:", dbErr.message);
      }
    }

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: "Dustbin updated",
      data: updated,
    });
  } catch (err) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Upload handler error:", err);
    res.status(500).json({ error: err.message || "Upload processing failed" });
  }
});

module.exports = router;
