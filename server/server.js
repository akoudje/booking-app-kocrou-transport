// server/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// 🔹 Connexion MongoDB et Monitoring
import connectDB from "./config/dbMonitor.js";

// 🔹 Import des routes
import authRoutes from "./routes/authRoute.js";
import reservationRoutes from "./routes/reservationsRoute.js";
import trajetsRoutes from "./routes/trajetsRoute.js";
import settingsRoutes from "./routes/settingsRoute.js";
import reportsRoutes from "./routes/reportsRoute.js";
import notificationsRoutes from "./routes/notificationsRoute.js";
import usersRoutes from "./routes/usersRoute.js";

// ✅ Chargement des variables d’environnement
dotenv.config();

// ⚙️ Initialisation d’Express
const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // à personnaliser pour Railway
  credentials: true,
}));
app.use(bodyParser.json());
app.use(express.json());

// 📁 Gestion des fichiers statiques (à éviter sur Railway)
app.use("/uploads", express.static("uploads"));

// 🔗 Connexion MongoDB
connectDB();

// 🔸 Route test
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l’API Kocrou Transport 🚍" });
});

// 🔹 Déclaration des routes principales
app.use("/api/auth", authRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/trajets", trajetsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/users", usersRoutes);

// 🧱 Serveur HTTP + Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});
global._io = io;

io.on("connection", (socket) => {
  console.log("🟢 Client connecté au WebSocket");
  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté");
  });
});

// 🧩 Gestion d’erreurs globales
app.use((err, req, res, next) => {
  console.error("💥 Erreur serveur :", err.stack);
  res.status(500).json({
    message: "Erreur interne du serveur.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 🚀 Démarrage du serveur HTTP
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Serveur + WebSocket en ligne sur port ${PORT}`)
);