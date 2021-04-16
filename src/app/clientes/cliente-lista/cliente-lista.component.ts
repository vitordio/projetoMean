// import { Component, OnInit, Input } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Cliente } from '../cliente.model';
import { ClienteService } from '../cliente.service';

// Utilizaremos o Subscription para remover o registro do Observable quando o componente for destruído
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-cliente-lista',
  templateUrl: './cliente-lista.component.html',
  styleUrls: ['./cliente-lista.component.css'],
})

export class ClienteListaComponent implements OnInit {
  // @Input() clientes: Cliente[] = [];
  clientes: Cliente[] = [];
  private clientesSubscription: Subscription = new Subscription();

  // Injetamos uma instância do serviço no componente responsável por exibir os clientes,
  constructor(public clienteService: ClienteService) {}

  // Alteramos a chamada do método pois ele não devolve mais uma lista de clientes
  // Apenas chamamos o método para que a lista seja atualizada
  //  Registramos como observador da lista de clientes do serviço, assim que ela for atualizada ele será avisado.
  ngOnInit(): void {
    this.clienteService.getClientes();
    this.clientesSubscription = this.clienteService
      .getListaClientesAtualizadaObservable()
      .subscribe((clientes: Cliente[]) => {
        this.clientes = clientes;
      });
  }

  // Com o objeto Subscription em mãos, podemos remover o registro quando o componente for
  // destruído. Para isso, vamos fazer com que a classe ClienteListaComponent implemente a
  // interface OnDestroy. Ela define um método chamado ngOnDestroy que entra em execução
  // automaticamente quando o componente é destruído.
  ngOnDestroy(): void {
    this.clientesSubscription.unsubscribe();
  }

  /**
   * Ela recebe o id e interage com o serviço de manipulação de clientes,
   * solicitando que ele faça a requisição HTTP.
   *
   * Chamamos a função na cliente.service para realizar a chamada
  */
  onDelete(id: string): void {
    this.clienteService.removerCliente(id);
  }

}
