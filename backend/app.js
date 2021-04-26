require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

// Importando as rotas definidas no routes/clientes.js
const clienteRoutes = require('./routes/clientes');

// Acessando as variáveis de ambiente
const dbUser = process.env.MONGODB_USER;
const dbPassword = process.env.MONGODB_PASSWORD;
const dbCluster = process.env.MONGODB_CLUSTER;
const dbName = process.env.MONGODB_DATABASE;

const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@${dbCluster}.vhzwx.mongodb.net/${dbName}?retryWrites=true&w=majority`)
.then(() => {
  console.log('Conexão OK');
}).catch(() => {
  console.log('Conexão NOK');
})

// Importação do Schema
const Cliente = require('./models/cliente')
const clientes = [];

// Vamos especificar uma função que executa antes de a requisição ser atendida.
// Ela se encarrega de ajustar os cabeçalhos da resposta.
app.use ((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type,Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE,OPTIONS');
  next();
});

// app.use('/api/clientes', (req, res) => {
//   res.status(200).json({
//     mensagem: "Tudo OK",
//     clientes
//   })
// })

app.use('/api/clientes', clienteRoutes);
module.exports = app;
