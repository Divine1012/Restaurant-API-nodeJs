import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// 🔑 Clé secrète pour signer les tokens
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// ===================== //
// 1️⃣ Vérifie le token //
// ===================== //
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: "Token manquant !" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide ou expiré !" });
    req.user = user; // contient les infos du token (id, email, role)
    next();
  });
}

// ===================== //
// 2️⃣ Vérifie les rôles //
// ===================== //
export function isAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé : admin requis" });
  }
}

export function isAdminOrEmployee(req, res, next) {
  if (req.user?.role === "admin" || req.user?.role === "employee") {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé : admin ou employé requis" });
  }
}

// ===================== //
// 3️⃣ Vérifie utilisateur //
// ===================== //
export function isAdminOrCurrentUser(req, res, next) {
  if (req.user?.role === "admin" || req.user?.id === req.params.id) {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé : utilisateur non autorisé" });
  }
}

export function getCurrentUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Aucun utilisateur connecté !" });
  }
  next();

  
}

export function isSelfOrAdmin(req, res, next) {
  if (req.user?.role === "admin" || req.user?.id === req.params.id) {
    return next();
  }
  return res.status(403).json({ message: "Accès refusé : non autorisé" });
}