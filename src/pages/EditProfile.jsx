import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme} from '../utils/ThemeContext';
export default function EditProfile({ token, currentUserId }) {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    description: '',
  });
 const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/profile/${currentUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setProfile(res.data))
    .catch(err => {
      console.error("Kunde inte hämta profilinfo:", err);
      toast.error("Kunde inte hämta profil.");
    });
  }, [token, currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    api.put(`/profile/${currentUserId}`, profile, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      toast.success("Profil uppdaterad!");
      navigate('/profile');
    })
    .catch(err => {
      console.error("Kunde inte uppdatera profil:", err);
      toast.error("Fel vid uppdatering.");
    });
  };

  return (
    <div className={`space-y-4 max-w-sm mx-auto mt-10 p-6 rounded shadow-md transition-all duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
    }`}>
      <h2 className="text-xl font-semibold mb-4">Redigera Profil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Användarnamn</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">E-post</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Beskrivning</label>
          <textarea
            name="description"
            value={profile.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Spara
        </button>
      </form>
    </div>
  );
}
