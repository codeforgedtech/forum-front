import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/axiosInstance'; // Justera vägen efter din struktur
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Bell, Moon, Bookmark, PlusCircle } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

export default function Navbar({ token, onLogout, unreadCount, currentUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]); // ✅ State för notifikationer
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const inboxUnread = unreadCount;
  const notifUnread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (token) {
      api.get('/notifications')
        .then(res => setNotifications(res.data))
        .catch(err => console.error('Kunde inte hämta notifikationer:', err));
    }
  }, [token]);

  const markAllRead = () => {
    api.put('/notifications/mark-read')
      .then(() => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      })
      .catch(err => console.error('Kunde inte markera som lästa:', err));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        notifRef.current && !notifRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const renderInboxLink = () => (
    <Link to="/messages" className="relative text-sm hover:underline flex items-center">
      <Mail size={18} className="mr-1" />
      {inboxUnread > 0 && (
        <span className="ml-2 w-5 h-5 bg-blue-500 text-white text-xs flex items-center justify-center absolute -top-2 -right-6 z-10 animate-pulse rounded-md">
          {inboxUnread}
        </span>
      )}
    </Link>
  );

  const renderAuthLinks = () => (
    <>
      <Link to="/login" className="hover:underline">Logga in</Link>
      <Link to="/register" className="hover:underline">Registrera</Link>
    </>
  );

  const renderUserDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 focus:outline-none">
        {currentUser?.avatar ? (
          <img src={currentUser.avatar} alt="Profilbild" className="w-8 h-8 rounded-full border border-white" />
        ) : (
          <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold uppercase border border-white">
            {currentUser?.username?.charAt(0)}
          </div>
        )}
        <span className="text-sm text-gray-300 hover:text-white">{currentUser.username}</span>
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-20">
          <Link to="/profile/" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Min profil</Link>
          <Link to="/profile/edit" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Redigera profil</Link>
          <button
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
          >
            Logga ut
          </button>
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md relative">
      <div className="flex space-x-6 items-center">
        <Link to="/" className="text-lg font-semibold hover:underline">Forum</Link>
        {token && renderInboxLink()}
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifikationer */}
        {token && (
          <div className="relative" ref={notifRef}>
            <button
              id="notif-button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative focus:outline-none"
              data-tooltip-id="notif-tooltip"
              data-tooltip-content="Notifikationer"
              aria-label="Notifikationer"
            >
              <Bell size={22} />
              {notifUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs flex items-center justify-center rounded-full animate-pulse">
                  {notifUnread}
                </span>
              )}
            </button>
            <Tooltip id="notif-tooltip" place="bottom" />
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white text-black rounded shadow-lg z-30 p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Notifikationer</h3>
                  <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">Markera alla som lästa</button>
                </div>
                <ul>
                  {notifications.length === 0 && (
                    <li className="text-gray-600">Inga notifikationer</li>
                  )}
                  {notifications.map(n => (
                    <li
                      key={n.id}
                      className={`py-2 px-3 rounded cursor-pointer hover:bg-gray-100 ${n.read ? 'text-gray-500' : 'font-semibold'}`}
                    >
                      {n.text}
                    </li>
                  ))}
                </ul>
                <Link to="/notifications" className="block mt-2 text-center text-blue-600 hover:underline" onClick={() => setNotifOpen(false)}>
                  Visa alla notifikationer
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Dark mode (placeholder) */}
        <button
          className="focus:outline-none hover:text-yellow-400"
          data-tooltip-id="darkmode-tooltip"
          data-tooltip-content="Växla mörkt läge"
          aria-label="Växla mörkt läge"
          onClick={() => alert('Implementera mörkt läge här!')}
        >
          <Moon size={22} />
        </button>
        <Tooltip id="darkmode-tooltip" place="bottom" />

        {/* Skapa inlägg */}
        <Link
          to="/posts/create"
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          data-tooltip-id="createpost-tooltip"
          data-tooltip-content="Skapa nytt inlägg"
          aria-label="Skapa nytt inlägg"
        >
          <PlusCircle size={18} /> Skapa inlägg
        </Link>
        <Tooltip id="createpost-tooltip" place="bottom" />

        {/* Bokmärken */}
        <Link
          to="/bookmarks"
          className="flex items-center gap-1 hover:underline"
          data-tooltip-id="bookmarks-tooltip"
          data-tooltip-content="Bokmärken"
          aria-label="Bokmärken"
        >
          <Bookmark size={18} />
        </Link>
        <Tooltip id="bookmarks-tooltip" place="bottom" />

        {/* Användarmeny eller auth-länkar */}
        {token && currentUser ? renderUserDropdown() : renderAuthLinks()}
      </div>
    </nav>
  );
}













