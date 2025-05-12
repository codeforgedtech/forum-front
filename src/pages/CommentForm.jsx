// components/CommentForm.jsx
import { useState } from 'react';
import axios from 'axios';

export default function CommentForm({ threadId, token, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(
        `http://localhost:8000/threads/${threadId}/comments`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent('');
      if (onCommentAdded) onCommentAdded(); // Refresh comment list
    } catch (err) {
      setError('Misslyckades att lägga till kommentar.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Skriv en kommentar..."
        className="w-full p-2 border rounded"
        rows={3}
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Skicka
      </button>
    </form>
  );
}
