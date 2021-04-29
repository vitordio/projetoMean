const express = require('express');
const router = express.Router();

const MIME_TYPE = require('../mimeType');

/**
 * (Lidando com a foto no servidor) com o Multer
 *
 * ele adiciona objetos file e/ou files à request. Deles podemos obter o(s) arquivo(s) enviados.
*/
const multer = require('multer');
const armazenamento = multer.diskStorage({
  /**
   * Requisição, arquivo estraído e uma função a ser
   * executada, capaz de indicar um erro ou devolver o
   * diretório em que as fotos ficarão
   */

  destination: (req, file, callback) => {
    // Validação do arquivo recebido, caso não seja uma foto, retornaremos um erro
    const e = MIME_TYPE[file.mimetype] ? null : new Error('Extensão Inválida')

    callback(e, 'backend/images');
  },
  filename: (req, file, callback) => {
    // Construção do nome do arquivo
    const nome = file.originalname.toLowerCase().split(" ").join("-");
    const extensao = MIME_TYPE[file.mimetype];

    callback(null, `${nome}-${Date.now()}.${extensao}`);
  }
})

// Instanciamos a model do cliente
const Cliente = require('../models/cliente');

/**
 * Endpoint para inserção de novos clientes
 *
 * Chamamos multer entregando a ela o objeto armazenamento e, a seguir, chamamos single indicando que esperamos um único
 * arquivo. O argumento entregue a single é o nome da propriedade a que o arquivo estará associado.
*/
router.post('', multer({ storage: armazenamento }).single('image'), (req, res, next) => {
  /**
 * A seguir, montamos o endereço da foto. O primeiro passo é descobrir o protocolo (HTTP ou HTTPS) e o endereço do host.
  * Ambas as informações estão disponíveis no objeto req, que representa a requisição.
  *
  * Com essas informações em mãos, montamos o endereço desejado incluindo o nome do arquivo que também se encontra na requisição.
  * Note que as fotos estão originalmente armazenadas em backend/imagens.
  *
  * Iremos, contudo, fazer com que os clientes possam acessá-las diretamente de imagens, escondendo a existência da pasta backend.
  */
  const imageUrl = `${req.protocol}://${req.get('host')}`;
  const cliente = new Cliente({
    nome: req.body.nome,
    fone: req.body.fone,
    email: req.body.email,
    imageUrl: `${imageUrl}/imagens/${req.file.filename}`
  })

  // (Inserindo um cliente na base)
  // Cada modelo criado pelo mongoose oferece alguns métodos que simplificam as operações de persistência.
  // Para fazer a inserção de um cliente na base, utilizamos o método save do objeto cliente.
  cliente.save()
  .then(clienteInserido => {
    res.status(201).json({
      mensagem: 'Cliente inserido',
      cliente: {
        id: clienteInserido._id,
        nome: clienteInserido.nome,
        fone: clienteInserido.fone,
        email: clienteInserido.email,
        imageUrl: clienteInserido.imageUrl
      }
    });
  });
})

// (Buscando dados)
// Para a busca, usaremos o método estático find do modelo Cliente. Ele devolve uma promise
// por meio da qual podemos acessar a coleção de documentos.
router.get('', (req, res) => {
  Cliente.find().then(documents => {
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
router.put('/:id', multer({ storage: armazenamento }).single('image'), (req, res, next) => {
  let imageUrl = req.body.imageUrl; // tentamos pegar a URL já existente
  if(req.file)
  {
    const url = `${req.protocol}://${req.get('host')}`;
    imageUrl = `${url}/imagens/${req.file.filename}`;
  }

  const cliente = new Cliente({
    _id: req.params.id,
    nome: req.body.nome,
    fone: req.body.fone,
    email: req.body.email,
    imageUrl
  })

  Cliente.updateOne({_id: req.params.id}, cliente)
  .then((resultado) => {
    res.status(200).json({
      mensagem: `Atualização do cliente de ID ${req.params.id} realizada com sucesso`
    })
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
