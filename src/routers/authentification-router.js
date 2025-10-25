import express from "express";
import { User } from "../mongo.js";
import { authenticateToken } from "../middlewares/authentication-middleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // id du token JWT
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur interne", error });
  }
});

export default router;
