// src/components/profile/PostCardWrapper.jsx
import PostCard from '../postCard/PostCard';
import styles from './PostCardWraper.module.css';

const PostCardWrapper = ({ post }) => (
  <div className={styles.postWrap}>
    <PostCard post={post} />
  </div>
);

export default PostCardWrapper;
