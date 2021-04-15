// import { Component, OnInit, Input } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Cliente } from '../cliente.model';
import { ClienteService } from '../cliente.service'

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
  private clientesSubscription: Subscription = new Subscription;

  // Injetamos uma instância do serviço no componente responsável por exibir os clientes,
  constructor(public clienteService: ClienteService) {}

  // Feita a injeção de dependência, o componente já pode utilizar a lista que o serviço oferece. Para
  // isso, usaremos o método ngOnInit da interface OnInit que precisa ser implementada pela
  // classe. Ele executa automaticamente assim que o componente é construído.
  ngOnInit(): void {
    this.clientes = this.clienteService.getClientes()

  // Os componentes interessados em obter uma cópia da lista toda vez que ela for atualizada utilizarão este
  // método para obter o objeto Observable e, a seguir, chamar o método subscribe sobre ele.

  // Ele permite que especifiquemos duas funções:
  // A primeira executa quando a notificação ocorrer com sucesso. A segunda somente executa caso ocorra algum erro.
  // No momento utilizaremos somente a primeira.
    this.clientesSubscription = this.clienteService
    .getListaClientesAtualizadaObservable()
    .subscribe((clientes: Cliente[]) => {
      this.clientes = clientes;
    })
  }

  // Com o objeto Subscription em mãos, podemos remover o registro quando o componente for
  // destruído. Para isso, vamos fazer com que a classe ClienteListaComponent implemente a
  // interface OnDestroy. Ela define um método chamado ngOnDestroy que entra em execução
  // automaticamente quando o componente é destruído.
  ngOnDestroy(): void {
    this.clientesSubscription.unsubscribe();
  }
}
