import { useState, useEffect, useRef } from 'react';
import Note from './components/Note';
import Notification from './components/Notification';
import LoginForm from './components/LoginForm';
import NoteForm from './components/NoteForm';
import Togglable from './components/Togglable';

import noteService from './services/notes';
import loginService from './services/login';

function App() {
  const [notes, setNotes] = useState([]);
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const notesToShow = showAll ? notes : notes.filter(({ important: i }) => i);

  useEffect(() => {
    noteService.getAll().then(initialNotes => setNotes(initialNotes));
  }, []);

  useEffect(() => {
    const noteAppUser = window.localStorage.getItem('noteAppUser');
    if (noteAppUser) {
      const user = JSON.parse(noteAppUser);
      setUser(user);
      noteService.setToken(user.token);
    }
  }, []);

  const toggleImportanceOf = id => {
    const note = notes.find(note => note.id === id);
    const changedNote = { ...note, important: !note.important };

    noteService.update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote));
      })
      .catch(error => {
        setErrorMessage(`Note '${changedNote.content}' was already removed`);
        setTimeout(() => setErrorMessage(null), 5000);
        setNotes(notes.filter(n => n.id !== id));
      })
  }

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({
        username, password,
      });

      window.localStorage.setItem(
        'noteAppUser', JSON.stringify(user)
      )

      noteService.setToken(user.token);
      setUser(user);
      setUsername('');
      setPassword('');
    } catch (exception) {
      setErrorMessage('Wrong credentials');
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000);
    }
  }

  const handleLogout = async () => {
    window.localStorage.removeItem('noteAppUser');
    setUser(null);
  }

  function handleUsernameChange(e) {
    setUsername(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  function createNote(noteObject) {
    noteService.create(noteObject)
      .then(returnedNote => {
        noteFormRef.current.toggleVisibility();
        setNotes(notes.concat(returnedNote));
      })
      .catch(error => {
        setErrorMessage(error.response.data.error);
        setTimeout(() => setErrorMessage(null), 5000);
      });
  }

  const noteFormRef = useRef();

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {user === null ?
        <Togglable buttonLabel="Login">
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={handleUsernameChange}
            handlePasswordChange={handlePasswordChange}
            handleLogin={handleLogin}
          />
        </Togglable> :
        <div>
          <p>Logged in as: {user.name}</p>
          <button onClick={handleLogout}>Logout</button>
          <Togglable buttonLabel="New note" ref={noteFormRef}>
            <NoteForm
              createNote={createNote}
            />
          </Togglable>
        </div>
      }

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          Show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note =>
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        )}
      </ul>
    </div>
  )
}

export default App;
