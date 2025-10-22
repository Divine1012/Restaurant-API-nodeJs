import express from "express";
import cors from "cors";
import session from "express-session";
import usersRouter from "./routers/users-router.js";
import authenticationRouter from "./routers/authentification-router.js";
import myAccountRouter from "./routers/my-account-router.js";
import restaurantRouter from "./routers/restaurant-router.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(session({
    secret: "secret"
}));

app.use("/users", usersRouter);
app.use("/authentification", authenticationRouter);
app.use("/my_account", myAccountRouter);
app.use("/restaurants", restaurantRouter);

app.listen(3000, () => console.log("🚀 Serveur lancé sur http://localhost:3000"));

export default app;