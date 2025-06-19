import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { Trash, Mail } from "lucide-react";
import { Link } from 'react-router-dom';
import QuickPrivateMessage from './QuickPrivateMessage';
import CreateThreadModal from './CreateThread';
import { useTheme } from '../utils/ThemeContext';

export default function ThreadList({ token, currentUserId }) {
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { darkMode } = useTheme();
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);

  const closeMessageModal = () => setSelectedRecipientId(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const config = token ? {
          headers: { Authorization: `Bearer ${token}` },
        } : {};
        const res = await api.get('http://localhost:8001/threads', config);
        setThreads(res.data);
      } catch (err) {
        console.error('Fel vid h�mtning av tr�dar:', err);
      }
    };
    fetchThreads();
  }, [token]);

  useEffect(() => {
    api
      .get('http://localhost:8001/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Kunde inte h�mta kategorier:', err));
  }, []);

  const handleDeleteThread = async (threadId) => {
    if (!token) return console.error('Ingen token tillg�nglig vid f�rs�k att ta bort tr�d.');
    if (!window.confirm('�r du s�ker p� att du vill ta bort denna tr�d?')) return;

    try {
      await api.delete(`http://localhost:8001/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'N�got gick fel vid borttagning.';
      alert(errorMsg);
      console.error('Kunde inte ta bort tr�den:', errorMsg);
    }
  };

  const filteredThreads = selectedCategory
    ? threads.filter((t) => t.category === selectedCategory)
    : threads;

  return (
    <div className={`min-h-screen w-full p-6 overflow-auto transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Forumtrådar
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + Skapa ny tråd
        </button>
      </div>

      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border p-4 rounded transition ${
        darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
      }`}>
        <div>
          <label className="block text-sm font-medium">Filtrera efter ämne:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mt-1 text-black"
          >
            <option value="">Alla ämnen</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory('')}
            className="text-sm text-blue-600 underline mt-1"
          >
            Rensa filter
          </button>
        )}
      </div>

      {filteredThreads.length === 0 ? (
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Inga trådar hittades i denna kategori.
        </p>
      ) : (
        <ul>
          {filteredThreads.map((thread) => (
            <li key={thread.id} className="py-4">
              <div
                className={`block p-4 rounded-lg shadow-sm border transition ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-black'
                }`}
              >
                <Link to={`/threads/${thread.id}`}>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-lg font-semibold text-blue-500">{thread.title}</h3>
                    <div className="flex gap-2 flex-wrap">
                      {thread.category && (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {thread.category}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {thread.comment_count} svar
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm mt-2 line-clamp-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{thread.content}</p>
                </Link>

                <div className={`flex items-center gap-2 text-xs mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>
                    Publicerad: {new Date(thread.created_at).toLocaleDateString()} av {thread.author}
                  </span>

                  {thread.user_id !== currentUserId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecipientId(thread.user_id);
                      }}
                      className="text-blue-500 hover:underline flex items-center mt-2"
                      title={`Skicka meddelande till ${thread.author}`}
                    >
                      <Mail className="w-5 h-5 mr-1" />
                     
                    </button>
                  )}
                </div>

                {thread.user_id === currentUserId && (
                  <button
                    onClick={() => handleDeleteThread(thread.id)}
                    disabled={thread.comment_count > 0}
                    className={`mt-2 text-sm flex items-center ${
                      thread.comment_count > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:underline'
                    }`}
                    title={thread.comment_count > 0 ? "Kan inte ta bort tr�d med kommentarer" : ""}
                  >
                    <Trash className="w-5 h-5 mr-1" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedRecipientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-xl ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
          }`}>
            <QuickPrivateMessage
              token={token}
              recipientId={selectedRecipientId}
              onClose={closeMessageModal}
            />
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-xl ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
          }`}>
            <CreateThreadModal
              token={token}
              onClose={() => setShowModal(false)}
              onThreadCreated={(newThread) => setThreads((prev) => [newThread, ...prev])}
            />
          </div>
        </div>
      )}
    </div>
  );
}










