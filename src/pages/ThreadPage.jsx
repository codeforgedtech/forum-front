import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import { useParams } from 'react-router-dom';

export default function ThreadPage() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  

  useEffect(() => {
    // Kontrollera om token finns i localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`http://localhost:8001/threads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setThread(res.data))
      .catch((err) => {
        setError('Kunde inte hämta tråd');
        console.error('Fel vid hämtning:', err);
      });
  }, [id, token]);

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!thread) return <p className="text-center">Laddar tråd...</p>;

  return (
    <div className="min-h-screen w-full bg-white p-6 overflow-auto">
      <h1 className="text-2xl font-bold text-blue-800">{thread.title}</h1>
      <div className="text-sm text-gray-500 flex justify-between">
        <span>Datum {new Date(thread.created_at).toLocaleDateString()}</span>
        {thread.category && (
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
            {thread.category}
          </span>
        )}
      </div>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{thread.content}</p>

      <CommentSection threadId={id} token={token} />
    </div>
  );
}

function CommentSection({ threadId, token }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    
    const [newReply, setNewReply] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
  
    useEffect(() => {
      axios
        .get(`http://localhost:8001/threads/${threadId}/comments`)
        .then((res) => setComments(res.data))
        .catch(() => setError('Kunde inte hämta kommentarer'));
    }, [threadId]);
  
    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;
  
      if (!token) {
        setError('Du måste vara inloggad för att kommentera.');
        return;
      }
  
      try {
        const res = await axios.post(
          `http://localhost:8001/threads/${threadId}/comments`,
          { content: newComment },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
      } catch (err) {
        console.error('Kommentar skapades inte:', err.response || err.message);
        setError('Kunde inte skicka kommentar');
      }
    };
  
    const handleReplySubmit = async (e, commentId) => {
      e.preventDefault();
      if (!newReply.trim()) return;
  
      try {
        const res = await axios.post(
          `http://localhost:8001/comments/${commentId}/replies`,
          { 
            content: newReply,
            parent_id: commentId // Lägg till parent_id som referens till kommentaren
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        // Uppdatera den specifika kommentaren med svaret
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, replies: [...(comment.replies || []), res.data] }
              : comment
          )
        );
        setNewReply('');
        setReplyingTo(null); // Avsluta redigering av svar
      } catch (err) {
        console.error('Svar på kommentar skapades inte:', err.response || err.message);
        setError('Kunde inte skicka svar på kommentar');
      }
    };
  
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
  Kommentarer ({comments.reduce((acc, comment) => acc + 1 + (comment.replies?.length || 0), 0)})
</h2>
  
        {comments.length === 0 && <p className="text-gray-500">Inga kommentarer ännu.</p>}
  
        <ul className="space-y-4 mb-6">
          {comments.map((comment) => (
            <li key={comment.id} className="bg-gray-100 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">
                {comment.username} &mdash; {new Date(comment.created_at).toLocaleString()}
              </div>
              <p className="text-gray-800">{comment.content}</p>
  
              {/* Kommentarens svar */}
              {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                <div className="mt-4 ml-6 space-y-2">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="bg-gray-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        {reply.username} &mdash; {new Date(reply.created_at).toLocaleString()}
                      </div>
                      <p className="text-gray-800">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
  
              {/* Skriv ett svar på kommentar */}
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-blue-600 hover:underline mt-2"
                disabled={replyingTo === comment.id}
              >
                {comment.replies && comment.replies.length > 0 ? 'Redan svarat' : 'Svara'}
              </button>
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-2 space-y-3">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Skriv ett svar..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Skicka svar
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
  
        {token ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Skriv en kommentar..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Skicka kommentar
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">Du måste vara inloggad för att kommentera.</p>
        )}
  
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }
  
  

  