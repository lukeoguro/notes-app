import { useState, useEffect } from 'react';
import Note from './components/Note';
import Notification from './components/Notification';
import noteService from './services/notes';
import loginService from './services/login';

function App() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
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

  function handleContentChange(e) {
    setContent(e.target.value);
  }

  function handleNoteSubmit(e) {
    e.preventDefault();

    const newNote = {
      content,
      date: new Date().toISOString(),
      important: false,
    }

    noteService.create(newNote)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote));
        setContent('');
      })
      .catch(error => {
        setErrorMessage(error.response.data.error);
        setTimeout(() => setErrorMessage(null), 5000);
      });
  }

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

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );

  const noteForm = () => (
    <form onSubmit={handleNoteSubmit}>
      <input
        value={content}
        onChange={handleContentChange}
      />
      <button type="submit">Save</button>
    </form>
  );

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {user === null ?
        loginForm() :
        <div>
          <p>Logged in as: {user.name}</p>
          {noteForm()}
          <button onClick={handleLogout}>Logout</button>
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
