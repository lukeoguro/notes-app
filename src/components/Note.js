function Note({ note, toggleImportance }) {
  const label = note.important ? 'Unmark as important' : 'Mark as important';

  return (
    <li>
      {note.content}
      <button onClick={toggleImportance}>{label}</button>
    </li>
  );
}

export default Note;