import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../mongo.js";

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";


// 📌 Route inscription //
// -------------------- //
router.post("/inscription", async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword, role });

    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'inscription", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.status(200).json({ message: "Connexion réussie", token });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

export default router;
