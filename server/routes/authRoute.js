import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

/* =======================================================
 * 🔹 REGISTER - Création d’un nouvel utilisateur
 * ======================================================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, isAdmin = false } = req.body;

    // Vérification des champs requis
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email existe déjà." });
    }

    // ✅ Hash du mot de passe avec un salt dynamique
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword || hashedPassword.length < 10) {
      console.error("⚠️ Erreur de hash bcrypt :", hashedPassword);
      return res
        .status(500)
        .json({ message: "Erreur lors du hashage du mot de passe." });
    }

    // Bloquer la création d’un admin public
    const safeIsAdmin =
      process.env.ALLOW_ADMIN_SIGNUP === "true" ? isAdmin : false;

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: safeIsAdmin,
    });

    await newUser.save();

    // ✅ Génération du token JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès ✅",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("❌ Erreur d'inscription :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

/* =======================================================
 * 🔹 LOGIN - Connexion d’un utilisateur existant
 * ======================================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email et mot de passe requis." });
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Utilisateur introuvable." });
    }

    // ✅ Vérification du mot de passe hashé
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    // ✅ Génération du token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Connexion réussie ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("❌ Erreur de connexion :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

/* =======================================================
 * 🔹 GET /me - Récupère l’utilisateur connecté
 * ======================================================= */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("❌ Erreur /me :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

/* =======================================================
 * 🔹 CREATE ADMIN - réservé aux admins existants
 * ======================================================= */
router.post("/create-admin", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nom, email et mot de passe requis." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Cet email existe déjà." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Administrateur créé avec succès 👑",
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("❌ Erreur création admin :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

export default router;
