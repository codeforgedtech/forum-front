
import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage({ token, currentUserId }) {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

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
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
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


