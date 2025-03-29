const express = require("express");
const axios = require("axios");
const Province = require("../model/province");
const Amphure = require("../model/amphure");
const Tambon = require("../model/tambon");
const router = express.Router();

const provinceUrl = "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json";
const amphureUrl = "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json";
const tambonUrl = "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json";

const saveProvinces = async () => {
    const response = await axios.get(provinceUrl);
    for (const province of response.data) {
        await Province.updateOne(
            { provinceId: province.id },
            {
                $set: {
                    nameTH: province.name_th,
                    nameEN: province.name_en,
                },
            },
            { upsert: true }
        );
    }
};

// Save amphures to MongoDB
const saveAmphures = async () => {
    const response = await axios.get(amphureUrl);
    for (const amphure of response.data) {
        await Amphure.updateOne(
            { amphureId: amphure.id },
            {
                $set: {
                    provinceId: amphure.province_id,
                    nameTH: amphure.name_th,
                    nameEN: amphure.name_en,
                },
            },
            { upsert: true }
        );
    }
};

// Save tambons to MongoDB
const saveTambons = async () => {
    const response = await axios.get(tambonUrl);
    for (const tambon of response.data) {
        await Tambon.updateOne(
            { tambonId: tambon.id },
            {
                $set: {
                    amphureId: tambon.amphure_id,
                    nameTH: tambon.name_th,
                    nameEN: tambon.name_en,
                },
            },
            { upsert: true }
        );
    }
};

router.post("/load", async (req, res) => {
    try {
        await saveProvinces();
        await saveAmphures();
        await saveTambons();
        res.send("Data saved successfully!");
    } catch (error) {
        res.status(500).json({ message: "Error saving data", error: error.message });
    }
});

router.post("/load/provinces", async (req, res) => {
    try {
        await saveProvinces();
        res.send("Data saved successfully!");
    } catch (error) {
        res.status(500).json({ message: "Error saving data", error: error.message });
    }
});

router.post("/load/amphures", async (req, res) => {
    try {
        await saveAmphures();
        res.send("Data saved successfully!");
    } catch (error) {
        res.status(500).json({ message: "Error saving data", error: error.message });
    }
});

router.post("/load/tambons", async (req, res) => {
    try {
        await saveTambons();
        res.send("Data saved successfully!");
    } catch (error) {
        res.status(500).json({ message: "Error saving data", error: error.message });
    }
});

router.get("/provinces", async (req, res) => {
    try {
        const provinces = await Province.find();
        res.json(provinces);
    } catch (error) {
        res.status(500).json({ message: "Error fetching provinces data", error: error.message });
    }
});

router.get("/provinces/:provinceId/amphures", async (req, res) => {
    const { provinceId } = req.params;

    try {
        const amphures = await Amphure.find({ provinceId: parseInt(provinceId) });
        res.json(amphures);
    } catch (error) {
        res.status(500).json({ message: "Error fetching amphures data", error: error.message });
    }
});

router.get("/provinces/:provinceId/amphures/:amphureId/tambons", async (req, res) => {
    const { amphureId } = req.params;

    try {
        const tambons = await Tambon.find({ amphureId: parseInt(amphureId) });
        res.json(tambons);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tambons data", error: error.message });
    }
});

module.exports = router;
