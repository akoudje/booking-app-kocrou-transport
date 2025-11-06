import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔹 INSCRIPTION
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifie si l’utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Cet e-mail est déjà utilisé." });

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel utilisateur
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Inscription réussie ✅",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Erreur d’inscription :", err);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

// 🔹 CONNEXION
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifie que l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable." });

    // Vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Mot de passe incorrect." });

    // Génère un token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // expiration du token dans 7 jours
    );

    res.status(200).json({
      message: "Connexion réussie ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Erreur de connexion :", err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};