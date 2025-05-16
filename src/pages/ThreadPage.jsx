import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash, Send } from "lucide-react";

export default function ThreadPage({ token, currentUserId }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [thread, setThread] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    axios
      .get(`http://localhost:8001/threads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setThread(res.data))
      .catch((err) => {
        setError('Kunde inte h�mta tr�d');
        console.error('Fel vid h�mtning:', err);
      });
  }, [id, token]);

  const handleDeleteThread = async () => {
    if (!window.confirm('Vill du verkligen ta bort tr�den?')) return;
    try {
      await axios.delete(`http://localhost:8001/threads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (err) {
      console.error('Kunde inte ta bort tr�den:', err);
      setError('Fel vid borttagning av tr�d');
    }
  };

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!thread) return <p className="text-center">Laddar tr�d...</p>;

  return (
    <div className="min-h-screen w-full bg-white p-6 overflow-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">{thread.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Skapad av <span className="font-medium text-gray-700">{thread.author}</span>
          </p>
        </div>

        {(String(thread.user_id) === String(currentUserId)) && (
          <button
            onClick={handleDeleteThread}
            className="text-red-600 mt-4 flex items-center hover:underline"
          >
            <Trash className="w-4 h-4 mr-1" />
            Ta bort tr�d
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500 flex justify-between">
        <span>Datum {new Date(thread.created_at).toLocaleDateString()}</span>
        {thread.category && (
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
            {thread.category}
          </span>
        )}
      </div>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line mt-4">
        {thread.content}
      </p>

      <CommentSection threadId={id} token={token} currentUserId={currentUserId} />
    </div>
  );
}

function CommentSection({ threadId, token, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:8001/threads/${threadId}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => setError('Kunde inte h�mta kommentarer'));
  }, [threadId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) {
      setError('Du m�ste vara inloggad f�r att kommentera.');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8001/threads/${threadId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Kommentar skapades inte:', err);
      setError('Kunde inte skicka kommentar');
    }
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8001/comments/${commentId}/replies`,
        { content: newReply },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), res.data],
              }
            : comment
        )
      );
      setNewReply('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Svar kunde inte skickas:', err);
      setError('Kunde inte skicka svar');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Vill du verkligen ta bort kommentaren?')) return;

    try {
      await axios.delete(`http://localhost:8001/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Kunde inte ta bort kommentaren:', err);
      setError('Fel vid borttagning av kommentar');
    }
  };

  const handleDeleteReply = async (replyId, parentId) => {
    if (!window.confirm('Vill du verkligen ta bort svaret?')) return;

    try {
      await axios.delete(`http://localhost:8001/comments/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies?.filter((r) => r.id !== replyId),
              }
            : c
        )
      );
    } catch (err) {
      console.error('Kunde inte ta bort svaret:', err);
      setError('Fel vid borttagning av svar');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">
        Kommentarer ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h2>

      {comments.length === 0 && <p className="text-gray-500">Inga kommentarer �nnu.</p>}

      <ul className="space-y-4 mb-6">
        {comments.map((comment) => (
          <li key={comment.id} className="bg-gray-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">
              {comment.username} &mdash; {new Date(comment.created_at).toLocaleString()}
            </div>
            <p className="text-gray-800">{comment.content}</p>

            {String(comment.user_id) === String(currentUserId) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 text-sm mt-1 flex items-center hover:underline"
              >
                <Trash className="w-4 h-4 mr-1" />
                Ta bort kommentar
              </button>
            )}

            {comment.replies?.length > 0 && (
              <div className="mt-4 ml-6 space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-200 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">
                      {reply.username} &mdash; {new Date(reply.created_at).toLocaleString()}
                    </div>
                    <p className="text-gray-800">{reply.content}</p>

                    {String(reply.user_id) === String(currentUserId) && (
                      <button
                        onClick={() => handleDeleteReply(reply.id, comment.id)}
                        className="text-red-500 text-sm mt-1 flex items-center hover:underline"
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Ta bort svar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-blue-600 hover:underline mt-2 text-sm"
              disabled={replyingTo === comment.id}
            >
              Svara
            </button>

            {replyingTo === comment.id && (
              <form
                onSubmit={(e) => handleReplySubmit(e, comment.id)}
                className="mt-2 space-y-3"
              >
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Skriv ett svar..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                  <Send className="w-4 h-4 mr-1" />
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <Send className="w-4 h-4 mr-1" />
            Skicka kommentar
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">Du m�ste vara inloggad f�r att kommentera.</p>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}



  

  