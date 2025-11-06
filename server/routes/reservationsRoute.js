import express from "express";
import Reservation from "../models/Reservation.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------------
 * ✅ POST /api/reservations  (création par l'utilisateur)
 * - Gère 1 ou plusieurs sièges (multi-passagers)
 * ----------------------------------------------------- */
router.post("/", protect, async (req, res) => {
  try {
    const { trajet, seats, seat, date } = req.body;

    // 🔍 Normalisation : si on reçoit un seul "seat", on le convertit en tableau
    const seatsToBook = Array.isArray(seats)
      ? seats
      : seat
      ? [seat]
      : [];

    if (!trajet || seatsToBook.length === 0) {
      return res
        .status(400)
        .json({ message: "Aucun siège sélectionné pour la réservation." });
    }

    // 🔒 Vérification des sièges déjà réservés
    const existing = await Reservation.find({
      "trajet.compagnie": trajet.compagnie,
      seat: { $in: seatsToBook },
      "trajet.villeDepart": trajet.villeDepart,
      statut: "confirmée",
    });

    if (existing.length > 0) {
      return res.status(400).json({
        message: `Les sièges suivants sont déjà réservés : ${existing
          .map((r) => "#" + r.seat)
          .join(", ")}.`,
      });
    }

    // 🧾 Enregistrement de plusieurs réservations
    const newReservations = await Reservation.insertMany(
      seatsToBook.map((s) => ({
        user: req.user._id,
        trajet: {
          compagnie: trajet.compagnie,
          villeDepart: trajet.villeDepart,
          villeArrivee: trajet.villeArrivee,
          heureDepart: trajet.heureDepart,
          heureArrivee: trajet.heureArrivee || null,
          prix: trajet.prix,
        },
        seat: s,
        dateReservation: date || new Date(),
        statut: "confirmée",
      }))
    );

    // 🔔 Notification temps réel
    const io = req.app.get("io");
    newReservations.forEach((r) => io?.emit("reservation_created", r));

    res.status(201).json({
      message: "Réservations enregistrées avec succès ✅",
      reservations: newReservations,
    });
  } catch (error) {
    console.error("❌ Erreur création réservations :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

/* -------------------------------------------------------
 * GET /api/reservations  (mes réservations)
 * ----------------------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(reservations);
  } catch (error) {
    console.error("❌ Erreur récupération réservations :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
 * GET /api/reservations/admin/reservations  (admin)
 * ----------------------------------------------------- */
router.get("/admin/reservations", protect, adminOnly, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error("❌ Erreur récupération réservations (admin) :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
 * PUT /api/reservations/admin/reservations/:id/cancel  (admin)
 * ----------------------------------------------------- */
router.put("/admin/reservations/:id/cancel", protect, adminOnly, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.statut === "validée") {
      return res.status(400).json({
        message: "Une réservation validée ne peut plus être annulée.",
      });
    }

    reservation.statut = "annulée";
    await reservation.save();

    const io = req.app.get("io");
    io?.emit("reservation_updated", { _id: reservation._id, statut: "annulée" });

    res.json({ message: "Réservation annulée par l’administrateur ✅" });
  } catch (error) {
    console.error("❌ Erreur annulation réservation (admin) :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
 * PUT /api/reservations/admin/reservations/:id/validate  (admin)
 * ----------------------------------------------------- */
router.put("/admin/reservations/:id/validate", protect, adminOnly, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation)
      return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.statut !== "confirmée") {
      return res.status(400).json({
        message: "Seules les réservations confirmées peuvent être validées.",
      });
    }

    reservation.statut = "validée";
    await reservation.save();

    const io = req.app.get("io");
    io?.emit("reservation_updated", { _id: reservation._id, statut: "validée" });

    res.json({ message: "Réservation validée à l’embarquement ✅" });
  } catch (error) {
    console.error("❌ Erreur validation embarquement :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
 * DELETE /api/reservations/:id  (utilisateur)
 * ----------------------------------------------------- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reservation)
      return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.statut === "validée") {
      return res.status(400).json({
        message: "Une réservation validée ne peut plus être supprimée.",
      });
    }

    await reservation.deleteOne();

    const io = req.app.get("io");
    io?.emit("reservation_deleted", { _id: req.params.id });

    res.json({ message: "Réservation supprimée ✅" });
  } catch (error) {
    console.error("❌ Erreur suppression réservation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
 * ✅ GET /api/reservations/trajet/:id  (récupère sièges réservés)
 * ----------------------------------------------------- */
router.get("/trajet/:id", protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({
      "trajet._id": req.params.id,
      statut: "confirmée",
    });

    res.json(reservations);
  } catch (err) {
    console.error("❌ Erreur récupération sièges :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;


