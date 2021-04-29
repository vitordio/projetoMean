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

  /**
   *
   * Quando uma busca pela lista de clientes termina, o serviço se encarrega de notificar os seus
   * observadores - os componentes Angular interessados na lista. No momento, a notificação
   * envolve somente a lista. Contudo, a quantidade de clientes existentes na base também é de
   * interesse.
   *
   * Assim, precisamos alterar o tipo com o qual o Subject lida, que passará a ser um objeto
   * JSON que contém a lista de clientes e o número de clientes como suas propriedades.
   */
  private listaClientesAtualizada = new Subject<{ clientes: Cliente[], maxClientes: number } >();

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
   getClientes(pageSize: number, page:number): void {
    const params = `?pageSize=${pageSize}&page=${page}`;
    this.httpCliente.get<{mensagem: string, clientes: any, maxClientes: number }> (`http://localhost:3000/api/clientes${params}`)
      .pipe(map((dados) => {

        /**
         * dados representa aquilo que o Back End entrega para o Front End.
         * Ou seja, um objeto JSON contendo uma mensagem, uma lista de clientes e, agora, o número de clientes.
         *
         * Lembre-se que utilizamos a função map para explicar que, dado um objeto desse tipo, desejamos extrair somente a coleção de clientes, que
         * deve ser o resultado do método. Contudo, agora também desejamos que o número de clientes
         * faça parte do resultado do método. Para isso, basta ajustar o mapeamento: o objeto resultante
         * deixa de ser uma única lista de clientes e passa a ser um objeto JSON que contém a lista de
         * clientes e, ainda, o número de clientes.
         */

        return {
          clientes: dados.clientes.map((cliente: { _id: any; nome: any; fone: any; email: any; imageUrl: any; }) => {
            return {
              id: cliente._id,
              nome: cliente.nome,
              fone: cliente.fone,
              email: cliente.email,
              imageUrl: cliente.imageUrl
            }
          }),
          maxClientes: dados.maxClientes
        }
      }))
      .subscribe(
        (dados) => {
          this.clientes = dados.clientes;
          this.listaClientesAtualizada.next({
            clientes: [...this.clientes],
            maxClientes: dados.maxClientes
          })
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
          this.router.navigate(['/']);
        }
      )
  }

  /**
   * Envio da requisição para remover o cliente
  */
  removerCliente (id: string){
    return this.httpCliente.delete(`http://localhost:3000/api/clientes/${id}`);
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
      this.router.navigate(['/']);
    }));
 }
}
