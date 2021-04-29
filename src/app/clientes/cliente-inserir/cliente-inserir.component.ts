import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';

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
import { mimeTypeValidator } from './mime-type.validador';

@Component({
  selector: 'app-cliente-inserir',
  templateUrl: 'cliente-inserir.component.html',
  styleUrls: [
    'client-inserir.component.css'
  ]
})

export class ClienteInserirComponent  implements OnInit {
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

  public cliente!: Cliente;

  // Variável utilizada para exibição do loading de carregamento
  public estaCarregando: boolean = false;

  // Variável para exibição da preview da imagem
  public previewImage: string | undefined;

  /**
   * Agora precisamos alterar a forma como o form é criado. A estrutura que o modela será criada
   * com código Typescript. Para isso, declaramos um formGroup.
   * Trata-se de um objeto que agrupa todos os controles de um form.
   */
  form!: FormGroup;

  ngOnInit() {
    /**
     * A seguir, usando o método ngOnInit, vamos construir o objeto FormGroup. Ele recebe um
     * objeto JSON com pares chave/valor quer descrevem seus controles (os controles de um form são
     * os elementos que o usuário pode usar para inserir alguma coisa, como texto, imagem etc). Cada
     * valor é do tipo FormControl, que também precisa ser importado de @angular/forms.
     *
     * FormControl recebe:
     * -valor inicial para o campo que representa
     * - objeto JSON que contém, entre outras coisas, validadores cujo funcionamento podemos especificar.
     */


    this.form = new FormGroup({
      nome: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(4)]
      }),
      fone: new FormControl(null, {
        validators: [Validators.required]
      }),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email]
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeTypeValidator]
      })
    })

    /**
     * Verificamos se o parametro do ID cliente existe, sendo então, uma edição
     */
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('idCliente'))
      {
        this.action = "editar";
        // @ts-ignore
        this.idCliente = paramMap.get('idCliente');
        this.estaCarregando = true;
        this.clienteService.getCliente(this.idCliente).subscribe(dadosCli => {
          this.estaCarregando = false;
          this.cliente = {
            id: dadosCli._id,
            nome: dadosCli.nome,
            fone: dadosCli.fone,
            email: dadosCli.email,
            imageUrl: dadosCli.imageUrl
          };

          /**
           * O valor inicial igual a null para cada campo somente é válido caso não existam valores a serem
           * exibidos neles. Quando o usuário está atualizando um cliente, ele já possui dados. Podemos
           * atualizar os valores de cada campo usando o método setValue.
          */
          this.form.setValue({
            nome: this.cliente.nome,
            fone: this.cliente.fone,
            email: this.cliente.email,
            image: this.cliente.imageUrl
          })

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
  onSalvarCliente() {
    // Valida se o o formulário está válido
    if(this.form.invalid) return;

    this.estaCarregando = true;

    // chamamos o adicionar cliente do service
    if(this.action === "criar")
    {
      this.clienteService.adicionarCliente(
        this.form.value.nome,
        this.form.value.fone,
        this.form.value.email,
        this.form.value.image
      )
    } else {
      this.clienteService.atualizarCliente(
        this.idCliente,
        this.form.value.nome,
        this.form.value.fone,
        this.form.value.email,
        this.form.value.image
      )
    }

    // Limpa o formulário
    this.form.reset();
  }

  // Recebe a imagem selecionada pelo Usuário
  onImageSelecionada(event: Event)
  {
    // Verificamos se o arquivo está vindo nulo em 'files!'
    const arquivo = (event.target as HTMLInputElement).files![0];
    /**
     * O método patchValue recebe um objeto JSON em que as chaves são os nomes dos controles e os
     * valores associados são as expressões a serem vinculadas aos controles. A seguir, utilizamos o
     * método updateValueAndValidity para que o form seja atualizado e as validações sejam
     * realizadas. Exiba o arquivo e o form no console para entender o que aconteceu.
     */
    this.form.patchValue({ 'image': arquivo })
    this.form.get('image')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    }

    reader.readAsDataURL(arquivo);
  }
}
