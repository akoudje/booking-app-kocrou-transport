import mongoose from "mongoose";

/**
 * =======================================================
 * 🔹 Schéma des segments (tronçons intermédiaires)
 * Ex : Abidjan → Yamoussoukro (5000 FCFA)
 * =======================================================
 */
const segmentSchema = new mongoose.Schema({
  depart: {
    type: String,
    required: [true, "La ville de départ du segment est obligatoire."],
  },
  arrivee: {
    type: String,
    required: [true, "La ville d’arrivée du segment est obligatoire."],
  },
  prix: {
    type: Number,
    required: [true, "Le prix du segment est obligatoire."],
    min: [0, "Le prix du segment ne peut pas être négatif."],
  },
});

/**
 * =======================================================
 * 🔹 Schéma principal du trajet
 * Contient une ligne principale + des segments optionnels
 * =======================================================
 */
const trajetSchema = new mongoose.Schema(
  {
    compagnie: {
      type: String,
      required: [true, "Le nom de la compagnie est obligatoire."],
      trim: true,
    },
    villeDepart: {
      type: String,
      required: [true, "La ville de départ est obligatoire."],
    },
    villeArrivee: {
      type: String,
      required: [true, "La ville d’arrivée est obligatoire."],
    },
    heureDepart: {
      type: String,
      required: [true, "L’heure de départ est obligatoire."],
    },
    heureArrivee: {
      type: String,
      default: null,
    },
    prix: {
      type: Number,
      required: [true, "Le prix du trajet est obligatoire."],
      min: [1000, "Le prix minimal est de 1000 FCFA."],
    },

    // ✅ CHAMP DYNAMIQUE : Nombre total de sièges dans le véhicule
    nombrePlaces: {
      type: Number,
      required: [true, "Le nombre de places est obligatoire."],
      min: [10, "Un véhicule doit avoir au moins 10 sièges."],
      max: [60, "Le maximum de sièges est limité à 60 pour des raisons d'affichage."],
      default: 50,
    },

    // Optionnel : type de véhicule (utile plus tard)
    typeVehicule: {
      type: String,
      enum: ["minibus", "autocar", "bus VIP", "autre"],
      default: "autocar",
    },

    // Optionnel : état / disponibilité
    actif: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * =======================================================
 * 🧮 Middleware Mongoose
 * Avant chaque sauvegarde : recalculer le prixTotal
 * =======================================================
 */
trajetSchema.pre("save", function (next) {
  // Calcul automatique du prix total
  const totalSegments = this.segments.reduce((acc, seg) => acc + (seg.prix || 0), 0);
  this.prixTotal = totalSegments > 0 ? totalSegments : this.lignePrincipale.prix || 0;
  next();
});

/**
 * =======================================================
 * 🔎 Méthode utilitaire : recherche d’un segment
 * Permet au frontend de retrouver facilement un sous-trajet
 * =======================================================
 */
trajetSchema.methods.findSegment = function (depart, arrivee) {
  return this.segments.find(
    (seg) =>
      seg.depart.toLowerCase() === depart.toLowerCase() &&
      seg.arrivee.toLowerCase() === arrivee.toLowerCase()
  );
};

export default mongoose.model("Trajet", trajetSchema);
