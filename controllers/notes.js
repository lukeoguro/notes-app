const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');

const jwt = require('jsonwebtoken');

notesRouter.get('/', async (_, res) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 });
  res.json(notes);
});

notesRouter.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

const getTokenFrom = req => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

notesRouter.post('/', async (req, res) => {
  const body = req.body;

  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);

  const user = await User.findById(decodedToken.id);

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id,
  });

  const savedNote = await note.save();

  user.notes = user.notes.concat(savedNote._id);
  await user.save();

  res.status(201).json(savedNote);
});

notesRouter.put('/:id', async (req, res) => {
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);

  const user = await User.findById(decodedToken.id);
  const noteToUpdate = await Note.findById(req.params.id);

  if (!noteToUpdate) {
    return res.status(404).end();
  } else if (!user._id.equals(noteToUpdate.user)) {
    return res.status(403).end();
  }

  const note = {
    content: req.body.content,
    important: req.body.important
  };

  noteToUpdate.content = req.body.content;
  noteToUpdate.important = req.body.important;
  const options = { new: true, runValidators: true, context: 'query' };
  const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, options);
  res.status(201).json(updatedNote);
});

notesRouter.delete('/:id', async (req, res) => {
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);

  const user = await User.findById(decodedToken.id);
  const noteToDelete = await Note.findById(req.params.id);

  if (user._id.equals(noteToDelete.user)) {
    await noteToDelete.remove();
    res.status(204).end();
  } else {
    res.status(403).end();
  }
});

module.exports = notesRouter;