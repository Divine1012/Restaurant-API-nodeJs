import express from "express";

import { User } from "../mongo.js";
import { getCurrentUser } from "../middlewares/authentication-middleware.js";

const router = express.Router();

router.get("/", getCurrentUser, async (request, response) => {
  const user = await User.findById(request.session.userID);
  response.status(200).json(user);
});

router.get("/logout",getCurrentUser, async (request, response) => {
  request.session.destroy();
  response.status(200).json({message: "Vous avez été déconnecté avec succcès !" });
});

export default router;