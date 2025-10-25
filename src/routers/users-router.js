import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../mongo.js";
import { isAdmin, isAdminOrCurrentUser, authenticateToken } from "../middlewares/authentication-middleware.js";
import { isValidID, userExists } from "../middlewares/params-middleware.js";

const router = express.Router();

/* ------------------ INSCRIPTION ------------------ */
router.post("/register", async (request, response) => {
  try {
    const { email, username, password, role } = request.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.status(409).json({ message: "Email déjà existant, veuillez en utiliser un autre." });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();
    response.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (error) {
    response.status(500).json({ message: "Erreur lors de l'inscription", error });
  }
});

/* ------------------ CONNEXION ------------------ */
router.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;

    // Vérifier l'utilisateur
    const user = await User.findOne({ email });
    if (!user) return response.status(404).json({ message: "Utilisateur non trouvé" });

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return response.status(400).json({ message: "Mot de passe incorrect" });

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "supersecretkey", // ⚠️ à déplacer dans un fichier .env plus tard
      { expiresIn: "2h" }
    );

    response.status(200).json({
      message: "Connexion réussie !",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    response.status(500).json({ message: "Erreur lors de la connexion", error });
  }
});

/* ------------------ LIRE TOUS LES UTILISATEURS ------------------ */
router.get("/", authenticateToken, isAdmin,async (_request, response) => {
  const users = await User.find();
  response.status(200).json(users);
});

/* ------------------ LIRE UN UTILISATEUR PAR ID ------------------ */
router.get("/:id", authenticateToken, isAdminOrCurrentUser,async (request, response) => {
  const user = await User.findById(request.params.id);
  response.status(200).json(user);
});

/* ------------------ MODIFIER UN UTILISATEUR ------------------ */
router.put("/:id", authenticateToken, isAdminOrCurrentUser,async (request, response) => {
  const id = request.params.id;
  const user = await User.findById(id);
  const newEmailUser = await User.findOne({ email: request.body.email });

  if (newEmailUser !== null && request.body.email !== user.email) {
    response.status(409).json({ message: "Email déjà existant, veuillez utiliser une autre adresse !" });
    return;
  }

  bcrypt.hash(request.body.password, 10, async (error, hash) => {
    if (error) response.status(500).json(error);
    else {
      const user = await User.findByIdAndUpdate(
        id,
        { ...request.body, password: hash },
        { new: true }
      );
      if (!user) {
        response.status(404).json({ message: "Utilisateur inexistant !" });
        return;
      }
      response.status(200).json({ message: `L'utilisateur ${id} a été modifié avec succès !`, user });
    }
  });
});

/* ------------------ SUPPRIMER UN UTILISATEUR ------------------ */
router.delete("/:id", authenticateToken, isAdminOrCurrentUser, async (request, response) => {
  const id = request.params.id;
  const user = await User.findByIdAndDelete(id);
  response.status(200).json({ message: `L'utilisateur ${id} a été supprimé avec succès !`, user });
});

export default router;
