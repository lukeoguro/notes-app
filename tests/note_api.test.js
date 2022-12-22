const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');

const Note = require('../models/note');
const User = require('../models/user');
const helper = require('./test_helper');

const app = require('../app');
const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash('secret', 10);
  const user = new User({ username: 'root', name: 'root', passwordHash });
  await user.save();

  await Note.deleteMany({});
  for (let note of helper.initialNotes) {
    note.user = user._id;
    let noteObject = new Note(note);
    await noteObject.save();
  }
});

describe('when there is initially some notes saved', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  }, 100000);

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes');

    expect(response.body).toHaveLength(helper.initialNotes.length);
  });

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes');

    const contents = response.body.map(r => r.content);
    expect(contents).toContain(
      'Browser can execute only Javascript'
    );
  });
});

describe('viewing a specific note', () => {
  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb();

    const noteToView = notesAtStart[0];

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const processedNoteToView = JSON.parse(JSON.stringify(noteToView));

    expect(resultNote.body).toEqual(processedNoteToView);
  });

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId();

    await api
      .get(`/api/notes/${validNonexistingId}`)
      .expect(404);
  });

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '1';

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400);
  });
});

describe('addition of a new note', () => {
  test('succeeds with valid data and authentication', async () => {
    const response = await api.post('/api/login')
      .send({ username: 'root', password: 'secret' });

    const token = response.body.token;

    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    };

    await api
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    const contents = notesAtEnd.map(r => r.content);

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);
    expect(contents).toContain(
      'async/await simplifies making async calls'
    );
  });

  test('fails with status code 400 if data invalid', async () => {
    const response = await api.post('/api/login')
      .send({ username: 'root', password: 'secret' });

    const token = response.body.token;

    const newNote = {
      important: true
    };

    await api
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(newNote)
      .expect(400);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });

  test('fails with status code 401 if authorization invalid', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(401);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });
});

describe('deletion of a note', () => {
  test('succeeds with status code 204 with valid id and authentication', async () => {
    const response = await api.post('/api/login')
      .send({ username: 'root', password: 'secret' });

    const token = response.body.token;

    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(
      helper.initialNotes.length - 1
    );

    const contents = notesAtEnd.map(r => r.content);
    expect(contents).not.toContain(noteToDelete.content);
  });

  test('fails with status code 401 if authorization invalid', async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(401);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });

  test('fails with status code 403 if deleting note by other user', async () => {
    const passwordHash = await bcrypt.hash('SECRET', 10);
    const user = new User({ username: 'anotheruser', passwordHash });
    await user.save();

    const response = await api.post('/api/login')
      .send({ username: 'anotheruser', password: 'SECRET' });

    const token = response.body.token;

    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });
});

describe('updating a note', () => {
  test('succeeds with valid data and authentication', async () => {
    const response = await api.post('/api/login')
      .send({ username: 'root', password: 'secret' });

    const token = response.body.token;

    const notesAtStart = await helper.notesInDb();
    const noteToUpdate = notesAtStart[0];

    await api
      .put(`/api/notes/${noteToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Some new content' })
      .expect(201);

    const notesAtEnd = await helper.notesInDb();

    const contents = notesAtEnd.map(r => r.content);
    expect(contents).not.toContain(noteToUpdate.content);
    expect(contents).toContain('Some new content');
  });

  test('fails with status code 401 if authorization invalid', async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToUpdate = notesAtStart[0];

    await api
      .put(`/api/notes/${noteToUpdate.id}`)
      .send({ content: 'Some new content' })
      .expect(401);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });

  test('fails with status code 403 if updating note by other user', async () => {
    const passwordHash = await bcrypt.hash('SECRET', 10);
    const user = new User({ username: 'anotheruser', passwordHash });
    await user.save();

    const response = await api.post('/api/login')
      .send({ username: 'anotheruser', password: 'SECRET' });

    const token = response.body.token;

    const notesAtStart = await helper.notesInDb();
    const noteToUpdate = notesAtStart[0];

    await api
      .put(`/api/notes/${noteToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Some new content' })
      .expect(403);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });

  test('fails with status code 404 if note does not exist', async () => {
    const response = await api.post('/api/login')
      .send({ username: 'root', password: 'secret' });

    const token = response.body.token;

    const validNonexistingId = await helper.nonExistingId();

    await api
      .put(`/api/notes/${validNonexistingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Some new content' })
      .expect(404);
  });

  test('fails with status code 400 if id is invalid', async () => {
    const response = await api.post('/api/login')
      .send({ username: 'root', password: 'secret' });

    const token = response.body.token;

    const invalidId = '1';

    await api
      .put(`/api/notes/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Some new content' })
      .expect(400);
  });
});

describe('when there is initially one user in db', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('username must be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});

afterAll(() => {
  mongoose.connection.close();
});