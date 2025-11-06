import React, { useState, useEffect } from "react";
import { Sun, Moon, UserCircle2 } from "lucide-react";

const AdminHeader = ({ title }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-card-dark shadow-sm sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Changer le thème"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-700" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-400" />
          )}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <UserCircle2 className="w-6 h-6 text-primary" />
          <div>
            <p className="font-semibold">{user.name || "Admin"}</p>
            <p className="text-xs opacity-70">{user.email || "admin@kocrou.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
