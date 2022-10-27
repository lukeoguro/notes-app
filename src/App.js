import { useState } from 'react';
import Note from './components/Note';

function App(props) {
  const [notes, setNotes] = useState(props.notes);
  const [content, setContent] = useState('A new note...');
  const [showAll, setShowAll] = useState(true);
  const notesToShow = showAll ? notes : notes.filter(({ important: i }) => i);

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
