require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const Person = require("./models/person");

app.use(express.static("build"));
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

app.get("/", (request, response) => {
  response.send("");
});

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    const info = `The phonebook server has info for ${persons.length} persons`;
    const currentTime = new Date().toString();
    response.status(200).send(
      `    <div>
      <p>${info}</p>
      <p>${currentTime}</p>
    </div>`
    );
  });
});

app.get("/api/persons", (request, response, next) => {
  Person.find({}).then((persons) => response.json(persons));
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) =>
      person
        ? response.json(person)
        : response.status(404).send({ error: "invalid id" })
    )
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const person = request.body;
  console.log(person);

  if (!person.name || !person.number)
    return response.status(401).send({ error: "missing name or number" });

  const newPerson = new Person({
    name: person.name,
    number: person.number,
  });
  newPerson
    .save()
    .then((savedPerson) => response.json(savedPerson))
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updated) => {
      response.json(updated);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.name);
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
