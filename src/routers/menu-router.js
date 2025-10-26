import express from "express";
import { Menu } from "../mongo.js";
import { authenticateToken, isAdmin } from "../middlewares/authentication-middleware.js";

const router = express.Router();

// CREATE (admin)
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const menu = await Menu.create(req.body); // { restaurant_id, name, description, price, category }
    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ message: "Erreur de création", error });
  }
});

// READ list (public) + tri/pagination + filtre category
router.get("/", async (req, res) => {
  const { sort = "price", page = 1, limit = 10, category } = req.query;
  const filter = category ? { category } : {};
  const allowedSort = ["price", "category", "name"];
  const sortOption = allowedSort.includes(sort) ? { [sort]: 1 } : {};

  const items = await Menu.find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json(items);
});

// READ one (public)
router.get("/:id", async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Menu introuvable" });
  res.status(200).json(item);
});

// UPDATE (admin)
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  const item = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Menu introuvable" });
  res.status(200).json({ message: "Menu mis à jour", item });
});

// DELETE (admin)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Menu supprimé" });
});

export default router;