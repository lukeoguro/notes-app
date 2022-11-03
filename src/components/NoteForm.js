import { useState } from 'react';

const NoteForm = ({ createNote }) => {
  const [content, setContent] = useState('');

  function handleContentChange(e) {
    setContent(e.target.value);
  }

  function handleNoteSubmit(e) {
    e.preventDefault();

    createNote({ content, important: false });
    setContent('');
  }

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={handleNoteSubmit}>
        <input
          value={content}
          onChange={handleContentChange}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  )
}

export default NoteForm;