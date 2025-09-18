import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../auth/api';
import { useAuth } from '../../auth/context';
import styles from './CommentPage.module.css';
import PostCard from '../postCard/PostCard';

export default function CommentPage() {
  const { id } = useParams();
  const commentId = parseInt(id, 10);
  const { token, user } = useAuth();

  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.request(`/comments/${commentId}`);
      setComment(res.comment || null);
    } catch (err) {
      console.error('load comment error', err);
      setError(err?.body?.error || err?.message || 'Could not load comment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(commentId)) load();
    else setError('Invalid comment id');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentId]);

  const submitReply = async () => {
    if (!token) return (window.location.href = '/auth/login');
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await api.request(`/comments/${commentId}/replies`, {
        method: 'POST',
        token,
        body: { content: replyText.trim() },
      });
      setReplyText('');
      await load(); // reload comment + replies
      window.dispatchEvent(
        new CustomEvent('comments:updated', { detail: { commentId } })
      );
    } catch (err) {
      console.error('submit reply error', err);
      setError(err?.body?.error || err?.message || 'Could not submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.center}>Loading…</div>;
  if (error) return <div className={styles.centerError}>{error}</div>;
  if (!comment) return <div className={styles.center}>Comment not found</div>;

  const post = comment.post;

  return (
    <main className={styles.page}>
      <section className={styles.postWrap}>
        {post ? (
          <div>
            <PostCard
              post={{
                ...post,
                author: post.author,
                _count: comment.post._count || {
                  comments: (comment.replies || []).length,
                },
                comments: [],
              }}
            />
          </div>
        ) : null}
      </section>

      <section className={styles.commentBox}>
        <article className={styles.selected}>
          <img
            src={comment.author?.profilePic || '/default-avatar.png'}
            alt={comment.author?.username || comment.author?.name || 'user'}
            className={styles.smallAvatar}
          />
          <div className={styles.main}>
            <div className={styles.meta}>
              <strong className={styles.author}>
                {comment.author?.username || comment.author?.name}
              </strong>
              <time className={styles.time}>
                {new Date(comment.createdAt).toLocaleString()}
              </time>
            </div>
            <div className={styles.content}>{comment.content}</div>
          </div>
        </article>

        <div className={styles.repliesHeading}>
          Replies ({(comment.replies || []).length})
        </div>

        <div className={styles.list}>
          {(comment.replies || []).length === 0 ? (
            <div className={styles.empty}>No replies yet</div>
          ) : (
            (comment.replies || []).map((r) => (
              <article key={r.id} className={styles.reply}>
                <img
                  src={r.author?.profilePic || '/default-avatar.png'}
                  className={styles.smallAvatar}
                  alt={r.author?.username || r.author?.name}
                />
                <div>
                  <div className={styles.meta}>
                    <strong className={styles.author}>
                      {r.author?.username || r.author?.name}
                    </strong>
                    <time className={styles.time}>
                      {new Date(r.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <div className={styles.content}>{r.content}</div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className={styles.composer}>
          <img
            src={(user && user.profilePic) || '/default-avatar.png'}
            className={styles.smallAvatar}
            alt="you"
          />
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply…"
            className={styles.textarea}
            rows={3}
          />
          <div className={styles.composerActions}>
            <button
              className={styles.submitBtn}
              onClick={submitReply}
              disabled={submitting || !replyText.trim()}
            >
              {submitting ? 'Replying…' : 'Reply'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
