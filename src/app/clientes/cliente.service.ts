import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Cliente } from './cliente.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Há uma hierarquia de injetores de dependência e
// podemos escolher a partir de qual componente a injeção ocorrerá, o que tem a ver com a
// propriedade providedIn.
@Injectable( { providedIn: 'root'} )

// (Adicionando um serviço à aplicação) O acesso à lista de clientes pode ser centralizado em
// um serviço, o que pode facilitar o acesso à ela por diferentes componentes. Assim, por exemplo,
// não será necessário fazer com que o componente que o componente principal entregue a lista de
// clientes ao componente que a exibe. Cada um deles terá uma referência a uma instância do
// serviço.

export class ClienteService {
  private clientes : Cliente[] = [];

  // No futuro, a lista de clientes será obtida a partir de um servidor remoto. Idealmente, as
  // operações que a envolvem devem ser realizadas de maneira assíncrona. Para isso, vamos aplicar
  // a API de Observables do pacote rxjs. No arquivo clientes.service.ts, começamos instanciando
  // um objeto “observável”, capaz de gerar eventos, que no Angular recebe o nome Subject.
  private listaClientesAtualizada = new Subject<Cliente[]>();

  // cabe ao serviço de manipulação de clientes fazer as requisições HTTP que
  // envolvem clientes.
  constructor(private httpCliente: HttpClient) {

  }

  /**
   * Cliente Http no método getClientes
   *
   * Nessa função, passamos o pipe para realizar um mapeamento no momento em que pegamos os dados
   * por conta de termos colocado na interface cliente somente 'id' e não '_id' como é no MongoDB
   *
   * Isso pode ser feito utilizando os mecanismos da API de Observables. Uma vez que tenhamos
   * um resultado obtido por meio de um Observable, ele pode passar por uma lista de chamadas de
   * funções (chamadas operadores) que podem realizar transformações arbitrárias. O método que
   * permite esse encadeamento se chama pipe.
   *
   * Precisamos passar para ele uma função (que leva o nome de operador) que será executada uma vez que os dados
   * tenham sido recebidos do servidor. Essa função se chama map.
   * Ela recebe uma função que será responsável por fazer o mapeamento desejado.
   */
   getClientes(): void {
    this.httpCliente.get<{mensagem: string, clientes: any }> ('http://localhost:3000/api/clientes')
      .pipe(map((dados) => {

        /**
         * Os dados recebidos pela função passada como parâmetro para o operador map possuem uma
         * coleção chamada clientes. Desejamos executar os itens desta coleção um a um, explicando que
         * cada um deles deve ter seu campo _id mapeado para um novo campo, chamado id. Isso pode ser
         * feito com a função map, própria de listas Javascript.
        */
        return dados.clientes.map((cliente: { _id: any; nome: any; fone: any; email: any; }) => {
          return {
            id: cliente._id,
            nome: cliente.nome,
            fone: cliente.fone,
            email: cliente.email
          }
        })
      }))
      .subscribe(
        (clientes) => {
          this.clientes = clientes;
          this.listaClientesAtualizada.next([...this.clientes])
        }
      )
  }

  /**
   * Função que retornará o cliente através do ID
  */
  getCliente(idCliente: string) {
    // return {...this.clientes.find((cli) => cli.id === idCliente)}
    return this.httpCliente.get<{
      _id: string,
      nome: string,
      fone: string,
      email: string
    }>(`http://localhost:3000/api/clientes/${idCliente}`);
  }

  // Para permitir que componentes registrem observadores vinculados à lista atualizada do serviço,
  // vamos definir um novo método que devolve um Observable.
  getListaClientesAtualizadaObservable() {
    return this.listaClientesAtualizada.asObservable();
  }

  // (Inserindo clientes a partir da aplicação Angular)
  adicionarCliente(nome:string, fone:string, email: string) {
    const cliente: Cliente = {
      id: '',
      nome,
      fone,
      email
    };

    this.httpCliente.post<{ mensagem: string, id: string }> ('http://localhost:3000/api/clientes', cliente)
    .subscribe(
        (dados) => {
          // utilizamos seu método next cujo funcionamento é análogo ao emit de EventEmitter. Ele simboliza que um evento aconteceu.
          // Assim, objetos observadores (Observable do pacote rxjs) podem reagir quando esse evento acontecer.
          cliente.id = dados.id
          this.clientes.push(cliente)
          this.listaClientesAtualizada.next( [...this.clientes] )
        }
      )
  }

  /**
   * Envio da requisição para remover o cliente
  */
  removerCliente(id: string): void {
    this.httpCliente.delete(`http://localhost:3000/api/clientes/${id}`).subscribe(() => {
      console.log(`Cliente de id: ${id} removido.`);
      /**
       * A coleção exibida pela aplicação Angular não é atualizada após uma remoção. Para que a nova coleção possa ser vista,
       * precisamos clicar em atualizar. Para que essa atualização ocorra automaticamente, iremos atualizar a coleção do serviço
       * de manipulação de clientes (arquivo clientes.service.ts) removendo dela o cliente que já foi removido da base. Depois disso,
       * enviamos uma notificação aos componentes interessados em alterações feitas na lista.
       */

      this.clientes = this.clientes.filter((cli) => {
        return cli.id !== id; // filtramos da lista os clientes que não possuem o id removido
      })

      this.listaClientesAtualizada.next([...this.clientes])
    })
  }

  /**
   * Edição do cliente
  */
 atualizarCliente(id: string, nome: string, fone: string, email: string) {
    const cliente: Cliente = { id, nome, fone, email };
    this.httpCliente.put(`http://localhost:3000/api/clientes/${id}`, cliente)
    .subscribe((res => {
      /**
       * Uma vez que a aplicação Angular receba a resposta do servidor referente a uma atualização
       * feita com sucesso, podemos atualizar a coleção mantida por ela localmente. Veja
      */
      const copia = [...this.clientes];
      const indice = copia.findIndex(cli => cli.id === cliente.id);
      copia[indice] = cliente;

      this.clientes = copia;
      this.listaClientesAtualizada.next([...this.clientes]);
    }));
 }
}
