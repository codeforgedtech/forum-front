// Ändrad Navbar med dynamisk darkMode-toggle

import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Bell, Moon, Sun, Bookmark, PlusCircle } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { useTheme} from '../utils/ThemeContext';
export default function Navbar({ token, onLogout, unreadCount, currentUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const { darkMode, setDarkMode } = useTheme();




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

  const inboxUnread = unreadCount;
  const notifUnread = notifications.filter(n => !n.read).length;

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
        
      </button>
      {menuOpen && (
  <div
    className={`space-y-1 w-48 absolute right-0 mt-2 p-3 rounded shadow-md transition-all duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
    }`}
  >
    <span className="block px-4 py-2 text-sm font-semibold">
      {currentUser.username}
    </span>

    <Link
      to="/profile/"
      onClick={() => setMenuOpen(false)}
      className={`block px-4 py-2 text-sm rounded transition-colors duration-200 ${
        darkMode
          ? 'hover:bg-gray-700'
          : 'hover:bg-gray-100'
      }`}
    >
      Min profil
    </Link>

    <Link
      to="/profile/edit"
      onClick={() => setMenuOpen(false)}
      className={`block px-4 py-2 text-sm rounded transition-colors duration-200 ${
        darkMode
          ? 'hover:bg-gray-700'
          : 'hover:bg-gray-100'
      }`}
    >
      Redigera profil
    </Link>

    <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

    <button
      onClick={() => {
        setMenuOpen(false);
        handleLogout();
      }}
      className={`w-full text-left px-4 py-2 text-sm font-semibold rounded transition-colors duration-200 ${
        darkMode
          ? 'text-red-400 hover:bg-gray-700'
          : 'text-red-700 hover:bg-gray-100'
      }`}
    >
      Logga ut
    </button>
  </div>
)}

    </div>
  );

  return (
    <nav className={`px-6 py-4 flex justify-between items-center shadow-md relative transition-all duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex space-x-6 items-center">
        <Link to="/" className="text-lg font-semibold hover:underline">Forum</Link>
        {token && renderInboxLink()}
      </div>

      <div className="flex items-center space-x-4">
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
              <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded shadow-lg z-30 p-3 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
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
                      className={`py-2 px-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${n.read ? 'text-gray-500' : 'font-semibold'}`}
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

        <button
          className="focus:outline-none hover:text-yellow-400"
          data-tooltip-id="darkmode-tooltip"
          data-tooltip-content={darkMode ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
          aria-label="Växla mörkt/ljust läge"
          onClick={() => setDarkMode(prev => !prev)}
        >
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <Tooltip id="darkmode-tooltip" place="bottom" />

        {token && (
          <>
           

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
          </>
        )}

        {token && currentUser ? renderUserDropdown() : renderAuthLinks()}
      </div>
    </nav>
  );
}















