const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("./middleware/error");
const routes = require("./routes"); // Imports from routes/index.js
const corsOptions = require("./config/corsOptions");

const app = express();

// 1. Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// 2. Health check (Keep this light)
app.get("/", (req, res) => {
  res.json({ name: "ዳሎል ቢንጎ ጨዋታዎች" });
});

// 3. API Routes
// All routes are now prefixed with /api here
app.use("/api", routes);

// 4. Error Handler (Should be last)
app.use(errorHandler);

module.exports = app;