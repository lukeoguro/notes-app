import { useState, useEffect } from 'react';
import axios from 'axios';
import Note from './components/Note';

function App() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('A new note...');
  const [showAll, setShowAll] = useState(true);
  const notesToShow = showAll ? notes : notes.filter(({ important: i }) => i);

  useEffect(() => {
    const request = axios.get('http://localhost:3001/notes');
    request.then(response => setNotes(response.data));
  }, []);

  function handleContentChange(e) {
    setContent(e.target.value);
  }

  function handleNoteSubmit(e) {
    e.preventDefault();

    const newNote = {
      content,
      date: new Date().toISOString(),
      important: Math.random() < 0.5,
      id: notes.length + 1,
    }

    setNotes(notes.concat(newNote));
    setContent('');
  }

  return (
    <div>
      <h1>Notes</h1>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          Show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note =>
          <Note key={note.id} note={note} />
        )}
      </ul>
      <form onSubmit={handleNoteSubmit}>
        <input value={content} onChange={handleContentChange} />
        <button type="submit">Save</button>
      </form>
    </div>
  )
}

export default App;
