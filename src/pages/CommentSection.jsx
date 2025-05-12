import { useState, useEffect } from 'react';
import axios from 'axios';
import React from 'react';

export default function CommentSection({ threadId, token }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:8001/comments/${threadId}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error('Kunde inte h�mta kommentarer:', err));
  }, [threadId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8001/comments`,
        { threadId, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, res.data]); // l�gg till direkt
      setNewComment('');
    } catch (err) {
      console.error('Kunde inte skicka kommentar:', err);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold">Kommentarer</h3>

      {comments.length === 0 && <p className="text-gray-500">Inga kommentarer �n.</p>}

      <ul className="space-y-2">
        {comments.map((comment) => (
          <li key={comment.id} className="bg-gray-100 p-3 rounded shadow-sm">
            <p className="text-sm">{comment.content}</p>
            <span className="text-xs text-gray-500">Av: {comment.username || 'Anonym'}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded resize-none"
          rows="3"
          placeholder="Skriv en kommentar..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Skicka
        </button>
      </form>
    </div>
  );
}

