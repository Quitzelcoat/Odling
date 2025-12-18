// src/components/feed/Feed.jsx
import LeftBar from '../../components/feed/leftBar/LeftBar';
import FeedContent from '../../components/feed/feedContent/FeedContent';
import RightBar from '../../components/feed/rightBar/RightBar';

import feedStyle from './Feed.module.css';

import NotificationProvider from '../../components/notifications/NotificationProvider';
import NotificationSlider from '../../components/notifications/NotificationSlider';

const Feed = () => {
  return (
    <NotificationProvider>
      <div className={feedStyle.appShell}>
        <div className={feedStyle.container}>
          <LeftBar />
          <FeedContent />
          <RightBar />
        </div>
      </div>
      <NotificationSlider />
    </NotificationProvider>
  );
};

export default Feed;
