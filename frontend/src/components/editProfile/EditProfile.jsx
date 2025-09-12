// src/components/editProfile/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import api from '../../auth/api';
import styles from './EditProfile.module.css';

const EditProfile = () => {
  const { user, token, refreshUser, setUser } = useAuth(); // if setUser exposed, will update global immediately
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    name: '',
    bio: '',
    profilePic: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        name: user.name || '',
        bio: user.bio || '',
        profilePic: user.profilePic || '',
      });
      setPreview(user.profilePic || '/default-avatar.png');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === 'profilePic') setPreview(value || '/default-avatar.png');
  };

  const validate = () => {
    // username rules: 3-30 chars, letters/numbers/._- allowed
    if (
      form.username &&
      (form.username.length < 3 || form.username.length > 30)
    ) {
      return 'Username must be between 3 and 30 characters.';
    }
    if (form.username && !/^[A-Za-z0-9._-]+$/.test(form.username)) {
      return 'Username can only contain letters, numbers, dot, underscore, and hyphen.';
    }
    if (form.name && form.name.length > 60) {
      return 'Display name must be 60 characters or less.';
    }
    if (form.bio && form.bio.length > 400) {
      return 'Bio must be 400 characters or less.';
    }
    return null;
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    try {
      const data = await api.request('/profile', {
        method: 'PUT',
        body: {
          username: form.username,
          name: form.name,
          bio: form.bio,
          profilePic: form.profilePic,
        },
        token,
      });

      // use returned user to update preview/form and global user if possible
      if (data?.user) {
        const newPic = data.user.profilePic || '/default-avatar.png';
        setPreview(newPic);
        setForm((f) => ({
          ...f,
          username: data.user.username || f.username,
          name: data.user.name || f.name,
          bio: data.user.bio || f.bio,
          profilePic: data.user.profilePic || f.profilePic,
        }));

        // update global user immediately if AuthProvider exposed setUser
        if (typeof setUser === 'function') {
          setUser(data.user);
        }
      }

      if (refreshUser) await refreshUser();
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.body?.error || err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Edit Profile</h2>

        <div className={styles.split}>
          <div className={styles.left}>
            <form onSubmit={onSave} className={styles.form}>
              <label className={styles.label}>
                Username
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className={styles.input}
                  maxLength="30"
                  placeholder="username (unique)"
                />
              </label>

              <label className={styles.label}>
                Display name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.input}
                  maxLength="60"
                />
              </label>

              <label className={styles.label}>
                Bio
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="6"
                  className={styles.textarea}
                  maxLength="400"
                />
                <div className={styles.counter}>{form.bio.length}/400</div>
              </label>

              <label className={styles.label}>
                Profile picture (image URL)
                <input
                  name="profilePic"
                  value={form.profilePic}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="https://..."
                />
                <div className={styles.smallNote}>
                  You can paste an image link for now.
                </div>
              </label>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.controls}>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate('/profile')}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <aside className={styles.right}>
            <div className={styles.previewCard}>
              <img
                src={preview || '/default-avatar.png'}
                alt="preview"
                className={styles.previewAvatar}
              />
              <h3 className={styles.previewName}>
                {form.name || form.username || user?.username}
              </h3>
              <p className={styles.previewBio}>
                {form.bio || user?.bio || 'No bio yet.'}
              </p>
            </div>
            <div className={styles.helper}>
              <strong>Tips</strong>
              <ul>
                <li>Use a square image URL for best results.</li>
                <li>Keep bio short and clear.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default EditProfile;
