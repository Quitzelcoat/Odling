// src/components/feed/Feed.jsx
import LeftBar from './leftBar/LeftBar';
import FeedContent from './feedContent/FeedContent';
import RightBar from './rightBar/RightBar';

import feedStyle from './Feed.module.css';

// notification pieces
import NotificationProvider from '../notifications/NotificationProvider';
import NotificationSlider from '../notifications/NotificationSlider';

const Feed = () => {
  return (
    <NotificationProvider>
      <div className={feedStyle.container}>
        <LeftBar />
        <FeedContent />
        <RightBar />
      </div>

      {/* slider overlays the page — keep it outside container so it can float */}
      <NotificationSlider />
    </NotificationProvider>
  );
};

export default Feed;
