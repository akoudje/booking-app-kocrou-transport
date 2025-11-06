import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import Trajet from "../models/Trajets.js";

const router = express.Router();

/**
 * =======================================================
 * 🔹 GET /api/trajets
 * @desc  Récupère tous les trajets ou filtre par tronçon (ville départ / arrivée)
 * @access Public
 * =======================================================
 */
router.get("/", async (req, res) => {
  try {
    const { depart, arrivee } = req.query;
    let query = {};

    // 🔍 Filtrage dynamique selon la requête
    if (depart && arrivee) {
      query = {
        $or: [
          {
            "lignePrincipale.depart": new RegExp(`^${depart}$`, "i"),
            "lignePrincipale.arrivee": new RegExp(`^${arrivee}$`, "i"),
          },
          {
            "segments.depart": new RegExp(`^${depart}$`, "i"),
            "segments.arrivee": new RegExp(`^${arrivee}$`, "i"),
          },
        ],
      };
    }

    const trajets = await Trajet.find(query).sort({
      "lignePrincipale.depart": 1,
    });

    res.status(200).json(trajets);
  } catch (error) {
    console.error("❌ Erreur récupération trajets :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * =======================================================
 * 🔹 GET /api/trajets/:id
 * @desc  Récupère un trajet spécifique par son ID
 * @access Public
 * =======================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id);
    if (!trajet) {
      return res.status(404).json({ message: "Trajet introuvable" });
    }

    res.status(200).json(trajet);
  } catch (error) {
    console.error("❌ Erreur récupération trajet :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * =======================================================
 * 🔹 POST /api/trajets
 * @desc  Ajoute un nouveau trajet (avec ou sans segments)
 * @access Privé (admin uniquement)
 * =======================================================
 */
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      lignePrincipale,
      segments = [], // 🔹 Optionnel
      dateDepart,
      heureDepart,
      heureArrivee = null, // 🔹 Optionnel
      totalPlaces,
    } = req.body;

    // ✅ Validation minimale
    if (!lignePrincipale || !lignePrincipale.depart || !lignePrincipale.arrivee) {
      return res
        .status(400)
        .json({ message: "Veuillez renseigner les villes de départ et d’arrivée principales." });
    }

    // 🔹 Calcul du prix total (segments ou ligne principale)
    const prixTotal =
      segments.length > 0
        ? segments.reduce((acc, seg) => acc + (seg.prix || 0), 0)
        : lignePrincipale.prix || 0;

    // 🧱 Création du trajet
    const trajet = new Trajet({
      compagnie: "Kocrou Transport",
      lignePrincipale,
      segments,
      prixTotal,
      dateDepart,
      heureDepart,
      heureArrivee, // peut être null
      totalPlaces,
    });

    await trajet.save();
    res.status(201).json({ message: "Trajet créé avec succès ✅", trajet });
  } catch (error) {
    console.error("❌ Erreur création trajet :", error);
    res.status(500).json({ message: "Erreur lors de la création du trajet !" });
  }
});

/**
 * =======================================================
 * 🔹 PUT /api/trajets/:id
 * @desc  Met à jour un trajet existant
 * @access Privé (admin uniquement)
 * =======================================================
 */
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const trajet = await Trajet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!trajet) {
      return res.status(404).json({ message: "Trajet introuvable" });
    }

    res.json({ message: "Trajet mis à jour ✅", trajet });
  } catch (error) {
    console.error("❌ Erreur mise à jour trajet :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * =======================================================
 * 🔹 DELETE /api/trajets/:id
 * @desc  Supprime un trajet
 * @access Privé (admin uniquement)
 * =======================================================
 */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id);
    if (!trajet) {
      return res.status(404).json({ message: "Trajet introuvable" });
    }

    await trajet.deleteOne();
    res.json({ message: "Trajet supprimé avec succès ✅" });
  } catch (error) {
    console.error("❌ Erreur suppression trajet :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
