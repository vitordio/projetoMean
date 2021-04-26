import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Cliente } from '../cliente.model';
import { ClienteService } from '../cliente.service';

/**
 * Como estamos utilizando o mesmo componente para inserção e para atualização de clientes,
 * precisamos de algum modo diferenciar qual operação está sendo utilizada. Para isso, vamos
 * injetar no construtor do componente de inserção de cliente (arquivo cliente-
 * inserir.component.ts) um objeto do tipo ActivatedRoute.
 *
 * Ele representa a rota que foi utilizada para que o componente fosse renderizado e,
 * entre outras coisas, permite a obtenção dos parâmetros incluídos nela dinamicamente, caso eles existam.
 */
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-cliente-inserir',
  templateUrl: 'cliente-inserir.component.html',
  styleUrls: [
    'client-inserir.component.css'
  ]
})

export class ClienteInserirComponent  implements OnInit {
  // Cliente adicionado é um evento
  // Output para ser visivel externamente
  // @Output() clienteAdicionado = new EventEmitter();

  // nome!: string;
  // fone!: string;
  // email!: string;


  /**
   * Segundo o ciclo de vida de componentes Angular, o método ngOnInit da interface OnInit é
   * executado automaticamente uma vez que um componente tenha sido instanciado pelo Angular.
   *
   * Vamos utilizá-lo para extrair informações da rota que foi injetada pelo Angular no construtor.
   *
   * Criamos uma variável para verificar a ação e uma variável para o ID do cliente do parametro
   */
  private action: string = "criar"

  // @ts-ignore
  private idCliente: string;
  // @ts-ignore
  public cliente: Cliente;

  ngOnInit() {
    /**
     * Verificamos se o parametro do ID cliente existe, sendo então, uma edição
     */
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('idCliente'))
      {
        this.action = "editar";
        // @ts-ignore
        this.idCliente = paramMap.get('idCliente');
        this.clienteService.getCliente(this.idCliente).subscribe(dadosCli => {
          this.cliente = {
            id: dadosCli._id,
            nome: dadosCli.nome,
            fone: dadosCli.fone,
            email: dadosCli.email
          };
        })
      } else
      {
        this.action = "criar";
        // @ts-ignore
        this.idCliente = null;
      }

    })
  }

  constructor( public clienteService: ClienteService, public route: ActivatedRoute ) {}
  onSalvarCliente(form: NgForm) {

    // const cliente: Cliente = {
    //   nome: form.value.nome,
    //   fone: form.value.fone,
    //   email: form.value.email,
    // };

    // console.log(cliente);

    // // Emitimos o evento
    // this.clienteAdicionado.emit(cliente);

    // Valida se o o formulário está válido
    if(form.invalid) return;

    // chamamos o adicionar cliente do service
    if(this.action === "criar")
    {
      this.clienteService.adicionarCliente(
        form.value.nome,
        form.value.fone,
        form.value.email
      )
    } else {
      this.clienteService.atualizarCliente(
        this.idCliente,
        form.value.nome,
        form.value.fone,
        form.value.email
      )
    }

    // Limpa o formulário
    form.resetForm();
  }
}
