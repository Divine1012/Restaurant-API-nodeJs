import express from "express";
import cors from "cors";
import setupSwagger from "./config/swagger.js";
import usersRouter from "./routers/users-router.js";
import myAccountRouter from "./routers/my-account-router.js";
import restaurantRouter from "./routers/restaurant-router.js";
import menuRouter from "./routers/menu-router.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", usersRouter);
app.use("/my_account", myAccountRouter);
app.use("/restaurants", restaurantRouter);
app.use("/menus", menuRouter);

// Swagger
setupSwagger(app);

export default app; // <-- juste exporter app
