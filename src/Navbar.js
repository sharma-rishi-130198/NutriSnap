import React from 'react';
import { useHistory } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom'; 
import { Auth } from 'aws-amplify';
import './MyStyles.css'; 

const Navbar = ({ username }) => {

  const navigate = useNavigate();

  console.log('usenamefromnavbar= ',username);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      navigate('/');
      localStorage.removeItem('username');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateToUpload = () => {
    navigate('/upload', { state: { username, fromLogin: false } });
  };


  return (
    <nav>
      <div className="navbar-container">
        <div className="logo">
          <img src="/mzl.atdamsvq.png" alt="App Icon" />
      
          <span onClick={navigateToUpload}>CaloSnap</span>
        </div>
        <div className="nav-links">
          <Link to={`/userhistory/${username}`}>User History</Link>
        </div>
        <div className="exit-button">
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
