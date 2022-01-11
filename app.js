const express = require("express");
const cors = require("cors");
require("dotenv").config();

// routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const threadRoutes = require("./routes/thread.routes");
const categoryRoutes = require("./routes/category.routes");
const contentTypeRoutes = require("./routes/contentType.routes");
const contentStatusRoutes = require("./routes/contentStatus.routes");

// create express app
const app = express();

// body parser
app.use(express.json());

// cors
app.use(cors());

// set routes
app.use("/images", express.static("images"));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/thread", threadRoutes);

// other routes
app.use("/api/category", categoryRoutes);
app.use("/api/content/type", contentTypeRoutes);
app.use("/api/content/status", contentStatusRoutes);

module.exports = app;
