import express from "express";
import { Menu } from "../mongo.js";
import { authenticateToken, isAdmin } from "../middlewares/authentication-middleware.js";

const router = express.Router();

// ✅ Créer un menu (ADMIN uniquement)
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    res.status(201).json({ message: "Menu créé avec succès", menu });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du menu", error });
  }
});

// ✅ Récupérer tous les menus (public, avec tri/pagination)
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sort || "name";

    const menus = await Menu.find().sort({ [sortField]: 1 }).limit(limit);
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des menus", error });
  }
});

// ✅ Récupérer un menu par ID
router.get("/:id", async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu introuvable" });
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du menu", error });
  }
});

// ✅ Modifier un menu (ADMIN uniquement)
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMenu) return res.status(404).json({ message: "Menu introuvable" });
    res.status(200).json({ message: "Menu mis à jour avec succès", menu: updatedMenu });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du menu", error });
  }
});

// ✅ Supprimer un menu (ADMIN uniquement)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
    if (!deletedMenu) return res.status(404).json({ message: "Menu introuvable" });
    res.status(200).json({ message: "Menu supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du menu", error });
  }
});

export default router;
