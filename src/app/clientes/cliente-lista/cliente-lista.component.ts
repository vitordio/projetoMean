// import { Component, OnInit, Input } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Cliente } from '../cliente.model';
import { ClienteService } from '../cliente.service';

// Utilizaremos o Subscription para remover o registro do Observable quando o componente for destruído
import { Subscription, Observable } from 'rxjs';

import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-cliente-lista',
  templateUrl: './cliente-lista.component.html',
  styleUrls: ['./cliente-lista.component.css'],
})

export class ClienteListaComponent implements OnInit {
  // @Input() clientes: Cliente[] = [];
  clientes: Cliente[] = [];
  private clientesSubscription: Subscription = new Subscription();

  // Variável utilizada para exibição do loading de carregamento
  public estaCarregando: boolean = false;

  // Injetamos uma instância do serviço no componente responsável por exibir os clientes,
  constructor(public clienteService: ClienteService) {}

  totalDeClientes: number = 0;
  totalDeClientesPorPagina: number = 2;
  opcoesTotalDeClientesPorPagina = [2, 5, 10];
  paginaAtual: number = 1

  // Alteramos a chamada do método pois ele não devolve mais uma lista de clientes
  // Apenas chamamos o método para que a lista seja atualizada
  //  Registramos como observador da lista de clientes do serviço, assim que ela for atualizada ele será avisado.
  ngOnInit(): void {
    this.estaCarregando = true;
    this.clienteService.getClientes(this.totalDeClientesPorPagina, this.paginaAtual);
    this.clientesSubscription = this.clienteService
      .getListaClientesAtualizadaObservable()
      // @ts-ignore
      .subscribe((dados: { clientes: [], maxClientes: number}) => {
        this.estaCarregando = false;
        this.clientes = dados.clientes;
        this.totalDeClientes = dados.maxClientes

      })
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
    this.estaCarregando = true;

    this.clienteService.removerCliente(id).subscribe(() => {
      this.clienteService.getClientes(this.totalDeClientesPorPagina, this.paginaAtual)
    });
  }

  /**
   * Função chamada na alteração da página
   *
   * Quando o paginator sofre alterações, precisamos realizar nova busca no Back End para
   * atualizar os dados adequadamente. O método onPaginaAlterada entra em execução toda vez
   * que um evento acontece. Neste momento podemos chamar o método getClientes novamente
   * especificando os valores adequadamente.
  */
  onPaginaAlterada(dadosPagina: PageEvent) {
    this.estaCarregando = true;

    this.paginaAtual = dadosPagina.pageIndex + 1; // no paginator a contagem começa de 0
    this.totalDeClientesPorPagina = dadosPagina.pageSize;

    this.clienteService.getClientes(this.totalDeClientesPorPagina, this.paginaAtual)

  }

}
