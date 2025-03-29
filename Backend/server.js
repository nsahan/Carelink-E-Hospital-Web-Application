import express from "express";
import cors from "cors";
import "dotenv/config";
import connectdb from "./config/mongodb.js";
import connectcloudinary from "./config/cloudinary.js";
import router from "./routes/adminroute.js";
import doctorRouter from "./routes/doctorroute.js"; // Add this line

//app config
const app = express();
const port = process.env.PORT || 9000;
connectdb();
connectcloudinary();
//db config

//middlewareb
app.use(express.json());
app.use(cors()); //cors is used to allow the request from the frontend to the backend

//api endpoints
app.use("/api/admin", router);
app.use("/api/doctor", doctorRouter); // Add this line

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

app.get("/", (req, res) => res.status(200).send("Hello World"));

//listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));
