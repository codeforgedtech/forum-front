import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { Trash } from "lucide-react";
import { Link } from 'react-router-dom';
import CreateThreadModal from './CreateThread';

export default function ThreadList({ token, currentUserId }) {
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Hämta trådar
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const config = token ? {
          headers: { Authorization: `Bearer ${token}` },
        } : {};

        const res = await api.get('http://localhost:8001/threads', config);
        setThreads(res.data);
      } catch (err) {
        console.error('Fel vid hämtning av trådar:', err);
      }
    };

    fetchThreads();
  }, [token]);

  // Hämta kategorier
  useEffect(() => {
    api
      .get('http://localhost:8001/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Kunde inte hämta kategorier:', err));
  }, []);

  // Ta bort tråd
  const handleDeleteThread = async (threadId) => {
    if (!token) {
      console.error('Ingen token tillg�nglig vid f�rs�k att ta bort tr�d.');
      return;
    }
  
    if (!window.confirm('�r du s�ker p� att du vill ta bort denna tr�d?')) return;
  
    try {
      console.log('Skickar DELETE med token:', token);
      await api.delete(`http://localhost:8001/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Något gick fel vid borttagning.';
      alert(errorMsg); // eller visa det snyggt i UI
      console.error('Kunde inte ta bort tråden:', errorMsg);
    }
  };

  // Filtrera trådar efter kategori
  const filteredThreads = selectedCategory
    ? threads.filter((t) => t.category === selectedCategory)
    : threads;

  return (
    <div className="min-h-screen w-full bg-white p-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Forumtrådar</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + Skapa ny tråd
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border p-4 bg-white rounded">
        <div>
          <label className="block text-sm font-medium text-gray-700">Filtrera efter ämne:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mt-1"
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

      {/* Lista med trådar */}
      {filteredThreads.length === 0 ? (
        <p className="text-gray-500">Inga trådar hittades i denna kategori.</p>
      ) : (
        <ul>
          {filteredThreads.map((thread) => (
            <li key={thread.id} className="py-4">
              <Link
                to={`/threads/${thread.id}`}
                className="block p-4 rounded-lg bg-white shadow-sm border border-gray-200 transition"
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-lg font-semibold text-blue-700">{thread.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {thread.category && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {thread.category}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {thread.comment_count} svar
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{thread.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Publicerad: {new Date(thread.created_at).toLocaleDateString()} av {thread.author}
                </p>
              </Link>

              {/* Ta bort-knapp för ägaren */}
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
    <Trash className="w-5 h-5 mr-1" /> Ta bort
  </button>
)}
              
            </li>
          ))}
        </ul>
      )}

      {/* Modal för att skapa ny tråd */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
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








