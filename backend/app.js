const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const clientes = [];

// Vamos especificar uma função que executa antes de a requisição ser atendida.
// Ela se encarrega de ajustar os cabeçalhos da resposta.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

/**
 * Endpoint para inserção de novos clientes
*/
app.post('/api/clientes', (req, res, next) => {
  const cliente = req.body;
  res.status(201).json({ mensagem: 'Cliente inserido' });
})

app.use('/api/clientes', (req, res) => {
  res.status(200).json({
    mensagem: "Tudo OK",
    clientes
  })
})

module.exports = app;
