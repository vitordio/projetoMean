const express = require('express');

const app = express();
app.use(express.json());

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://vitordio:Dudavitor00@cluster0.vhzwx.mongodb.net/appMean?retryWrites=true&w=majority')
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
  const cliente = new Cliente({
    nome: req.body.nome,
    fone: req.body.fone,
    email: req.body.email
  })

  // (Inserindo um cliente na base)
  // Cada modelo criado pelo mongoose oferece alguns métodos que simplificam as operações de persistência.
  // Para fazer a inserção de um cliente na base, utilizamos o método save do objeto cliente.
  cliente.save()
  .then(clienteInserido => {
    res.status(201).json({
      mensagem: 'Cliente inserido',
      id: clienteInserido._id
    });
  });
})

// (Buscando dados)
// Para a busca, usaremos o método estático find do modelo Cliente. Ele devolve uma promise
// por meio da qual podemos acessar a coleção de documentos.
app.get('/api/clientes', (req, res) => {
  Cliente.find().then(documents => {
    console.log(documents);
    res.status(200).json({
      mensagem: 'Tudo OK',
      clientes: documents
    })
  })
})

/**
 * Método Delete - passando o ID
 *
 * Para, de fato, remover o cliente cujo botão remover associado foi clicado, vamos usar o método
 * deleteOne de nosso modelo (Cliente, no Back End). Ele espera o id do documento a ser
 * removido. Embora a aplicação Angular tenha se preocupado em mapear o nome _id para id,
 * ainda há documentos no MongoBD utilizando o nome _id e, por essa razão, ainda o utilizamos.
*/
app.delete('/api/clientes/:id', (req, res, next) => {
  Cliente.deleteOne({ _id: req.params.id }).then((resultado) => {
    console.log(resultado);
    res.status(200).end();
  })
})

app.use('/api/clientes', (req, res) => {
  res.status(200).json({
    mensagem: "Tudo OK",
    clientes
  })
})

module.exports = app;
