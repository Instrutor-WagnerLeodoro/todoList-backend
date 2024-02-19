const express = require('express')
const { v4: uuidV4 } = require('uuid')

const app = express()

app.use(express.json())

const users = [];

function checkExistsUserAccount(req, res, next){
    const {username} = req.headers
    const user = users.find(user =>  user.username === username)

    if(!user) {
        return res.status(400).json("Usuário não encontrado")
    }

    req.user = user

    next()
}

app.post("/users", (req, res) => {
    const { name } = req.body
    const { username } = req.body

    const userAlreadyExists = users.some(user => user.username === username)

    if(userAlreadyExists) {
        return res.status(400).json("Usuário já cadastrado!")
    }

    const user = {
        id: uuidV4(),
        name,
        username,
        todo: []
    }

    users.push(user)

    res.status(201).json(user)
})

app.get("/users", (req, res) => {
    res.status(200).json(users)
})

/* --------------------------------------------------- */
/* Criação e manipulação de tarefas do usuário */

app.post("/todo", checkExistsUserAccount, (req, res) => {
    const { user } = req;
    
    const { title, description, deadLine } = req.body

    const todo = {
        id: uuidV4(),
        title,
        description,
        done: false,
        deadLine: new Date(deadLine),
        created_at: new Date(),
    }

    user.todo.push(todo)

    return res.status(201).json(todo)
})

app.get("/todo", checkExistsUserAccount, (req, res) => {
    const {user} = req;
    
    return res.status(200).json(user.todo)
})

app.delete("/todo/:id", checkExistsUserAccount, (req, res) => {
    const {id} = req.params;
    const {user} = req;
    
    const todoIndex = user.todo.findIndex(todo => todo.id === id)

    user.todo.splice(todoIndex, 1)

    return res.status(200).json("Registro deletado com sucesso!")

})

app.patch("/todo/:id/done", checkExistsUserAccount, (req, res) => {
    const {id} = req.params;
    const {user} = req;

    const todo =  user.todo.find(todo => todo.id === id)

    todo.done = true

    return res.status(200).json("Registro atualizado com sucesso!")
})

app.put("/todo/:id", checkExistsUserAccount, (req, res) => {
    const {id} = req.params
    const {title, description, deadLine} = req.body

    const {user} = req

    const todo = user.todo.find(todo => todo.id === id)

    todo.title = title
    todo.description = description
    todo.deadLine = deadLine

    return res.status(200).json("Registro atualizado com sucesso!")

})











app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Algo deu errado!")
})

const PORT = 3333

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})