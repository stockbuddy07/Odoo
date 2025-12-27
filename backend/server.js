import express from "express";
import cors from "cors";
import auth from "./routes/auth.js";
import equipment from "./routes/equipment.js";
import requests from "./routes/requests.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", auth);
app.use("/equipment", equipment);
app.use("/requests", requests);

app.listen(5000, () => console.log("Server running"));
