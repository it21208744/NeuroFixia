const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());


const URL = process.env.MONGODB_URL;
mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Mongodb Connection success!");
});

const gameRouter = require("./routes/GamedataRoute.js");


app.use("/game", gameRouter);
// Define the predict route for handling prediction requests
app.post("/predict", async (req, res) => {
  try {
    const features = req.body.features;

    if (!features || features.length === 0) {
      return res.status(400).json({ error: "Features not provided" });
    }

    // Send request to the Flask API for prediction
    const flaskApiUrl = "http://127.0.0.1:5000/predict"; // Your Flask API URL
    const response = await axios.post(flaskApiUrl, { features });

    // Return the prediction result
    res.json({ prediction: response.data.prediction });
  } catch (error) {
    console.error("Error during prediction:", error);
    res.status(500).json({ error: "Prediction failed" });
  }
});


app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);
  });