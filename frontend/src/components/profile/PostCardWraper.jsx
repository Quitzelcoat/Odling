import PostCard from '../postCard/PostCard';
import styles from './Profile.module.css';

const PostCardWrapper = ({ post }) => (
  <div className={styles.postWrap}>
    <PostCard post={post} />
  </div>
);

export default PostCardWrapper;
