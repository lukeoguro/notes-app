function Note({ note, toggleImportance, handleNoteDelete, currentUser }) {
  const label = note.important ? 'Unmark as important' : 'Mark as important'
  const isByUser = currentUser && note.user.username === currentUser.username
  return (
    <li className='note'>
      <span className={note.important ? 'important' : ''}>{note.content} - {note.user.name}</span>
      {isByUser && <button onClick={toggleImportance}>{label}</button>}
      {isByUser && <button onClick={() => { handleNoteDelete(note.id) }}>Delete</button>}
    </li>
  )
}

export default Note