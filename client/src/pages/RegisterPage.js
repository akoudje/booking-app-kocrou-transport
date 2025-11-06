import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Loader2 } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🧩 Gestion des champs du formulaire
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 🚀 Envoi du formulaire d’inscription
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // ⚙️ Appel vers le backend (grâce au proxy dans package.json)
      const res = await axios.post("/api/auth/register", form);

      if (res.status === 201) {
        setMessage("✅ Compte créé avec succès !");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage("❌ Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      setMessage(
        error.response?.data?.message || "Erreur lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        {/* Titre */}
        <div className="flex items-center justify-center gap-2 mb-6 text-primary">
          <UserPlus className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Créer un compte</h2>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Nom complet</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 rounded-lg border bg-subtle-light dark:bg-subtle-dark text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Ex: Junior Akoudjé"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Adresse email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 rounded-lg border bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
              placeholder="exemple@mail.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full mt-1 p-3 rounded-lg border bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary outline-none"
              placeholder="••••••••"
            />
          </div>

          {/* Bouton d’envoi */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 py-3 rounded-lg font-semibold text-white transition 
              ${loading ? "bg-gray-400" : "bg-primary hover:bg-primary/90"}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Création du compte...
              </>
            ) : (
              "Créer mon compte"
            )}
          </button>

          {/* Message de feedback */}
          {message && (
            <p
              className={`text-center text-sm mt-3 ${
                message.startsWith("✅")
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        {/* Lien vers login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà inscrit ?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-primary cursor-pointer hover:underline"
          >
            Se connecter
          </span>
        </p>
      </motion.div>
    </section>
  );
};

export default RegisterPage;


