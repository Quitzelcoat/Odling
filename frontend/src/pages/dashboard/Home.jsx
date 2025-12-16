import { useAuth } from '../../auth/context';
import HomeStyle from './Home.module.css';
import { useEffect, useRef } from 'react';

const Home = () => {
  const { user } = useAuth();
  const subRef = useRef(null);

  const text = `Welcome ${user?.username || user?.name || `User ${user?.id}`}`;

  useEffect(() => {
    if (subRef.current) {
      const textWidth = subRef.current.scrollWidth; // actual pixel width
      subRef.current.style.setProperty('--finalWidth', `${textWidth}px`);
      subRef.current.style.setProperty('--steps', text.length);
    }
  }, [text]);

  return (
    <div className={HomeStyle.work}>
      <h1 className={`${HomeStyle.textDesign} ${HomeStyle.heading}`}>ODLING</h1>
      <p
        ref={subRef}
        className={`${HomeStyle.textDesign} ${HomeStyle.subHeading}`}
      >
        {text}
      </p>
    </div>
  );
};

export default Home;
