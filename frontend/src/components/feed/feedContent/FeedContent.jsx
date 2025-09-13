// src/components/feed/FeedContent.jsx
import React, { useEffect, useState } from 'react';
import feedContentStyle from './FeedContent.module.css';
import api from '../../../auth/api';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../../postCard/PostCard';

const FeedContent = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const loadPosts = async () => {
      setError('');
      try {
        const data = await api.request('/posts');
        if (!mounted) return;
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      } catch (err) {
        console.error('Load posts error', err);
        setError(err?.body?.error || err?.message || 'Could not load posts');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPosts();
    // refresh every 30s (optional), you can remove
    const interval = setInterval(loadPosts, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className={feedContentStyle.column}>
      <div className={feedContentStyle.header}>
        <div>
          <h2 className={feedContentStyle.hTitle}>Home</h2>
          <p className={feedContentStyle.hSub}>
            Latest posts from everyone you follow
          </p>
        </div>
        <div className={feedContentStyle.headerActions}>
          <button
            className={feedContentStyle.newPostBtn}
            onClick={() => navigate('/newPost')}
          >
            + New post
          </button>
        </div>
      </div>

      {loading ? (
        <div className={feedContentStyle.center}>Loading feed…</div>
      ) : error ? (
        <div className={feedContentStyle.error}>{error}</div>
      ) : posts.length === 0 ? (
        <div className={feedContentStyle.empty}>
          <h3>No posts yet</h3>
          <p>
            Be the first to <Link to="/newPost">create a post</Link>.
          </p>
        </div>
      ) : (
        <div className={feedContentStyle.list}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
};

export default FeedContent;
