const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const Dustbin = require("../models/Dustbin");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { dustbinId } = req.body;
    const filePath = req.file.path;

    // Send image to Python API
    const form = new FormData();
    form.append("image", fs.createReadStream(filePath));

    const response = await axios.post(
      "http://127.0.0.1:5001/predict",
      form,
      { headers: form.getHeaders() }
    );

    const { level, percentage } = response.data;

    // Update MongoDB
    const updated = await Dustbin.findOneAndUpdate(
      { id: dustbinId },
      {
        level,
        percentage,
        updatedAt: "Just now",
      },
      { new: true }
    );

    // Delete temp file
    fs.unlinkSync(filePath);

    res.json({
      message: "Dustbin updated",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
