// components/CommentList.jsx
import { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';

export default function CommentList({ threadId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    api
      .get(`http://localhost:8001/threads/${threadId}/comments`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error('Fel vid hämtning av kommentarer:', err));
  }, [threadId]);

  return (
    <div className="mt-4">
      <h3 className="font-bold text-lg">Kommentarer</h3>
      {comments.length === 0 ? (
        <p>Inga kommentarer än.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="border-t py-2">
            <p>{comment.content}</p>
            <small className="text-gray-500">av {comment.username}</small>
          </div>
        ))
      )}
    </div>
  );
}
