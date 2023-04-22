const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(express.json());

app.use(
  morgan(function (tokens, req, res) {
    return req.method !== "POST"
      ? null
      : [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, "content-length"),
          "-",
          tokens["response-time"](req, res),
          "ms",
          JSON.stringify(req.body),
        ].join(" ");
  })
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("");
});

app.get("/info", (request, response) => {
  const info = `The phonebook server has info for ${persons.length} persons`;
  const currentTime = new Date().toString();
  response.status(200).send(
    `    <div>
      <p>${info}</p>
      <p>${currentTime}</p>
    </div>`
  );
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  person
    ? response.json(person)
    : response.status(404).send({ error: "invalid id" });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const person = request.body;

  if (!person.name || !person.number)
    return response.status(401).send({ error: "missing name or number" });

  if (persons.filter((entry) => entry.name === person.name).length > 0)
    return response.status(401).send({ error: "name must be unique" });

  person.id = Math.floor(Math.random() * 999999);

  persons = persons.concat(person);

  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
