// src/components/profile/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context';
import api from '../../auth/api';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, loading, token, refreshUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', profilePic: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        profilePic: user.profilePic || '',
      });
    }
  }, [user]);

  if (loading) return <div className={styles.loading}>Loading profile…</div>;
  if (!user)
    return <div className={styles.noUser}>No user found. Please log in.</div>;

  const username = user.username || user.name || `User ${user.id}`;

  const startEdit = () => {
    setSuccess(null);
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    // reset form to current user values
    setForm({
      name: user.name || '',
      bio: user.bio || '',
      profilePic: user.profilePic || '',
    });
    setError(null);
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    // prepare payload
    const payload = {
      name: form.name,
      bio: form.bio,
      profilePic: form.profilePic,
    };

    try {
      // call backend and use returned data
      const data = await api.request('/auth/profile', {
        method: 'PUT',
        body: payload,
        token,
      });

      // data should be { message: 'Profile updated', user: { ... } }
      if (data?.user) {
        setSuccess('Profile updated');
        // refresh global user so whole app updates
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        // fallback success message if server didn't return user
        setSuccess(data?.message || 'Profile updated');
      }

      setEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.body?.error || err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <div className={styles.avatarWrap}>
          <img
            src={user?.profilePic || '/default-avatar.png'}
            alt={username}
            className={styles.avatar}
          />
        </div>

        <div className={styles.info}>
          <div className={styles.topRow}>
            <h2 className={styles.username}>{username}</h2>

            {!editing ? (
              <button className={styles.editBtn} onClick={startEdit}>
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
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
            )}
          </div>

          {!editing ? (
            <div className={styles.meta}>
              <div className={styles.realName}>
                {user?.name || 'No name set'}
              </div>
              <div className={styles.bio}>{user?.bio || 'No bio yet.'}</div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSave}>
              <label className={styles.field}>
                <div className={styles.label}>Display name</div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </label>

              <label className={styles.field}>
                <div className={styles.label}>Bio</div>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="4"
                  className={styles.textarea}
                />
              </label>

              <label className={styles.field}>
                <div className={styles.label}>Profile picture URL</div>
                <input
                  name="profilePic"
                  value={form.profilePic}
                  onChange={handleChange}
                  className={styles.input}
                />
                <div className={styles.smallNote}>
                  You can paste an image URL for now.
                </div>
              </label>
            </form>
          )}
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <section className={styles.posts}>
        <h3>Posts</h3>
        <div className={styles.postsPlaceholder}>
          <p>Posts will be shown here — coming soon.</p>
        </div>
      </section>
    </main>
  );
};

export default Profile;
