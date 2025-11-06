import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

/**
 * 🔒 Middleware principal : vérifie le token JWT
 */
export const protect = async (req, res, next) => {
  let token;

  try {
    // Vérifie la présence d’un header d’autorisation
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Vérifie et décode le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Recherche de l’utilisateur correspondant
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Utilisateur introuvable ou supprimé" });
      }

      next();
    } else {
      return res
        .status(401)
        .json({ message: "Accès refusé : aucun token fourni" });
    }
  } catch (error) {
    console.error("❌ Erreur middleware protect:", error.message);
    return res
      .status(401)
      .json({ message: "Token invalide ou expiré", error: error.message });
  }
};

/**
 * 🔑 Middleware optionnel : vérifie si l’utilisateur est admin
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Accès refusé (administrateur uniquement)" });
  }
};

