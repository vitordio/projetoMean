import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Cliente } from './cliente.model';
import { HttpClient } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';

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

  // (Inserindo clientes a partir da aplicação Angular)
  adicionarCliente(nome:string, fone:string, email: string) {
    const cliente: Cliente = {
      nome,
      fone,
      email
    };

    this.httpCliente.post<{mensagem: string}> ('http://localhost:3000/api/clientes', cliente)
    .subscribe(
        (dados) => {
          console.log(dados.mensagem);
          // utilizamos seu método next cujo funcionamento é análogo ao emit de EventEmitter. Ele simboliza que um evento aconteceu.
          // Assim, objetos observadores (Observable do pacote rxjs) podem reagir quando esse evento acontecer.
          this.clientes.push(cliente)
          this.listaClientesAtualizada.next( [...this.clientes] )

        }
      )
  }

  // cliente Http no método getClientes
  getClientes(): void {
    this.httpCliente.get<{mensagem: string, clientes: Cliente[]}>
      ('http://localhost:3000/api/clientes')
      .subscribe(
        (dados) => {
          this.clientes = dados.clientes;
          this.listaClientesAtualizada.next([...this.clientes])
        }
      )
  }

  // Para permitir que componentes registrem observadores vinculados à lista atualizada do serviço,
  // vamos definir um novo método que devolve um Observable.
  getListaClientesAtualizadaObservable() {
    return this.listaClientesAtualizada.asObservable();
  }
}
