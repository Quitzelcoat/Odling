// import { useAuth } from '../../auth/context';
import HomeStyle from './Home.module.css';

const Home = () => {
  // const { user } = useAuth();

  return (
    <div className={HomeStyle.work}>
      <h1 className={`${HomeStyle.textDesign} ${HomeStyle.heading}`}>ODLING</h1>
      <p className={`${HomeStyle.textDesign} ${HomeStyle.subHeading}`}>
        {/* Welcome {user?.username || user?.name || `User ${user?.id}`} */}
        Coming Soon
      </p>
    </div>
  );
};

export default Home;
