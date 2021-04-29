import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Cliente } from './cliente.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

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
  constructor(private httpCliente: HttpClient, private router: Router) {

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
        return dados.clientes.map((cliente: { _id: any; nome: any; fone: any; email: any; imageUrl: any; }) => {
          return {
            id: cliente._id,
            nome: cliente.nome,
            fone: cliente.fone,
            email: cliente.email,
            imageUrl: cliente.imageUrl
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
    return this.httpCliente.get<{
      _id: string,
      nome: string,
      fone: string,
      email: string,
      imageUrl: string
    }>(`http://localhost:3000/api/clientes/${idCliente}`);
  }

  // Para permitir que componentes registrem observadores vinculados à lista atualizada do serviço,
  // vamos definir um novo método que devolve um Observable.
  getListaClientesAtualizadaObservable() {
    return this.listaClientesAtualizada.asObservable();
  }

  /**
   * Inserindo clientes
   * @param nome
   * @param fone
   * @param email
   * @param image
   */
  adicionarCliente(nome:string, fone:string, email: string, image: File) {
    // Deixaremos de enviar o objeto cliente ao servidor, e enviamos um FormData
    const dadosCliente = new FormData();
    dadosCliente.append('nome', nome);
    dadosCliente.append('fone', fone);
    dadosCliente.append('email', email);
    dadosCliente.append('image', image);

    this.httpCliente.post<{ mensagem: string, cliente: Cliente }> ('http://localhost:3000/api/clientes', dadosCliente)
    .subscribe(
        (dados) => {
          // utilizamos seu método next cujo funcionamento é análogo ao emit de EventEmitter. Ele simboliza que um evento aconteceu.
          // Assim, objetos observadores (Observable do pacote rxjs) podem reagir quando esse evento acontecer.
          const cliente: Cliente = {
            id: dados.cliente.id,
            nome: nome,
            fone: fone,
            email: email,
            imageUrl: dados.cliente.imageUrl
          };

          this.clientes.push(cliente)
          this.listaClientesAtualizada.next( [...this.clientes] )

          /**
           * vamos usar o método navigate do roteador para levar o usuário para a
           * página que desejamos.
           *
           * Ele recebe um vetor de parâmetros. Utilizaremos somente um elemento
           * no vetor, indicando que o usuário deve ser levado para a raiz da aplicação.
           * Ela está mapeada para o componente de listagem, por isso ele será renderizado no router-outlet.
          */
          this.router.navigate(['/']);
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
   *
  */
 atualizarCliente(id: string, nome: string, fone: string, email: string, image: File | string) {
    // const cliente: Cliente = { id, nome, fone, email, imageUrl: '' };

    /**
     * O método atualizarCliente precisa decidir a forma como enviará os dados para o Back End.
     *
     * Isso dependerá do tipo do parâmetro imagem. Se ele for um arquivo, é preciso construir um
     * objeto do tipo FormData. Caso contrário, enviamos um objeto JSON comum.
     *
     * Note que esperamos obter, como parte da resposta, a URL da imagem, a qual ainda precisa ser tratada.
    */
    let clienteData: Cliente | FormData;

    if(typeof(image) === 'object')
    {
      clienteData = new FormData();
      clienteData.append('nome', nome);
      clienteData.append('fone', fone);
      clienteData.append('email', email);
      clienteData.append('image', image, nome);//chave, foto e nome para o arquivo
    } else {
      // envio do JSON comum
      clienteData = {
        id: id,
        nome: nome,
        fone: fone,
        email: email,
        imageUrl: image
      }
    }

    this.httpCliente.put(`http://localhost:3000/api/clientes/${id}`, clienteData)
    .subscribe((res => {
      /**
       * Uma vez que a aplicação Angular receba a resposta do servidor referente a uma atualização
       * feita com sucesso, podemos atualizar a coleção mantida por ela localmente. Veja
      */
      const copia = [...this.clientes];
      const indice = copia.findIndex(cli => cli.id === id);

      const cliente: Cliente = {
        id,
        nome,
        email,
        fone,
        imageUrl: ""
      }

      copia[indice] = cliente;
      this.clientes = copia;
      this.listaClientesAtualizada.next([...this.clientes]);

      /**
       * vamos usar o método navigate do roteador para levar o usuário para a
       * página que desejamos.
       *
       * Ele recebe um vetor de parâmetros. Utilizaremos somente um elemento
       * no vetor, indicando que o usuário deve ser levado para a raiz da aplicação.
       * Ela está mapeada para o componente de listagem, por isso ele será renderizado no router-outlet.
      */
      this.router.navigate(['/']);
    }));
 }
}
