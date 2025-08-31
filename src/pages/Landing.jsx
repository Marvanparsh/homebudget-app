import { Link } from 'react-router-dom';
import { UserPlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import illustration from '../assets/illustration.jpg';
import darkIllustration from '../assets/dark.webp';
import wave from '../assets/wave.svg';
import { useTheme } from '../contexts/ThemeContext';

const Landing = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="layout">
      <main>
        <div className="intro">
          <div>
            <h1>
              Take Control of <span className="accent">Your Money</span>
            </h1>
            <p>
              Personal budgeting is the secret to financial freedom. Start your journey today.
            </p>
            <div className="landing-actions">
              <Link to="/signup" className="btn btn--dark">
                <UserPlusIcon width={20} />
                <span>Get Started Free</span>
              </Link>
              <Link to="/login" className="btn btn--outline">
                <ArrowRightIcon width={20} />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
          <img src={isDark ? darkIllustration : illustration} alt="Person with money" width={600} height={400} />
        </div>
      </main>
      <img src={wave} alt="Decorative wave pattern" />
    </div>
  );
};

export default Landing;