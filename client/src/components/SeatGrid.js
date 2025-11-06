// client/src/components/SeatGrid.js
import React from "react";
import { motion } from "framer-motion";
import { Armchair, Gauge } from "lucide-react";

/**
 * SeatGrid (5 colonnes : 2 à gauche + allée + 3 à droite)
 */
const SeatGrid = ({
  totalSeats = 75,
  reservedSeats = [],
  selectedSeats = [],
  toggleSeat = () => {},
  showLegend = true,
}) => {
  const cappedTotal = Math.min(Math.max(totalSeats, 1), 60);

  // 🪑 5 colonnes logiques : 2 à gauche + 3 à droite
  const seatsPerRow = 5;
  const totalRows = Math.ceil(cappedTotal / seatsPerRow);

  const seatNumberAt = (rowIndex, posInRow) =>
    rowIndex * seatsPerRow + posInRow + 1;

  const SeatButton = ({ seatNumber }) => {
    if (seatNumber > cappedTotal) return <div className="w-10 md:w-12" />;

    const isReserved = reservedSeats.includes(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);

    return (
      <motion.button
        whileHover={!isReserved ? { scale: 1.04 } : undefined}
        whileTap={!isReserved ? { scale: 0.92 } : undefined}
        disabled={isReserved}
        onClick={() => !isReserved && toggleSeat(seatNumber)}
        className={`relative flex items-center justify-center
          w-10 h-10 md:w-12 md:h-12 rounded-xl border font-semibold
          transition-all outline-none
          ${
            isReserved
              ? "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed shadow-sm"
              : isSelected
              ? "bg-primary text-white border-primary shadow-lg"
              : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-primary/10"
          }`}
        style={{
          boxShadow: isSelected
            ? "0 6px 14px rgba(59,130,246,0.35)"
            : "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Armchair
          className={`w-5 h-5 md:w-6 md:h-6 ${
            isReserved
              ? "text-gray-600/60"
              : isSelected
              ? "text-white"
              : "text-gray-700 dark:text-gray-200"
          }`}
        />
        <span
          className="absolute -bottom-1 -right-1
                     text-[15px] md:text-[14px] font-semibold
                     text-gray-700 dark:text-gray-100
                     bg-white dark:bg-gray-700
                     px-1 rounded shadow-sm border border-gray-200 dark:border-gray-600"
        >
          {seatNumber}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="inline-block bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden w-full">
      {/* 🚍 Conducteur */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-b-lg shadow-lg text-xs sm:text-sm flex items-center gap-2">
        <Gauge className="w-4 h-4" />
        <span>Conducteur</span>
      </div>

      {/* 🪑 Titre */}
      <div className="text-center text-gray-700 dark:text-gray-300 text-sm mb-3 mt-6">
        <p className="font-semibold">Disposition des sièges</p>
        <p className="text-xs text-gray-500">Sélectionnez vos places</p>
      </div>

      {/* 🧱 Grille (2 sièges / allée / 3 sièges) */}
      <div
        className="grid grid-cols-[auto,auto,2.5rem,auto,auto,auto]
                   sm:grid-cols-[auto,auto,3rem,auto,auto,auto]
                   gap-3 sm:gap-4 justify-items-center relative mx-auto"
        style={{ maxWidth: 550 }}
      >
        {/* Allée centrale */}
        <div
          className="absolute left-[44%] sm:left-[45%] transform -translate-x-1/2
                     w-10 sm:w-12 h-full
                     bg-gradient-to-b from-gray-200/60 to-gray-300/30
                     rounded-md shadow-inner pointer-events-none"
        />

        {Array.from({ length: totalRows }).map((_, rowIdx) => {
          const s1 = seatNumberAt(rowIdx, 0);
          const s2 = seatNumberAt(rowIdx, 1);
          const s3 = seatNumberAt(rowIdx, 2);
          const s4 = seatNumberAt(rowIdx, 3);
          const s5 = seatNumberAt(rowIdx, 4);

          return (
            <React.Fragment key={`row-${rowIdx}`}>
              {/* 2 sièges à gauche */}
              <SeatButton seatNumber={s1} />
              <SeatButton seatNumber={s2} />
              {/* allée (col 3) */}
              <div className="w-10 sm:w-12" />
              {/* 3 sièges à droite */}
              <SeatButton seatNumber={s3} />
              <SeatButton seatNumber={s4} />
              <SeatButton seatNumber={s5} />
            </React.Fragment>
          );
        })}
      </div>

      {/* 🔍 Légende */}
      {showLegend && (
        <div className="flex justify-center flex-wrap gap-6 mt-6 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300 bg-primary inline-block" />
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-400 bg-gray-300 inline-block" />
            <span>Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 inline-block" />
            <span>Disponible</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatGrid;
