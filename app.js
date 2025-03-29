const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const userRoutes = require("./api/user");
const postRoutes = require("./api/post");
const reviewRoutes = require("./api/review");
const locationRouters = require("./api/location");

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/reviews", reviewRoutes);
app.use("/locations", locationRouters);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));