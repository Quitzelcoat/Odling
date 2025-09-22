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
  const [imageFile, setImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const MAX_CHARS = 1000;

  function onChooseFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setImageFile(null);
      setPreviewSrc('');
      return;
    }
    // basic client-side type check
    if (!f.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setError('');
    setImageFile(f);

    // preview
    const reader = new FileReader();
    reader.onload = () => setPreviewSrc(String(reader.result || ''));
    reader.readAsDataURL(f);
  }

  function removeImage() {
    setImageFile(null);
    setPreviewSrc('');
    // also clear file input by resetting value - simplest: find input by id and clear
    const el = document.getElementById('create-post-image-input');
    if (el) el.value = '';
  }

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
      // Use FormData when there is an image, otherwise either JSON or FormData both work.
      const form = new FormData();
      if (title.trim()) form.append('title', title.trim());
      form.append('content', content.trim());
      if (imageFile) form.append('image', imageFile);

      // api.request should accept FormData (see patch below). Do not set Content-Type here.
      await api.request('/posts', { method: 'POST', body: form, token });

      setSuccessMsg('Post published!');
      setTitle('');
      setContent('');
      removeImage();

      // small delay so user sees success
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
          <div className={postStyle.headerRow}>
            <div>
              <h1 className={postStyle.title}>Create a Post — The Odin Book</h1>
              <p className={postStyle.subtitle}>
                Share your thoughts. Keep it kind, simple and aesthetic.
              </p>
            </div>

            <div className={postStyle.headerActions}>
              <button
                type="button"
                className={postStyle.backBtn}
                onClick={() => navigate('/feed')}
                aria-label="Return to feed"
              >
                ← Return
              </button>
            </div>
          </div>
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

          <label className={postStyle.field}>
            <span className={postStyle.labelText}>Attach image (optional)</span>
            <div className={postStyle.fileInput}>
              <input
                id="create-post-image-input"
                type="file"
                accept="image/*"
                onChange={onChooseFile}
              />
            </div>

            {previewSrc && (
              <div className={postStyle.previewWrap}>
                <div className={postStyle.preview}>
                  <img src={previewSrc} alt="preview" />
                </div>
                <button
                  type="button"
                  className={postStyle.removeBtn}
                  onClick={removeImage}
                >
                  Remove
                </button>
              </div>
            )}
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
                removeImage();
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
