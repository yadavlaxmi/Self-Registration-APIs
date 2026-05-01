require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// middleware
app.use(express.json());

// DB
connectDB();

// routes
app.use("/api", require("./routes/candidateRoutes"));

// test route
app.get("/", (req, res) => {
  res.send("OnGrid Backend Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});