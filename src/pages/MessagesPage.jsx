import React, { useEffect, useState, useCallback } from "react";
import api from '../utils/axiosInstance';
import { Trash, Mail, Send, ArrowLeft, Reply } from "lucide-react";
import { toast } from "react-toastify";
import { useTheme} from '../utils/ThemeContext';
function Messages({ token, currentUserId, setUnreadCount }) {
  const [privateMessages, setPrivateMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replies, setReplies] = useState({});
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [expandedSentId, setExpandedSentId] = useState(null);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const { darkMode } = useTheme();
  const [newMessage, setNewMessage] = useState({
    receiverId: "",
    subject: "",
    body: "",
  });
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    if (!currentUserId) return;
    const numericUserId = Number(currentUserId);
    api
      .get("http://localhost:8001/private-messages", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const allMessages = response.data;
        setPrivateMessages(
          allMessages.filter((msg) => msg.receiver_id === numericUserId)
        );
        setSentMessages(
          allMessages.filter((msg) => msg.sender_id === numericUserId)
        );
        setUnreadCount(
          allMessages.filter(
            (msg) => !msg.is_read && msg.receiver_id === numericUserId
          ).length
        );
      })
      .catch((error) => {
        console.error("Fel vid h�mtning av privata meddelanden:", error);
      });
  }, [token, currentUserId, setUnreadCount]);

  useEffect(() => {
    api
      .get(`http://localhost:8001/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const filtered = res.data.filter((user) => user.id !== currentUserId);
        setUserList(filtered);
      })
      .catch((err) => {
        console.error("Kunde inte h�mta anv�ndare:", err);
      });
  }, [token, currentUserId]);

  const handleReplyChange = (content) => {
    if (selectedMessage) {
      setReplies({ ...replies, [selectedMessage.id]: content });
    }
  };

  const handleReplySend = () => {
    const body = replies[selectedMessage.id];
    if (!body) return;
    api
      .post(
        "http://localhost:8001/private-messages",
        {
          receiverId: selectedMessage.sender_id,
          subject: `Re: ${selectedMessage.subject}`,
          body,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        toast.success("Svar skickat!");
        setReplies({ ...replies, [selectedMessage.id]: "" });
        setShowReplyBox(false);
      })
      .catch((err) => {
        toast.error("Svar kunde inte skickas");
        console.error("Kunde inte skicka svar:", err);
      });
  };

  const handleDelete = (id) => {
    api
      .delete(`http://localhost:8001/private-messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setPrivateMessages(privateMessages.filter((msg) => msg.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      })
      .catch((err) => {
        console.error("Kunde inte ta bort meddelande:", err);
      });
  };

  const handleDeleteSent = (id) => {
    api
      .delete(`http://localhost:8001/private-messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setSentMessages(sentMessages.filter((msg) => msg.id !== id));
      })
      .catch((err) => {
        console.error("Kunde inte ta bort skickat meddelande:", err);
      });
  };

  const handleNewMessageSend = () => {
    if (!newMessage.receiverId || !newMessage.body || !newMessage.subject)
      return;
    api
      .post("http://localhost:8001/private-messages", newMessage, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Meddelande skickat!");
        setNewMessage({ receiverId: "", subject: "", body: "" });
        setShowNewMessageForm(false);
      })
      .catch((err) => {
        console.error("Kunde inte skicka meddelande:", err);
      });
  };

const handleMarkAsRead = async (messageId) => {
  if (!token) {
    console.error("Token saknas");
    return;
  }

  try {
    await api.post(
      `http://localhost:8001/private-messages/${messageId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setPrivateMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    );

    if (refreshUnreadCount) {
      await refreshUnreadCount();
    }
  } catch (err) {
    console.error("Kunde inte markera meddelande som l�st:", err);
  }
};

  const refreshUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("http://localhost:8001/private-messages/unread/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Kunde inte hämta olästa meddelanden:", err);
    }
  }, [setUnreadCount, token]);

  useEffect(() => {
    if (token) {
      refreshUnreadCount();
    }
  }, [refreshUnreadCount, token]);
  useEffect(() => {
    if (!token) return;

    api
      .get("http://localhost:8001/private-messages/unread/count", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUnreadCount(res.data.unreadCount);
      })
      .catch((err) => {
        console.error("Kunde inte hämta olästa meddelanden:", err);
      });
  }, [token, setUnreadCount]);
  
  return (
    <div className={`w-full h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex h-screen justify-start">
        <div className={`w-[400px] min-w-[260px] max-w-sm border-r overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`p-4 border-b sticky top-0 z-10 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <button
              onClick={() => {
                setShowNewMessageForm(true);
                setSelectedMessage(null);
                setShowReplyBox(false);
              }}
              className={`w-full py-2 rounded ${
                darkMode
                  ? 'bg-blue-700 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              + Skriv nytt meddelande
            </button>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Inkorg ({privateMessages.length})
            </h3>

            {privateMessages.map((message) => {
              const isSelected = selectedMessage?.id === message.id;
              const isUnread = !message.is_read;

              return (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    setShowReplyBox(false);
                    if (isUnread) {
                      handleMarkAsRead(message.id);
                    }
                  }}
                  className={`p-3 rounded-md cursor-pointer transition ${
                    isSelected
                      ? darkMode 
                        ? 'bg-gray-700'
                        : 'bg-blue-100'
                      : isUnread
                      ? darkMode 
                        ? 'bg-black-200 text-white mb-2 border rounded shadow-sm'
                        : 'bg-black-700 mb-2 border rounded shadow-sm'
                      : darkMode 
                      ? 'bg-gray-700 text-white mb-2 border rounded shadow-sm'
                      : 'mb-2 border rounded bg-white shadow-sm'
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${
                      isUnread
                        ? 'text-black font-bold'
                        : darkMode 
                        ? 'text-gray-200'
                        : 'text-gray-800'
                    }`}
                  >
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block mr-2"></span>
                    )}
                    Från: {message.sender_username}
                  </div>
                  <div
                    className={`text-sm ${
                      isUnread
                        ? 'font-semibold'
                        : darkMode
                        ? 'text-gray-300'
                        : 'text-gray-800'
                    }`}
                  >
                    Ämne: {message.subject}
                  </div>
                  <div className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 ${darkMode  ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(message.sent_at).toLocaleDateString('sv-SE')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex-1 p-2 overflow-y-auto">
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Utkorg ({sentMessages.length})
            </h3>
            {sentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 border rounded shadow-sm ${
                  darkMode 
                  ? 'bg-gray-700 text-white mb-2 border rounded shadow-sm'
                  : 'mb-2 border rounded bg-white shadow-sm'
              } `}
              >
                <div
                  className="p-3 cursor-pointe flex justify-between items-center"
                  onClick={() =>
                    setExpandedSentId(expandedSentId === msg.id ? null : msg.id)
                  }
                >
                  <div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Till: {msg.receiver_username}
                    </div>
                    <div className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ämne: {msg.subject}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(msg.sent_at).toLocaleDateString('sv-SE')}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSent(msg.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Ta bort"
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    
                  </button>
                </div>
                {expandedSentId === msg.id && (
                  <div className={`p-3 border-t text-sm whitespace-pre-wrap ${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-200'}`}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`flex-1 p-8 w-[1000px] border-t border-b border-r border-l ${darkMode ? 'bg-gray-700 border-black-700' : 'bg-blue-100 border-black-300'}`}>
          {selectedMessage ? (
            <>
              <div className={`w-full p-4 border rounded-lg shadow-sm mb-4 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className={`text-m font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {selectedMessage.subject}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Från:</span>{' '}
                      {selectedMessage.sender_username}
                      <br />
                      <span className="font-medium">Till:</span>{' '}
                      {selectedMessage.receiver_username}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowReplyBox(true)}
                      className={`text-sm font-semibold hover:text-blue-800 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    >
                      <Reply className="w-4 h-4 mr-1 inline" />
                      
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className={`text-sm font-semibold hover:text-red-800 ${
                        darkMode ? 'text-red-400' : 'text-red-600'
                      }`}
                    >
                      <Trash className="w-4 h-4 mr-1 inline" />
                    
                    </button>
                  </div>
                </div>
              </div>

              <div className={`w-full p-4 border rounded-lg shadow-sm mb-4 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                {selectedMessage.content}
              </div>

              {showReplyBox && (
                <div className="mt-6">
                  <h5 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Skriv ditt svar
                  </h5>
                  <textarea
                    className={`w-full p-4 border rounded-lg shadow-sm mb-4 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={5}
                    placeholder="Skriv ditt svar..."
                    value={replies[selectedMessage.id] || ''}
                    onChange={(e) => handleReplyChange(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <button
                      className={`px-6 py-2 rounded-lg hover:bg-blue-700 ${
                        darkMode
                          ? 'bg-blue-700 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                      onClick={handleReplySend}
                    >
                      Skicka
                    </button>
                    <button
                      onClick={() => setShowReplyBox(false)}
                      className={`text-sm hover:underline ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className={`text-center mt-20 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Välj ett meddelande för att visa det
            </p>
          )}
        </div>
      </div>

      {showNewMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-lg ${
            darkMode? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Skicka nytt meddelande
            </h3>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                darkMode? 'text-gray-300' : 'text-gray-700'
              }`}>
                Välj mottagare:
              </label>
              <select
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                }`}
                value={newMessage.receiverId}
                onChange={(e) =>
                  setNewMessage({ ...newMessage, receiverId: e.target.value })
                }
              >
                <option value="">-- Välj användare --</option>
                {userList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                darkMode? 'text-gray-300' : 'text-gray-700'
              }`}>
                Ämne:
              </label>
              <input
                type="text"
                className={`w-full p-2 border rounded-md focus:ring-2 ${
                  darkMode
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                }`}
                value={newMessage.subject}
                onChange={(e) =>
                  setNewMessage({ ...newMessage, subject: e.target.value })
                }
                placeholder="Skriv ämnet här"
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                darkMode? 'text-gray-300' : 'text-gray-700'
              }`}>
                Meddelande:
              </label>
              <textarea
                className={`w-full p-2 border rounded-md focus:ring-2 ${
                  darkMode
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                }`}
                rows={4}
                placeholder="Skriv meddelandet..."
                value={newMessage.body}
                onChange={(e) =>
                  setNewMessage({ ...newMessage, body: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleNewMessageSend}
                className={`py-2 px-4 rounded-md hover:bg-blue-700 ${
                  darkMode ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                Skicka
              </button>
              <button
                onClick={() => setShowNewMessageForm(false)}
                className={`text-gray-500 hover:text-gray-700 ${
                  darkMode? 'text-gray-400 hover:text-gray-200' : ''
                }`}
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
