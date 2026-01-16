// src/components/postCard/PostPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../auth/api';
import { useAuth } from '../../auth/context';
import { makeImageUrl } from '../../auth/urls';
import PostCard from '../../components/postCard/PostCard';
import styles from './EditPost.module.css';

export default function PostPage() {
  const { id } = useParams();
  const postId = parseInt(id, 10);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [_commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState('');

  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [removeImageFlag, setRemoveImageFlag] = useState(false);

  // edit state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function onEditImageChoose(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setEditImageFile(null);
      setEditImagePreview('');
      return;
    }
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setEditImageFile(f);
    setRemoveImageFlag(false); // replacing, not removing
    const reader = new FileReader();
    reader.onload = () => setEditImagePreview(String(reader.result || ''));
    reader.readAsDataURL(f);
  }

  function clearEditImageSelection() {
    setEditImageFile(null);
    setEditImagePreview('');
    const el = document.getElementById('edit-post-image-input');
    if (el) el.value = '';
  }

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.request(`/posts/${postId}`);
      setPost(res.post || null);
    } catch (err) {
      console.error('load post error', err);
      setError(err?.body?.error || err?.message || 'Could not load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(postId)) load();
    else setError('Invalid post id');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // If URL has ?edit=1 auto open editor once post loaded
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const shouldEdit = q.get('edit') === '1';
    if (shouldEdit && post) {
      if (user && post.author && user.id === post.author.id) {
        setEditTitle(post.title || '');
        setEditContent(post.content || '');
        setEditMode(true);
      } else {
        // not author — strip edit query
        navigate(`/posts/${postId}`, { replace: true });
      }
    }
  }, [location.search, post, user, navigate, postId]);

  const isAuthor = Boolean(user && post && user.id === post.author?.id);

  // open editor manually (if on same page)
  const startEdit = () => {
    if (!isAuthor) return;
    setEditTitle(post?.title || '');
    setEditContent(post?.content || '');
    setEditImageFile(null);
    setEditImagePreview(post?.image ? makeImageUrl(post.image) : '');
    setRemoveImageFlag(false);
    setEditMode(true);
    navigate(`/posts/${postId}`, { replace: true });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditTitle('');
    setEditContent('');
  };

  const saveEdit = async () => {
    if (!isAuthor) return;
    if (editContent === undefined || !editContent.trim()) {
      setError('Content cannot be empty');
      return;
    }

    setSaving(true);
    setError('');
    try {
      let res;
      if (editImageFile) {
        const form = new FormData();
        form.append('content', editContent.trim());
        form.append('title', editTitle || '');
        form.append('image', editImageFile);
        res = await api.request(`/posts/${postId}`, {
          method: 'PUT',
          body: form,
          token,
        });
      } else if (removeImageFlag) {
        res = await api.request(`/posts/${postId}`, {
          method: 'PUT',
          token,
          body: {
            content: editContent.trim(),
            title: editTitle || null,
            removeImage: true,
          },
        });
      } else {
        // Normal json update (no image changes)
        res = await api.request(`/posts/${postId}`, {
          method: 'PUT',
          token,
          body: { content: editContent.trim(), title: editTitle || null },
        });
      }

      const updated = res.post || res;
      setPost(updated);
      setEditMode(false);
      setEditTitle('');
      setEditContent('');
      setEditImageFile(null);
      setEditImagePreview('');
      setRemoveImageFlag(false);

      navigate(`/posts/${postId}`, { replace: true });

      window.dispatchEvent(
        new CustomEvent('posts:updated', {
          detail: { action: 'updated', postId },
        })
      );
    } catch (err) {
      console.error('save edit error', err);
      setError(err?.body?.error || err?.message || 'Could not update post');
    } finally {
      setSaving(false);
    }
  };

  const confirmAndDelete = async () => {
    if (!isAuthor) return;
    const ok = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );
    if (!ok) return;

    setDeleting(true);
    setError('');
    try {
      await api.request(`/posts/${postId}`, { method: 'DELETE', token });
      window.dispatchEvent(
        new CustomEvent('posts:updated', {
          detail: { action: 'deleted', postId },
        })
      );
      navigate('/feed');
    } catch (err) {
      console.error('delete post error', err);
      setError(err?.body?.error || err?.message || 'Could not delete post');
      setDeleting(false);
    }
  };

  const submitComment = async () => {
    if (!token) return (window.location.href = '/auth/login');
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await api.request(`/posts/${postId}/comments`, {
        method: 'POST',
        token,
        body: { content: commentText.trim() },
      });
      setCommentText('');
      setCommentsLoading(true);
      await load();
      window.dispatchEvent(
        new CustomEvent('comments:updated', { detail: { postId } })
      );
    } catch (err) {
      console.error('submit comment error', err);
      setError(err?.body?.error || err?.message || 'Could not submit comment');
    } finally {
      setSubmitting(false);
      setCommentsLoading(false);
    }
  };

  if (loading) return <div className={styles.center}>Loading post…</div>;
  if (error) return <div className={styles.centerError}>{error}</div>;
  if (!post) return <div className={styles.center}>Post not found</div>;

  return (
    <main className={styles.page}>
      <section className={styles.postWrap}>
        {/* action bar for author */}
        <div className={styles.postHeaderRow}>
          <div className={styles.postHeaderLeft} />
          <div className={styles.postHeaderRight}>
            {isAuthor && !editMode && (
              <>
                <button
                  className={styles.editBtn}
                  onClick={startEdit}
                  title="Edit post"
                >
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={confirmAndDelete}
                  disabled={deleting}
                  title="Delete post"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>

        {editMode ? (
          <div className={styles.editor}>
            <input
              className={styles.titleInput}
              value={editTitle || ''}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Optional title"
            />

            <textarea
              className={styles.contentInput}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
            />

            <label className={styles.field}>
              <span className={styles.labelText}>Post image</span>
              <div className={styles.fileInput}>
                <input
                  id="edit-post-image-input"
                  type="file"
                  accept="image/*"
                  onChange={onEditImageChoose}
                />
              </div>

              {editImagePreview ? (
                <div className={styles.previewWrap}>
                  <div className={styles.preview}>
                    <img src={editImagePreview} alt="image preview" />
                  </div>
                  <div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => {
                        // if there is an existing image on the post and user hasn't selected a new image,
                        // toggling remove flag will clear it on next save
                        if (editImageFile) clearEditImageSelection();
                        setRemoveImageFlag((s) => !s);
                        if (!editImageFile && !removeImageFlag && post?.image) {
                          // show removal intent to user
                          setEditImagePreview(makeImageUrl(post.image));
                        } else if (!editImageFile) {
                          setEditImagePreview('');
                        }
                      }}
                    >
                      {removeImageFlag ? 'Undo remove' : 'Remove image'}
                    </button>
                    {editImageFile && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={clearEditImageSelection}
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                post?.image &&
                !removeImageFlag && (
                  <div className={styles.previewWrap}>
                    <div className={styles.preview}>
                      <img
                        src={makeImageUrl(post.image)}
                        alt="current post image"
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => setRemoveImageFlag(true)}
                    >
                      Remove image
                    </button>
                  </div>
                )
              )}
            </label>

            <div className={styles.editorActions}>
              <button
                className={styles.saveBtn}
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <PostCard post={post} showAuthorActions={false} />
        )}
      </section>

      <section className={styles.comments}>
        <h3 className={styles.heading}>
          Comments ({post._count?.comments || 0})
        </h3>

        {/* Composer */}
        <div className={styles.composer}>
          <img
            src={(user && user.profilePic) || '/default-avatar.png'}
            alt={(user && (user.username || user.name)) || 'You'}
            className={styles.smallAvatar}
          />
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment…"
            className={styles.textarea}
            rows={3}
          />
          <div className={styles.composerActions}>
            <button
              className={styles.submitBtn}
              onClick={submitComment}
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className={styles.list}>
          {(post.comments || []).length === 0 ? (
            <div className={styles.empty}>No comments yet. Be the first!</div>
          ) : (
            post.comments.map((c) => (
              <article key={c.id} className={styles.comment}>
                <img
                  src={c.author?.profilePic || '/default-avatar.png'}
                  alt={c.author?.username || c.author?.name || 'user'}
                  className={styles.smallAvatar}
                />
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.author}>
                      {c.author?.username ||
                        c.author?.name ||
                        `User ${c.author?.id}`}
                    </span>
                    <time className={styles.time}>
                      {new Date(c.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <div className={styles.content}>{c.content}</div>

                  <div className={styles.commentActions}>
                    <a href={`/comments/${c.id}`} className={styles.replyLink}>
                      View & reply
                    </a>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
