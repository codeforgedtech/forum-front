import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash, Send } from "lucide-react";
import api from '../utils/axiosInstance';
import { useTheme} from '../utils/ThemeContext'; // ⬅️ Importera darkMode

export default function ThreadPage({ token, currentUserId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // ⬅️ Använd darkMode

  const [thread, setThread] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchThreadAndCount = async () => {
      try {
        const threadRes = await api.get(`http://localhost:8001/threads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const commentsRes = await api.get(`http://localhost:8001/threads/${id}/comments`);
        const commentCount = commentsRes.data.length;

        setThread({ ...threadRes.data, comment_count: commentCount });
      } catch (err) {
        setError('Kunde inte hämta tråd');
        console.error(err);
      }
    };

    fetchThreadAndCount();
  }, [id, token]);

  const handleDeleteThread = async () => {
    if (!window.confirm("Vill du verkligen ta bort tråden?")) return;

    try {
      const res = await api.get(`http://localhost:8001/threads/${id}/comments`);
      const threadComments = res.data;

      if (threadComments.length > 0) {
        alert("Du kan inte ta bort en tråd som har kommentarer.");
        return;
      }

      await api.delete(`http://localhost:8001/threads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/");
    } catch (err) {
      console.error("Kunde inte ta bort tråden:", err);
      setError("Fel vid borttagning av tråd");
    }
  };

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!thread) return <p className="text-center">Laddar tråd...</p>;

  return (
    <div className={`min-h-screen w-full p-6 overflow-auto transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-blue-500">{thread.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Skapad av <span className="font-medium">{thread.author}</span>
          </p>
        </div>

        {String(thread.threadUserId) === String(currentUserId) && thread.comment_count === 0 && (
          <button
            onClick={handleDeleteThread}
            className="text-red-500 mt-2 flex items-center hover:underline"
          >
            <Trash className="w-4 h-4 mr-1" />
           
          </button>
        )}
      </div>

      <div className="text-sm text-gray-400 flex justify-between mt-2">
        <span>Datum {new Date(thread.created_at).toLocaleDateString()}</span>
        {thread.category && (
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
            {thread.category}
          </span>
        )}
      </div>

      <p className={`leading-relaxed whitespace-pre-line mt-4 ${
        darkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {thread.content}
      </p>

      <CommentSection
        threadId={id}
        token={token}
        currentUserId={currentUserId}
        darkMode={darkMode}
      />
    </div>
  );
}

function CommentSection({ threadId, token, currentUserId, darkMode }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`http://localhost:8001/threads/${threadId}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => setError('Kunde inte hämta kommentarer'));
  }, [threadId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(
        `http://localhost:8001/threads/${threadId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
      window.location.reload();
    } catch {
      setError('Kunde inte skicka kommentar');
    }
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      const res = await api.post(
        `http://localhost:8001/comments/${commentId}/replies`,
        { content: newReply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) =>
        prev.map((comment) =>
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
      window.location.reload();
    } catch {
      setError('Kunde inte skicka svar');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || (comment.replies && comment.replies.length > 0)) {
      alert("Du måste ta bort alla svar innan du kan ta bort kommentaren.");
      return;
    }
    if (!window.confirm("Vill du verkligen ta bort kommentaren?")) return;

    try {
      await api.delete(`http://localhost:8001/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError("Fel vid borttagning av kommentar");
    }
  };

  const handleDeleteReply = async (replyId, parentId) => {
    if (!window.confirm('Vill du verkligen ta bort svaret?')) return;

    try {
      await api.delete(`http://localhost:8001/comments/${replyId}`, {
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
    } catch {
      setError('Fel vid borttagning av svar');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">
        Kommentarer ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h2>

      {comments.length === 0 && (
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          Inga kommentarer ännu.
        </p>
      )}

      <ul className="space-y-4 mb-6">
        {comments.map((comment) => (
          <li key={comment.id} className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100'
          }`}>
            <div className="text-sm text-gray-400 mb-1">
              {comment.username} &mdash; {new Date(comment.created_at).toLocaleString()}
            </div>
            <p>{comment.content}</p>

            {String(comment.user_id) === String(currentUserId) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 text-sm mt-1 flex items-center hover:underline"
              >
                <Trash className="w-4 h-4 mr-1" />
               
              </button>
            )}

            {/* Svar */}
            {comment.replies?.length > 0 && (
              <div className="mt-4 ml-6 space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'
                  }`}>
                    <div className="text-sm text-gray-400 mb-1">
                      {reply.username} &mdash; {new Date(reply.created_at).toLocaleString()}
                    </div>
                    <p>{reply.content}</p>

                    {String(reply.user_id) === String(currentUserId) && (
                      <button
                        onClick={() => handleDeleteReply(reply.id, comment.id)}
                        className="text-red-500 text-sm mt-1 flex items-center hover:underline"
                      >
                        <Trash className="w-4 h-4 mr-1" />
                       
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-blue-500 hover:underline mt-2 text-sm"
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
                  className="w-full p-3 border border-gray-300 rounded-lg"
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

      {/* Ny kommentar */}
      {token ? (
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Skriv en kommentar..."
            className="w-full p-3 border border-gray-300 rounded-lg"
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
        <p className="text-sm text-gray-400 mt-2">
          Du måste vara inloggad för att kommentera.
        </p>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}




  

  