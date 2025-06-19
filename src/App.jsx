import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Importera Toastify
import SessionModal from './components/SessionModal';

import Navbar from './components/Navbar';
import ThreadPage from './pages/ThreadPage';
import ThreadList from './pages/ThreadList';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateThread from './pages/CreateThread';
import Messages from './pages/MessagesPage'; 
import SendPrivateMessage from './pages/PrivateMessages';
import SendMessageInConversation from './pages/ConversationMessage';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import api from './utils/axiosInstance'; // Importera din axios-instans
import { useTheme} from './utils/ThemeContext';
const decodeToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return {
      id: decoded.id,
      username: decoded.username, // Se till att backend skickar med detta!
    };
  } catch (error) {
    console.error("Kunde inte dekoda token:", error);
    return null;
  }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { darkMode } = useTheme();

  // När token ändras, sätt user och hämta unread count
  useEffect(() => {
    if (token) {
      const user = decodeToken(token);
      setCurrentUser(user);
      setCurrentUserId(user.id);

      // Hämta antal olästa meddelanden
      api.get('private-messages/unread/count', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          setUnreadCount(res.data.unreadCount);
        })
        .catch((err) => {
          console.error('Kunde inte hämta antal olästa meddelanden:', err);
          setUnreadCount(0);
        });
    } else {
      setCurrentUser(null);
      setCurrentUserId(null);
      setUnreadCount(0);
    }
  }, [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    toast.success('Välkommen tillbaka!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUserId(null);
    setUnreadCount(0);
    toast.info('Du har loggat ut.');
  };

  return (
    <BrowserRouter>
   
      <Navbar
        token={token}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        currentUser={currentUser}
      />
  
  <div
  className={`min-h-screen w-screen-lg mx-auto p-6 ${
    darkMode
      ? 'bg-gray-950 text-gray-100'  // Mörkare bakgrund och ljusare text
      : 'bg-gray-50 text-gray-900'   // Ljusare bakgrund och mörkare text
  }`}
>
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                <ThreadList token={token} currentUserId={currentUserId} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/threads/:id"
            element={
              token ? (
                <ThreadPage token={token} currentUserId={currentUserId} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/create"
            element={token ? <CreateThread token={token} /> : <Navigate to="/login" />}
          />
          <Route
            path="/messages"
            element={
              <Messages
                token={token}
                currentUserId={currentUserId}
                setUnreadCount={setUnreadCount}
              />
            }
          />
          <Route
  path="/profile/edit"
  element={token ? <EditProfile token={token} currentUserId={currentUserId} /> : <Navigate to="/login" />}
/>
<Route
  path="/profile"
  element={
    token ? (
      <ProfilePage token={token} currentUserId={currentUserId} />
    ) : (
      <Navigate to="/login" />
    )
  }
/>
          <Route
            path="/send-private-message"
            element={token ? <SendPrivateMessage token={token} /> : <Navigate to="/login" />}
          />
          <Route
            path="/conversations/:conversationId/messages"
            element={token ? <SendMessageInConversation token={token} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <SessionModal token={token} onLogout={handleLogout} />

      <ToastContainer /> {/* Placera ToastContainer här för att visa alla toasts */}
    </BrowserRouter>
  );
}

export default App;








