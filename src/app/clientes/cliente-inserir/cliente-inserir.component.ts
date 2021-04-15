import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ClienteService } from '../cliente.service'

@Component({
  selector: 'app-cliente-inserir',
  templateUrl: 'cliente-inserir.component.html',
  styleUrls: [
    'client-inserir.component.css'
  ]
})

export class ClienteInserirComponent {
  // Cliente adicionado é um evento
  // Output para ser visivel externamente
  // @Output() clienteAdicionado = new EventEmitter();

  // nome!: string;
  // fone!: string;
  // email!: string;

  constructor( public clienteService: ClienteService ) {}
  onAdicionarCliente(form: NgForm) {

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
    this.clienteService.adicionarCliente(
      form.value.nome,
      form.value.fone,
      form.value.email
    )
  }
}
