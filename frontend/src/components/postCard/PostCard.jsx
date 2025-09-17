// src/components/feed/postCard/PostCard.jsx
import React, { useEffect, useState } from 'react';
import postCardStyle from './PostCard.module.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import api from '../../auth/api';

function timeAgo(dateString) {
  if (!dateString) return '';
  const then = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);

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

  const { token, user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [processingLike, setProcessingLike] = useState(false);
  const isAuthor = user && author && user.id === author.id;

  useEffect(() => {
    let mounted = true;
    async function check() {
      if (!token) {
        setLiked(false);
        return;
      }
      try {
        const res = await api.request(`/posts/${post.id}/liked`, { token });
        if (!mounted) return;
        setLiked(Boolean(res.liked));
      } catch (err) {
        setLiked(false);
        console.error('check liked error', err);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [post.id, token]);

  const handleLikeToggle = async () => {
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }
    if (processingLike) return;
    setProcessingLike(true);

    try {
      if (!liked) {
        const res = await api.request(`/posts/${post.id}/like`, {
          method: 'POST',
          token,
        });
        const serverLikes = res?.counts?._count?.likes;
        if (typeof serverLikes === 'number') {
          setLikesCount(serverLikes);
        } else {
          setLikesCount((c) => c + 1);
        }
        setLiked(true);
      } else {
        const res = await api.request(`/posts/${post.id}/like`, {
          method: 'DELETE',
          token,
        });
        if (
          res?.counts &&
          res.counts._count &&
          typeof res.counts._count.likes === 'number'
        ) {
          setLikesCount(res.counts._count.likes);
        } else {
          setLikesCount((c) => Math.max(0, c - 1));
        }
        setLiked(false);
      }
    } catch (err) {
      console.error('like toggle error', err);
    } finally {
      setProcessingLike(false);
    }
  };

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
          <button
            className={postCardStyle.statBtn}
            aria-label={liked ? 'Unlike' : 'Like'}
            onClick={handleLikeToggle}
            disabled={processingLike || isAuthor}
            title={
              isAuthor
                ? "You can't like your own post"
                : liked
                ? 'Unlike'
                : 'Like'
            }
          >
            {liked ? '❤️' : '🤍'} <span>{likesCount}</span>
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
