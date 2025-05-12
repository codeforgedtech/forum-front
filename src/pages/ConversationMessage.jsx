import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function SendMessageInConversation({ token }) {
  const [content, setContent] = useState('');
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        `http://localhost:8001/conversations/${conversationId}/messages`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        navigate(`/conversations/${conversationId}`);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Skicka meddelande i konversation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full border p-2 mt-1"
            rows="4"
            placeholder="Skriv ditt meddelande h�r..."
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Skicka Meddelande
        </button>
      </form>
    </div>
  );
}

export default SendMessageInConversation;
