import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ThreadPage from './pages/ThreadPage';
import ThreadList from './pages/ThreadList';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateThread from './pages/CreateThread';
import Messages from './pages/MessagesPage'; 
import SendPrivateMessage from './pages/PrivateMessages';
import SendMessageInConversation from './pages/ConversationMessage';

const decodeToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.id;
  } catch (error) {
    console.error("Kunde inte dekoda token:", error);
    return null;
  }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUserId, setCurrentUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      const userId = decodeToken(token);
      setCurrentUserId(userId);
    }
  }, [token]);
  const refreshUnreadCount = async () => {
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8001/private-messages/unread/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Kunde inte hämta olästa meddelanden:', err);
    }
  };
 
  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUserId(null);
    setUnreadCount(0);
  };


useEffect(() => {
  if (!token) return;

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('http://localhost:8001/private-messages/unread/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Kunde inte hämta olästa meddelanden:', err);
    }
  };

  fetchUnreadCount();
}, [token]);

  return (
    <BrowserRouter>
     <Navbar token={token} onLogout={handleLogout} unreadCount={unreadCount} />
      <div className="w-screen-lg mx-auto p-6">
        <Routes>
          <Route
            path="/"
            element={token ? <ThreadList token={token} /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/threads/:id"
            element={token ? <ThreadPage token={token} /> : <Navigate to="/login" />}
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
      refreshUnreadCount={refreshUnreadCount} // 👈 Lägg till denna
    />
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
    </BrowserRouter>
  );
}

export default App;






