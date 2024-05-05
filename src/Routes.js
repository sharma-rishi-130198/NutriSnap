// Routes.js
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './Login';
import Upload from './Upload';

const Routes = () => {
  return (
    <Router>
      <Route>
        <Route exact path="/" element={Login} />
        <Route path="/upload" element={Upload} />
      </Route>
    </Router>
  );
};

export default Routes;
