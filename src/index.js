const express = require('express');
const cors = require('cors');


const { v4: uuidv4, v4, validate} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(user => user.username === username)
  
  if (!user) {response.status(404).json({error: 'User not found'})}

  return next()
}

function checksExistsTodo () {

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const user = users.some(user => user.username === username)
  if (user) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  
  if (!validate(newUser.id)) {
    return response.status(400).json({ error: 'Não é um ID válido!'})
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const findUser = users.find(user => user.username === username)
  const todos = findUser.todos
  response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const {title, deadline} = request.body
  const findUser = users.find(user => user.username === username)

  const newTodo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  findUser.todos = [...findUser.todos, newTodo]

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const {title, deadline} = request.body
  const {id} = request.params

  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Essa TODO não existe!'})
  }

  const updated = Object.assign(todo, {title, deadline: new Date(deadline)})
  
  return response.status(200).json(updated)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const {id} = request.params

  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Essa TODO não existe!'})
  }

  const res = {...todo, done: true}

  return response.status(200).json(res)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const {id} = request.params

  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)
  
  if (!todo) {
    return response.status(404).json({ error: 'Essa TODO não existe!'})
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  user.todos.splice(todoIndex, 1)

  return response.status(204).send()
});

module.exports = app;