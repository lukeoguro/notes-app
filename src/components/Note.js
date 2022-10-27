function Note({ note }) {
  return note.important ? <li><b>{note.content}</b></li> : <li>{note.content}</li>;
}

export default Note;