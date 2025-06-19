import { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import React from 'react';
import { toast } from 'react-toastify';

export default function CreateThread({ token, onClose, onThreadCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('http://localhost:8001/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Kunde inte hämta kategorier:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post(
        'http://localhost:8001/threads',
        { title, content, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Tråd skapad!')
      onThreadCreated(res.data); // Uppdatera trådlistan
      onClose();
      window.location.reload() // Stäng modalen
    } catch (err) {
      toast.error('Kunde inte skapa tråd')
      console.error(err);
      setError('Kunde inte skapa tråd.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-blue-800">Skapa ny tråd</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded-lg p-3"
        />

        <label className="block">
          <span className="text-gray-700 font-medium">Välj kategori</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg p-3 mt-1"
          >
            <option value="">-- Välj befintlig kategori --</option>
            {categories.length === 0 ? (
              <option value="">Inga kategorier tillgängliga</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block mt-4">
          <span className="text-gray-700 font-medium">...eller skriv ny kategori</span>
          <input
            type="text"
            placeholder="Ny kategori (om du vill skapa en)"
            className="w-full border rounded-lg p-3 mt-1"
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>

        <textarea
          placeholder="Innehåll"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows="6"
          className="w-full border rounded-lg p-3 resize-none"
        />

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Skapa tråd
          </button>
        </div>
      </form>
    </div>
  );
}





