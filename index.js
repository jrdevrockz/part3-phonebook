const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();

const Person = require('./models/person');

morgan.token('body', function jsonBody(res) {
  return JSON.stringify(res.body);
});

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const total = persons.length;
    const date = new Date();
    const responseText = `<p>Phonebook has info for ${total} persons</p><p>${date}</p>`;

    response.send(responseText);
  });
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { number },
    { new: true, runVaildators: true, context: 'query'}
  )
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
}

app.use(errorHandler);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});