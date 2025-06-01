import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

function SendPrivateMessage({ token }) {
  const [content, setContent] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);  // F�r att h�lla anv�ndarlistan
  const navigate = useNavigate();

  useEffect(() => {
    // H�mta alla anv�ndare som kan vara mottagare
    api
      .get('http://localhost:8001/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsers(response.data);  // S�tt anv�ndarlistan
      })
      .catch((error) => {
        console.error('Fel vid h�mtning av anv�ndare:', error);
      });
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Skicka POST-beg�ran till backend f�r att skapa ett privat meddelande
    api
      .post(
        'http://localhost:8001/private-messages',
        { receiverId: recipientId, body: content }, // Anv�nd 'body' ist�llet f�r 'content'
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        // Navigera tillbaka till meddelandesidan
        navigate('/messages');
      })
      .catch(() => {
        setError('Kunde inte skicka meddelandet');
      });
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Skicka privat meddelande</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipientId" className="block text-sm font-medium">Mottagare</label>
          <select
            id="recipientId"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            required
            className="w-full border p-2 mt-1"
          >
            <option value="">Välj mottagare</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium">Meddelande</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full border p-2 mt-1"
            rows="4"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Skicka Meddelande
        </button>
      </form>
    </div>
  );
}

export default SendPrivateMessage;



