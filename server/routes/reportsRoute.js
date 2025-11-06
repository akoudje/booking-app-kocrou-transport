import express from "express";
import Reservation from "../models/Reservation.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const reservations = await Reservation.find(query)
      .populate("user")
      .populate("trajet");

    const totalReservations = reservations.length;
    const totalRevenue = reservations.reduce((sum, r) => sum + (r.prixSegment || 0), 0);
    const uniqueUsers = new Set(reservations.map((r) => r.user?._id?.toString())).size;

    // Regrouper les revenus par jour
    const dailyRevenue = Object.values(
      reservations.reduce((acc, r) => {
        const dateKey = new Date(r.createdAt).toLocaleDateString("fr-FR");
        if (!acc[dateKey]) acc[dateKey] = { _id: dateKey, total: 0 };
        acc[dateKey].total += r.prixSegment || 0;
        return acc;
      }, {})
    );

    res.json({
      summary: { totalReservations, totalRevenue, uniqueUsers, dailyRevenue },
      data: reservations,
    });
  } catch (err) {
    console.error("Erreur génération rapport :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
