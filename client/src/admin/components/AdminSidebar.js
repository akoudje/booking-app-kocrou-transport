import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bus,
  CalendarDays,
  Users,
  LogOut,
  Settings,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard />, path: "/admin" },
    { name: "Trajets", icon: <Bus />, path: "/admin/trajets" },
    { name: "Réservations", icon: <CalendarDays />, path: "/admin/reservations" },
    { name: "Utilisateurs", icon: <Users />, path: "/admin/utilisateurs" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-card-dark shadow-lg min-h-screen p-5">
      <div className="text-2xl font-bold text-primary mb-10 tracking-tight">
        Kocrou Admin
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`
            }
          >
            <span className="w-5 h-5">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 transition w-full"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
        <div className="mt-3 flex items-center gap-2 text-gray-400 text-sm">
          <Settings className="w-4 h-4" />
          Version 1.0.0
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
