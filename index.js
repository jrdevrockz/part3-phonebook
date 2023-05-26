const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

morgan.token('body', function jsonBody(res) {
  return JSON.stringify(res.body);
});

app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(express.static('build'));

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.get('/info', (request, response) => {
  const total = persons.length;
  const date = new Date();
  const responseText = `<p>Phonebook has info for ${persons.length} persons</p>
    <p>${date}</p>`;

  response.send(responseText);
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  return Math.floor(Math.random() * 1000000);
}

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'name is missing'
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number is missing'
    });
  }

  const nameAlreadyUsed = persons.find(person => person.name === body.name);

  if (nameAlreadyUsed) {
    return response.status(400).json({
      error: 'name must be unique'
    });
  }

  const person = { ...body, id: generateId() };

  persons = persons.concat(person);

  response.json(person);
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});