import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import UserRoutes from "./server/routes/UserRoutes.js";
import mongoose from "mongoose";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use("/", UserRoutes);


const MONGO_URL="mongodb+srv://mongodb:onqJUekXZGHVWB2r@cluster0.i9foyr2.mongodb.net/OTP"
const port = 5000
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    console.log("MonogDB connected");
  })
  .catch((error) => {
    console.log(`error=> ${error}`);
  });
