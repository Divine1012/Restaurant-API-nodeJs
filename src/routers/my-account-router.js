import express from "express";
import { User } from "../mongo.js";
import { authenticateToken } from "../middlewares/authentication-middleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  const me = await User.findById(req.user.id);
  if (!me) return res.status(404).json({ message: "Utilisateur introuvable" });
  res.status(200).json(me);
});

router.get("/logout", authenticateToken, (_req, res) => {
  // En JWT stateless, le logout se fait côté client (supprimer le token)
  res.status(200).json({ message: "Déconnecté (supprimez le token côté client)" });
});

export default router;