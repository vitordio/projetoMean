const express = require('express');
const router = express.Router();

const Cliente = require('../models/cliente');

/**
 * Endpoint para inserção de novos clientes
*/
router.post('', (req, res, next) => {
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
router.get('', (req, res) => {
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
router.delete('/:id', (req, res, next) => {
  Cliente.deleteOne({ _id: req.params.id }).then((resultado) => {
    console.log(resultado);
    res.status(200).end();
  })
})

/**
 * Método para atualizar o cliente - passando o ID
*/
router.put('/:id', (req, res, next) => {
  const cliente = new Cliente({
    _id: req.params.id,
    nome: req.body.nome,
    fone: req.body.fone,
    email: req.body.email
  })

  Cliente.updateOne({_id: req.params.id}, cliente)
  .then((resultado) => {
    console.log(resultado);
  })

  res.status(200).json({
    mensagem: `Atualização do cliente de ID ${req.params.id} realizada com sucesso`
  })
})

/**
 * Na página de edição de clientes, quando clicamos em atualizar no navegador, a página
 * reaparece com os campos todos vazios. Note, contudo ,que o id do cliente cujos dados estavam
 * sendo exibidos ainda está disponível na URL. Isso quer dizer que podemos buscar seus dados no
 * servidor usando seu id e manter seus dados na tela. Começamos implementando um novo
 * endpoint no Back End.
*/
router.get('/:id', (req, res, next) => {
  Cliente.findById(req.params.id).then(cli => {
    if(cli)
    {
      res.status(200).json(cli);
    } else
    {
      res.status(404).json({
        mensagem: "Cliente não encontrado!"
      })
    }
  })
})

module.exports = router;
