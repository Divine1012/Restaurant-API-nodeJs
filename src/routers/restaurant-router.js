import express from "express";
import { Restaurant } from "../mongo.js"; // ton modèle mongoose
import { authenticateToken, isAdmin } from "../middlewares/authentication-middleware.js";

const router = express.Router();

/**
 * 🔹 POST /restaurants
 * -> Création d’un restaurant (ADMIN uniquement)
 */
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du restaurant", error });
  }
});

/**
 * 🔹 GET /restaurants
 * -> Lecture publique (avec pagination et tri)
 */
router.get("/", async (req, res) => {
  try {
    const { sort, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: 1 } : {};
    const restaurants = await Restaurant.find()
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des restaurants", error });
  }
});

/**
 * 🔹 GET /restaurants/:id
 * -> Lecture publique d’un seul restaurant
 */
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant introuvable" });
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du restaurant", error });
  }
});

/**
 * 🔹 PUT /restaurants/:id
 * -> Mise à jour (ADMIN uniquement)
 */
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!restaurant) return res.status(404).json({ message: "Restaurant introuvable" });
    res.status(200).json({ message: "Restaurant mis à jour avec succès", restaurant });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
});

/**
 * 🔹 DELETE /restaurants/:id
 * -> Suppression (ADMIN uniquement)
 */
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Restaurant supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
});

export default router;