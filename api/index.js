const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("../config/database");
const userRoutes = require("../function/user");
const postRoutes = require("../function/post");
const reviewRoutes = require("../function/review");
const locationRouters = require("../function/location");
const imgeRouters = require("../function/image");

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// Connect to MongoDB
connectDB();

const PORT = 5000;

app.get("/", (req, res) => {
    res.status(200).json(`Server running on port ${PORT}`);
  });

// Routes
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/reviews", reviewRoutes);
app.use("/locations", locationRouters);
app.use("/upload-images", imgeRouters);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;