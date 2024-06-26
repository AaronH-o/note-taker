const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');
const { clog } = require('./middleware/clog');
const notes = require('./db/db');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(clog);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {  
  res.status(200).json(notes)
  console.log('getNotes', notes);
});

app.delete('/api/notes/:id', (req, res) => {
  console.info(`${req.method} request received to delete a note`);
  const noteId = req.params.id;
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if(err) {
      console.error(err);
    } else {
      const parsedNotes = JSON.parse(data);
      const newNotesArray = parsedNotes.filter(
        (note) => note.id !== noteId
      );
      fs.writeFile('./db/db.json',
        JSON.stringify(newNotesArray, null, 4),
        (writeErr) =>
          writeErr
            ? console.error(writeErr)
            : console.info('Successfully updated reviews')
      );
    }
  }
  );
  res.status(200).json('Note deleted');
});

app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);
  const { title, text} = req.body;

  if(title && text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if(err) {
        console.error(err);
      } else {
        const parsedNotes = JSON.parse(data);

        parsedNotes.push(newNote);

        fs.writeFile('./db/db.json',
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) => 
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully updated reviews')
        )
      }
    })

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log("wow", response);
    return res.status(201).json(response);
  } else {
    return res.status(500).json('Error in adding the note');
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
