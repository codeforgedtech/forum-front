import React, { useState } from 'react';
import api from '../utils/axiosInstance';

function QuickPrivateMessage({ token, recipientId, recipientName, onClose }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      setError('�mne och meddelande kr�vs.');
      return;
    }

    try {
        await api.post(
            'http://localhost:8001/private-messages',
            {
              receiverId: recipientId, //
              subject: subject.trim(),
              body: message.trim(),
            },
          
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Fel vid skickande av meddelande:', err);
      setError('Kunde inte skicka meddelandet.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Skicka meddelande {recipientName && `till ${recipientName}`}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium">Ämne</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full border p-2 mt-1 text-black"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">Meddelande</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows="4"
            className="w-full border p-2 mt-1 text-black"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">Meddelandet skickades!</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Skicka
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuickPrivateMessage;




