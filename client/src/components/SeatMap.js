// src/components/SeatMap.jsx
import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const SeatMap = ({ selectedSeat, setSelectedSeat, reservedSeats = [] }) => {
  const rows = 6;
  const seatsPerRow = 4;
  const totalSeats = rows * seatsPerRow;
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  const getSeatStatus = (seatNumber) => {
    if (reservedSeats.includes(seatNumber)) return "reserved";
    if (selectedSeat === seatNumber) return "selected";
    return "available";
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative bg-subtle-light dark:bg-subtle-dark rounded-2xl p-6 shadow-inner">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-5 gap-3"
        >
          {seats.map((seat, i) => {
            const status = getSeatStatus(seat);
            const isAisle = (i + 1) % 5 === 3; // colonne du couloir (position 3 dans 1..5)

            if (isAisle) {
              // clé unique pour la colonne du couloir (jamais en conflit avec seat-N)
              return <div key={`aisle-${i}`} className="w-5" aria-hidden="true" />;
            }

            return (
              <motion.button
                key={`seat-${seat}`} // clé unique & explicite
                onClick={() => {
                  if (status !== "reserved") setSelectedSeat(seat);
                }}
                whileTap={{ scale: 0.95 }}
                className={`h-12 w-12 flex items-center justify-center rounded-lg border transition
                  ${
                    status === "available"
                      ? "bg-white dark:bg-card-dark border-gray-300 dark:border-gray-600 hover:bg-primary/10"
                      : status === "reserved"
                      ? "bg-gray-400 dark:bg-gray-700 text-gray-200 cursor-not-allowed"
                      : "bg-primary text-white border-primary"
                  }`}
                title={status === "reserved" ? `Siège ${seat} (occupé)` : `Siège ${seat}`}
                aria-pressed={selectedSeat === seat}
                aria-label={`Siège ${seat} ${status}`}
              >
                <User
                  className={`w-4 h-4 ${
                    status === "reserved" ? "opacity-50" : status === "selected" ? "text-white" : "text-primary"
                  }`}
                />
                <span className="ml-1 text-sm">{seat}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Légende */}
      <div className="flex justify-center gap-4 mt-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-white border border-gray-300 dark:bg-card-dark dark:border-gray-600" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-primary" />
          <span>Sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-gray-400 dark:bg-gray-700" />
          <span>Réservé</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;

