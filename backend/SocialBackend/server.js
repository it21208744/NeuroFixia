const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 8070;

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






const SocialRouter = require("./routes/Sroute.js");
app.use("/Sroute", SocialRouter);

const InitialRouter = require("./routes/Iroute.js");
app.use("/Iroute", InitialRouter);

const Proute = require("./routes/Proute.js");
app.use("/Proute",  Proute);


app.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});
