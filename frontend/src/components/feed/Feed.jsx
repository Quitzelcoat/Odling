import LeftBar from './leftBar/LeftBar';
import FeedContent from './feedContent/FeedContent';
import RightBar from './rightBar/RightBar';

import feedStyle from './Feed.module.css';

const Feed = () => {
  return (
    <div className={feedStyle.container}>
      <LeftBar />
      <FeedContent />
      <RightBar />
    </div>
  );
};

export default Feed;
