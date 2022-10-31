// Command-line database
import mongoose from 'mongoose';

(async () => {
  const [, , password, content] = process.argv;

  if (password === undefined) {
    console.log('Please provide the password as an argument: node mongo.js <password>');
    process.exit(1);
  } else {
    const url = `mongodb+srv://fullstack:${password}@cluster0.kaiikmc.mongodb.net/noteApp?retryWrites=true&w=majority`;

    await mongoose.connect(url);

    const Note = mongoose.model('Note', new mongoose.Schema({
      content: String,
      date: Date,
      important: Boolean,
    }));

    if (content === undefined) {
      const notes = await Note.find({});
      notes.forEach(note => console.log(note));
    } else {
      const note = new Note({
        content,
        date: new Date(),
        important: true,
      });
      await note.save();
      console.log('Note saved!');
    }

    return mongoose.connection.close();
  }
})();