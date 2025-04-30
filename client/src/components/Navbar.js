// components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow mb-6">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">📡 jsyslogd</h1>
        <nav className="space-x-6">
          <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
            Dashboard
          </Link>
          <Link to="/events" className="text-gray-600 hover:text-blue-600 font-medium">
            Events Explorer
          </Link>
          {user.role === "admin" && (
            <Link to="/settings" className="text-gray-600 hover:text-blue-600 font-medium">
              Settings
            </Link>
          )}
          <button onClick={onLogout} className="text-red-600 font-medium hover:underline ml-4">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
