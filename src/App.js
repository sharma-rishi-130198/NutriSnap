import Upload from './Upload';
import Login from './Login';
import { Routes, Route} from 'react-router-dom';
import Navbar from './Navbar';
import './MyStyles.css'; 
import UserHistory from './UserHistory';


// Testing
function App() {
  return (
    
      <div className="App">
        
         <Routes>
          <Route path="/"  element={<Login />} />
          <Route path="/upload"  element={<Upload />} />
          <Route path="/userhistory/:username" element={<UserHistory />} />
          </Routes>
      </div>
   
    
  );
}




export default App;
