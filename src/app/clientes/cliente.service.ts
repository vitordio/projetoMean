import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Cliente } from './cliente.model';

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

  adicionarCliente(nome:string, fone:string, email: string) {
    const cliente: Cliente = {
      nome,
      fone,
      email
    };

    // utilizamos seu método next cujo funcionamento é análogo ao emit de EventEmitter. Ele simboliza que um evento aconteceu.
    // Assim, objetos observadores (Observable do pacote rxjs) podem reagir quando esse evento acontecer.
    this.clientes.push(cliente)
    this.listaClientesAtualizada.next( [...this.clientes] )
  }

  getClientes(): Cliente[] {
    return [...this.clientes];
  }

  // Para permitir que componentes registrem observadores vinculados à lista atualizada do serviço,
  // vamos definir um novo método que devolve um Observable.
  getListaClientesAtualizadaObservable() {
    return this.listaClientesAtualizada.asObservable();
  }
}
