
import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useTheme} from '../utils/ThemeContext';
export default function ProfilePage({ token, currentUserId }) {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
const { darkMode } = useTheme();
  useEffect(() => {
    api
      .get(`/profile/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserData(res.data))
      .catch((err) => console.error('Kunde inte hämta profilinfo:', err));
  }, [token, currentUserId]);

  if (!userData) return <p>Laddar profil...</p>;

  return (
    <div className={`space-y-4 max-w-sm mx-auto mt-10 p-6 rounded shadow-md transition-all duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
    }`}>
      <h2 className="text-xl font-semibold mb-4">Min Profil</h2>

      {userData.profilePicture ? (
        <img
          src={userData.profilePicture}
          alt="Profilbild"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
      ) : (
        <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center text-gray-500">
          Ingen bild
        </div>
      )}

      <p><strong>Användarnamn:</strong> {userData.username}</p>
      <p><strong>E-post:</strong> {userData.email || 'Ej angiven'}</p>
      <p><strong>Beskrivning:</strong> {userData.description || 'Ingen beskrivning ännu.'}</p>

      <button
        onClick={() => navigate('/profile/edit')}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Redigera profil
      </button>
    </div>
  );
}


