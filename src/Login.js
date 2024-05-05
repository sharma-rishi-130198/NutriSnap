  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Navbar from './Navbar';
  import Upload from './Upload'; 
  import './MyStyles.css';

  //aws amplify ui component
  import { Amplify, Auth } from 'aws-amplify';

  import { Authenticator } from '@aws-amplify/ui-react';
  import '@aws-amplify/ui-react/styles.css';

  import awsExports from './aws-exports';
  Amplify.configure(awsExports);
  

  function Header() {
    
    return (
      <div style={{paddingTop: 100}}>
        <h1 className='centered-header'>CaloSnap</h1>
      </div>
    );
  }

  function Login() {
    const navigate = useNavigate();

    useEffect(() => {
      checkUser();
    }, []);

    async function checkUser() {
      try {
        await Auth.currentAuthenticatedUser();
        // navigate('/upload', { state: { fromLogin: true } });
      } catch {
        console.log('user is not signed in');
      }
    }

    return (
      <div>
      <Authenticator components={{ Header: Header }}>
        {({ signOut, user }) => (
            <main>
              <Navbar username={user.username}/>
              <Upload username2={user.username} fromLogin />
            </main>
         
        )}
      </Authenticator>
      </div>
    );
  }

  export default Login;

