// src/routers/users-router.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { User } from "../mongo.js";
import {
  authenticateToken,
  isAdminOrEmployee,
  isSelfOrAdmin,
} from "../middlewares/authentication-middleware.js";
import {
  isValidID,
  userExists,
} from "../middlewares/params-middleware.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_long";

/**
 * @route   POST /users/register
 * @desc    Inscription (publique). Rôle forcé à "user" pour éviter l’élévation de privilèges.
 */
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body || {};

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Champs requis : email, username, password" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email déjà existant, veuillez en utiliser un autre." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashed,
      role: "user", // on force "user" à l'inscription publique
    });

    await newUser.save();
    return res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'inscription", error: error?.message });
  }
});

/**
 * @route   POST /users/login
 * @desc    Connexion → retourne un JWT
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Champs requis : email, password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Identifiants invalides" });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "12h", algorithm: "HS256" }
    );

    return res.status(200).json({
      message: "Connexion réussie !",
      token,
      user: { id: user._id, email: user.email, role: user.role, username: user.username },
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la connexion", error: error?.message });
  }
});

/**
 * @route   GET /users
 * @desc    Lister tous les utilisateurs (admin/employee)
 */
router.get("/", authenticateToken, isAdminOrEmployee, async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération des utilisateurs", error: error?.message });
  }
});

/**
 * @route   GET /users/:id
 * @desc    Lire un utilisateur (admin/employee)
 */
router.get("/:id", authenticateToken, isAdminOrEmployee, isValidID, userExists, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération de l'utilisateur", error: error?.message });
  }
});

/**
 * @route   PUT /users/:id
 * @desc    Modifier un utilisateur (self OU admin)
 */
router.put("/:id", authenticateToken, isSelfOrAdmin, isValidID, userExists, async (req, res) => {
  try {
    const id = req.params.id;
    const { email, username, password, role } = req.body || {};

    // Check conflit email si changé
    if (email) {
      const current = await User.findById(id);
      if (!current) return res.status(404).json({ message: "Utilisateur inexistant !" });

      if (current.email !== email) {
        const conflict = await User.findOne({ email });
        if (conflict) {
          return res.status(409).json({ message: "Email déjà existant, veuillez utiliser une autre adresse !" });
        }
      }
    }

    const updates = {};
    if (email) updates.email = email;
    if (username) updates.username = username;

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    // Le rôle ne peut être modifié que par un admin
    if (typeof role !== "undefined") {
      if (req.user?.role === "admin") {
        updates.role = role;
      }
      // sinon on ignore le champ role envoyé par un user non-admin
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ message: "Utilisateur inexistant !" });

    return res.status(200).json({ message: `L'utilisateur ${id} a été modifié avec succès !`, user: updated });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la mise à jour", error: error?.message });
  }
});

/**
 * @route   DELETE /users/:id
 * @desc    Supprimer un utilisateur (self OU admin)
 */
router.delete("/:id", authenticateToken, isSelfOrAdmin, isValidID, userExists, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id).select("-password");
    return res.status(200).json({ message: `L'utilisateur ${req.params.id} a été supprimé avec succès !`, user: deleted });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la suppression", error: error?.message });
  }
});

export default router;