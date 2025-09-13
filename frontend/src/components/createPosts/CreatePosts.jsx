// src/components/createPosts/CreatePosts.jsx
import { useState } from 'react';
import postStyle from './CreatePosts.module.css';
import api from '../../auth/api';

import { useAuth } from '../../auth/context';
import { useNavigate } from 'react-router-dom';

export default function CreatePosts() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const MAX_CHARS = 1000;

  async function handlePublish(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!content.trim() || content.trim().length < 3) {
      setError('Write something meaningful (at least 3 characters).');
      return;
    }

    if (content.length > MAX_CHARS) {
      setError(`Content must be ≤ ${MAX_CHARS} characters.`);
      return;
    }

    setLoading(true);

    try {
      const body = {
        title: title.trim() || null,
        content: content.trim(),
      };

      await api.request('/posts', { method: 'POST', body, token });

      setSuccessMsg('Post published!');
      setTitle('');
      setContent('');

      setTimeout(() => navigate('/feed'), 600);
    } catch (err) {
      console.error('Publish error', err);
      setError(err?.body?.error || err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={postStyle.pageWrap}>
      <div className={postStyle.canvas}>
        <header className={postStyle.header}>
          <h1 className={postStyle.title}>Create a Post — The Odin Book</h1>
          <p className={postStyle.subtitle}>
            Share your thoughts. Keep it kind, simple and aesthetic.
          </p>
        </header>

        <form className={postStyle.form} onSubmit={handlePublish}>
          <label className={postStyle.field}>
            <span className={postStyle.labelText}>Title (optional)</span>
            <input
              className={postStyle.input}
              placeholder="A short, sweet headline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </label>

          <label className={postStyle.field}>
            <span className={postStyle.labelText}>Write something</span>
            <textarea
              className={postStyle.textarea}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARS}
              rows={8}
            />
            <div className={postStyle.row}>
              <span className={postStyle.charCount}>
                {content.length}/{MAX_CHARS}
              </span>
            </div>
          </label>

          <div className={postStyle.actions}>
            <button
              type="submit"
              className={postStyle.primaryBtn}
              disabled={loading}
            >
              {loading ? 'Publishing…' : 'Publish'}
            </button>
            <button
              type="button"
              className={postStyle.ghostBtn}
              onClick={() => {
                setTitle('');
                setContent('');
                setError('');
                setSuccessMsg('');
              }}
            >
              Clear
            </button>
          </div>

          {error && <div className={postStyle.error}>{error}</div>}
          {successMsg && <div className={postStyle.success}>{successMsg}</div>}
        </form>
      </div>
    </div>
  );
}
