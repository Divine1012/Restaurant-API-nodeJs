import mongoose from "mongoose";

import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();


// Import des routes
import usersRouter from "./routers/users-router.js";
import authenticationRouter from "./routers/authentification-router.js";
import myAccountRouter from "./routers/my-account-router.js";
import restaurantRouter from "./routers/restaurant-router.js";
import menuRouter from "./routers/menu-routers.js";

const SECRET_KEY = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((error) => console.error("❌ Erreur de connexion MongoDB :", error));


app.use("/users", usersRouter);
app.use("/authentification", authenticationRouter);
app.use("/my_account", myAccountRouter);
app.use("/restaurants", restaurantRouter);
app.use("/menus", menuRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));

export default app;