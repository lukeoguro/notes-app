import { useState, useEffect } from 'react';
import Note from './components/Note';
import noteService from './services/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [showAll, setShowAll] = useState(true);
  const notesToShow = showAll ? notes : notes.filter(({ important: i }) => i);

  useEffect(() => {
    noteService.getAll().then(initialNotes => setNotes(initialNotes));
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

    noteService.create(newNote).then(returnedNote => {
      setNotes(notes.concat(returnedNote));
      setContent('');
    });
  }

  const toggleImportanceOf = id => {
    const note = notes.find(note => note.id === id);
    const changedNote = { ...note, important: !note.important };

    noteService.update(id, changedNote).then(returnedNote => {
      setNotes(notes.map(note => note.id !== id ? note : returnedNote));
    });
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
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
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
