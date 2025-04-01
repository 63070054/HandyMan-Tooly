const axios = require("axios");
const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { image } = req.body; // Expecting a Base64-encoded image from the frontend

        if (!image) {
            return res.status(400).json({ error: "No image provided" });
        }

        const apiKey = "6QLlyX4NDqpLsLS0jjRQkTbCKDPQz4Xp"; // Replace with your actual TinyPNG API key

        // Convert Base64 string to a binary buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, ""); // Remove metadata (if present)
        const imageBuffer = Buffer.from(base64Data, "base64"); // Convert to buffer

        // Send request to TinyPNG API
        const response = await axios.post("https://api.tinify.com/shrink", imageBuffer, {
            headers: {
                "Content-Type": "application/octet-stream", // Required for binary data
                Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`, // TinyPNG requires Basic Auth
            },
            maxBodyLength: Infinity,
        });

        const data = response.data;

        if (data.output && data.output.url) {
            res.json({ imageUrl: data.output.url });
        } else {
            res.status(400).json({ error: "Failed to upload image." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
