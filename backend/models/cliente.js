// Importando o pacote do MongoDB
const mongoose = require('mongoose');

// Definindo o schema
const clienteSchema = mongoose.Schema({
  nome: { type: String, required: true},
  fone: { type: String, required: false, default: '0000000'},
  email: { type: String, required: true }
})

// criamos o modelo associado ao Cliente e exportamos
// tornando acessível para outros módulos da aplicação
module.exports = mongoose.model('Cliente', clienteSchema);
