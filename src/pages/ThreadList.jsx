import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash, Mail, Send, ArrowLeft, Reply } from "lucide-react";
import { Link } from 'react-router-dom';
import CreateThreadModal from './CreateThread'; // byt till din faktiska sökväg

export default function ThreadList({ token, currentUserId }) {
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:8001/threads', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log(res.data); // Logga svaret fr�n API
        setThreads(res.data);
      })
      .catch((err) => console.error('Fel vid h�mtning av tr�dar:', err));
  }, [token]);
  

  useEffect(() => {
    axios
      .get('http://localhost:8001/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Kunde inte hämta kategorier:', err));
  }, []);

  const handleDeleteThread = (threadId) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna tråd?')) return;

    axios
      .delete(`http://localhost:8001/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
      })
      .catch((err) => {
        console.error('Kunde inte ta bort tråden:', err);
      });
  };

  const filteredThreads = selectedCategory
    ? threads.filter((t) => t.category === selectedCategory)
    : threads;

  return (
    <div className="min-h-screen w-full bg-white p-6 overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Forumtrådar</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + Skapa ny tråd
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-1 p-4 bg-white rounded-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">Filtrera efter ämne:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mt-1"
          >
            <option value="">Alla ämnen</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
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
        <p className="text-gray-500">Inga trådar hittades i denna kategori.</p>
      ) : (
        <ul className="">
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

      {thread.user_id === currentUserId && (
        <button
          onClick={() => handleDeleteThread(thread.id)}
          className="mt-2 text-red-600 text-sm hover:underline focus:outline-none flex items-center"
        >
          <Trash className="w-6 h-6 text-red-600 bg-red-200 p-1 rounded-b-u-lg" />
          
        </button>
      )}
    </li>
  ))}
</ul>

      )}

      {/* Modal */}
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







