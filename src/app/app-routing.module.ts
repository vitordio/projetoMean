import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClienteInserirComponent } from './clientes/cliente-inserir/cliente-inserir.component';
import { ClienteListaComponent } from './clientes/cliente-lista/cliente-lista.component';
/**
 * Em geral, um módulo como esse armazena uma lista de rotas. Trata-se de uma lista cujos
 * objetos mapeiam padrões (/clientes, por exemplo) a nomes de componentes (ClientesComponent,
 * por exemplo). Cada objeto é do tipo Route.
*/
const routes: Routes = [

  /**
   * A primeira rota que definiremos mapeia a raiz da aplicação (associada a path) ao componente
   * que exibe a lista de clientes (associado a component)
  */
  { path: "", component: ClienteListaComponent },
  { path: "criar", component: ClienteInserirComponent }, // Uma nova rota poderia dar acesso a um componente que permite a inserção de clientes.
  { path: "editar/:idCliente", component: ClienteInserirComponent } // Edição de clientes.
]

@NgModule({
  /**
   * Para utilizar o módulo de roteamento do Angular, adicionamos à coleção imports
   * Chamando o método forRoot para especificar o objeto de rotas a ser usado
  */
  imports: [
    RouterModule.forRoot(routes)
  ],
  /**
   * Precisamos acessar o módulo de rotas (configurado com as rotas que especificamos) a partir do
   * módulo principal de nossa aplicação, definido no arquivo app.module.ts. Para isso, o primeiro
   * passo é especificá-lo na coleção exports nos metadados do módulo de roteamento.
   */
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {

}
