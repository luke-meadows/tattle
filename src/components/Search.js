import '../styles/Search.css';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
  selectDisableScreen,
  toggleDisableScreen,
} from '../features/disableScreen';
import { Link } from 'react-router-dom';
import { getUsers } from '../lib/getUser';
import { selectUser } from '../features/userSlice';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [backspacing, setBackspacing] = useState(false);
  const disableScreen = useSelector(selectDisableScreen);

  // This is the best free solution for searching as firebase does not currently support search. This option is not scalable as it relies on fetching all users, however for the purposes of this small project it is ok. LM.
  const dispatch = useDispatch();
  const loggedInUserId = useSelector(selectUser).userId;
  useEffect(async () => {
    // Stops running when first rendered & clears results if user deleted search
    if (searchTerm.length === 0) {
      setResults([]);
      toggleDisableScreen(false);
      return;
    }
    // Stops running when user is backspacing
    if (backspacing) return;
    // First fetch all users if no users set when user types.
    if (searchTerm.length === 1) {
      dispatch(toggleDisableScreen(!disableScreen));

      const userData = await getUsers(loggedInUserId);
      setAllUsers(userData);
    }

    // Match the user with the input
    const results = allUsers.filter((user) => {
      const regex = new RegExp(searchTerm, 'i');
      return user.username.match(regex);
    });
    setResults(results);
  }, [searchTerm]);

  // Stops searchbar from refetching queries if user is backspacing
  function handleKeyDown(e) {
    if (e.keyCode === 8) {
      if (searchTerm.length === 1) {
        dispatch(toggleDisableScreen(!disableScreen));
      }
      setBackspacing(true);
    } else {
      setBackspacing(false);
    }
  }

  return (
    <div className="search__container">
      <div className="search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {results && (
        <div
          className={
            results.length > 0 ? 'search__results active' : 'search__results'
          }
        >
          {results?.map((user) => (
            <Link
              onClick={() => {
                console.log('click');
                dispatch(toggleDisableScreen(false));
                setSearchTerm('');
              }}
              to={`/profile/${user.userId}`}
              key={user.userId}
            >
              {user.username}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
