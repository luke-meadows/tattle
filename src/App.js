import './styles/App.css';
import './styles/ScrollContainer.css';
import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import { auth } from './db/firebase';
import { useDispatch } from 'react-redux';
import { login, logout } from './features/userSlice';
import { useEffect } from 'react';
import Login from './components/Login';
import { getUser } from './lib/getUser';
import LoggedInUserProfilePage from './pages/LoggedInUserProfilePage';
import Network from './pages/Network';

function App() {
  const dispatch = useDispatch();
  // Persist login state
  useEffect(async () => {
    auth.onAuthStateChanged(async (userCredential) => {
      if (userCredential) {
        const user = await getUser(userCredential.uid);
        dispatch(
          login({
            email: userCredential.email,
            userId: userCredential.uid,
            displayName: userCredential.displayName,
            profilePic: userCredential.photoURL || '',
            bannerImage: user.bannerImage || null,
            firstName: user.firstName,
            lastName: user.lastName,
            username: `${user.firstName} ${user.lastName}`,
            location: user.location || null,
            bio: user.bio || null,
          })
        );
      } else {
        dispatch(logout());
      }
    });
  }, []);

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<LoggedInUserProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/network" element={<Network />} />
      </Routes>
    </div>
  );
}

export default App;
