// src/components/feed/postCard/PostCard.jsx
import React from 'react';
import postCardStyle from './PostCard.module.css';
import { Link } from 'react-router-dom';

/**
 * Small helper to show "x minutes/hours/days ago".
 * Keeps things lightweight - you can replace with date-fns later.
 */
function timeAgo(dateString) {
  if (!dateString) return '';
  const then = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 60 * 86400) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateString).toLocaleDateString();
}

const PostCard = ({ post }) => {
  const author = post.author || {};
  const username = author.username || author.name || `User ${author.id || ''}`;
  const avatar = author.profilePic || '/default-avatar.png';

  return (
    <article className={postCardStyle.card}>
      <header className={postCardStyle.header}>
        <img src={avatar} alt={username} className={postCardStyle.avatar} />
        <div className={postCardStyle.meta}>
          <div className={postCardStyle.nameRow}>
            <Link to={`/profile/${author.id}`} className={postCardStyle.name}>
              {username}
            </Link>
            <span className={postCardStyle.dot}>·</span>
            <time className={postCardStyle.time} dateTime={post.createdAt}>
              {timeAgo(post.createdAt)}
            </time>
          </div>
          {author.name && (
            <div className={postCardStyle.handle}>{author.name}</div>
          )}
        </div>
      </header>

      {post.title ? (
        <h3 className={postCardStyle.title}>{post.title}</h3>
      ) : null}

      <div className={postCardStyle.content}>{post.content}</div>

      <footer className={postCardStyle.footer}>
        <div className={postCardStyle.stats}>
          <button className={postCardStyle.statBtn} aria-label="Like">
            ❤️ <span>{post._count?.likes || 0}</span>
          </button>
          <Link to={`/posts/${post.id}`} className={postCardStyle.statBtn}>
            💬 <span>{post._count?.comments || 0}</span>
          </Link>
        </div>
        <div className={postCardStyle.actions}>
          <Link to={`/posts/${post.id}`} className={postCardStyle.viewBtn}>
            View
          </Link>
        </div>
      </footer>
    </article>
  );
};

export default PostCard;
