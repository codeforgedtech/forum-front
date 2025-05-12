import { Link, useNavigate } from 'react-router-dom';
import React from 'react';

export default function Navbar({ token, onLogout, unreadCount }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();        // Kör utloggning
    navigate('/login'); // Skicka användaren till inloggning
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex space-x-6 items-center">
        <Link to="/" className="text-lg font-semibold hover:underline">
          Forum
        </Link>

        {token && (
          <Link to="/messages" className="relative text-sm hover:underline flex items-center">
            Inbox
            {unreadCount > 0 && (
              <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-ping-slow absolute -top-2 -right-3 z-10">
                {unreadCount}
              </span>
            )}
          </Link>
        )}
      </div>

      <div className="space-x-4">
        {!token ? (
          <>
            <Link to="/login" className="hover:underline">
              Logga in
            </Link>
            <Link to="/register" className="hover:underline">
              Registrera
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
          >
            Logga ut
          </button>
        )}
      </div>
    </nav>
  );
}






