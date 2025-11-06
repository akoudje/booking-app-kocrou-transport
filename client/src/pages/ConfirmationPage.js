import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bus, Download, FileDown, ArrowLeft } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ConfirmationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const reservations = state?.reservations || [];

  if (reservations.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-500 text-center">
        <p>Aucune réservation trouvée.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const handleDownloadPDF = async (ticketRef, fileName) => {
    const canvas = await html2canvas(ticketRef, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(fileName);
  };

  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8"
        >
          🎉 Réservation confirmée !
        </motion.h1>

        {reservations.map((res, i) => (
          <motion.div
            key={res._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-lg mb-6"
            id={`ticket-${i}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl text-text-light dark:text-text-dark flex items-center gap-2">
                  <Bus className="text-primary" />
                  {res.trajet.compagnie}
                </h2>
                <p className="text-gray-500">
                  {res.trajet.villeDepart} → {res.trajet.villeArrivee}
                </p>
                <p className="text-gray-500">
                  Siège : <strong>#{res.seat}</strong>
                </p>
                <p className="text-primary font-bold mt-2">
                  {res.trajet.prix.toLocaleString()} FCFA
                </p>
              </div>
              <QRCodeCanvas
                value={`TICKET-${res._id}`}
                size={120}
                className="bg-white p-2 rounded-lg shadow"
              />
            </div>

            <div className="border-t border-dashed my-4"></div>

            <div className="text-center">
              <button
                onClick={() =>
                  handleDownloadPDF(
                    document.getElementById(`ticket-${i}`),
                    `ticket-${res.trajet.villeDepart}-${res.trajet.villeArrivee}-seat${res.seat}.pdf`
                  )
                }
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
              >
                <FileDown className="w-4 h-4" /> Télécharger le billet
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ConfirmationPage;




