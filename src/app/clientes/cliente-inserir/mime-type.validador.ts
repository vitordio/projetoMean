/**
 * Validador para o tipo de arquivo permitido
 *
 * Vamos escrever uma função que devolve um validador assíncrono, com as seguintes características.
 * - Recebe como argumento um do tipo AbstractControl. Ele representa o controle de um form a ser validado.
 * - Por operar de maneira assíncrona, devolve uma Promise ou um Observable. Seu tipo genérico é um JSON
 * com uma lista de tipo any, com uma chave do tipo string (que ficará mais claro em breve).
 * - Extrai o arquivo do controle.
 * - Constrói um leitor de arquivos.
 * - Constrói um objeto Observable que recebe uma arrow function. Ela recebe um Observer cujo
 * tipo genérico é igual ao do Observable e da Promise.
 * - A função registra uma função que entra em execução uma vez que o evento loadend do leitor acontecer.
 * - Executa readAsArrayBuffer para fazer com que a leitura aconteça. O arquivo será colocado em memória como uma sequência de bytes.
 * - Uma vez que o evento aconteça, os dados serão colocados em um vetor de inteiros de 8 bits “unsigned”. Ou seja, um vetor de bytes.
 * - O MIME type se encontra nos primeiros quatro bytes. Por isso, usamos subarray com os índices 0 e 4.
 * - Para fazer a validação, iteramos sobre o vetor, convertendo cada posição para uma string em hexadecimal.
 * - Se o tipo for válido, devolvemos null. Caso contrário, devolvemos um objeto JSON com uma chave (com nome arbitrário,
 * porém de acordo com o significado da validação) associada ao valor true.
 */

import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeTypeValidator = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {

  if(typeof(control.value) === 'string')
    // @ts-ignore
    return of(null);

  const arquivo = control.value as File;
  const leitor = new FileReader();

  const observable = new Observable(
    (observer: Observer<{ [key: string]: any }>) => {
      leitor.addEventListener('loadend', () => {
        const bytes = new Uint8Array(leitor.result as ArrayBuffer).subarray(
          0,
          4
        );

        let valido = false;
        let header = '';

        for (let i = 0; i < bytes.length; i++) {
          header += bytes[i].toString(16);
        }

        switch (header)
        {
          case '89504e47':
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            valido = true;
            break;
          default:
            valido = false;
        }

        // @ts-ignore
        observer.next(valido ? null : { mimeTypeInvalido: true });
        observer.complete();
      });

      leitor.readAsArrayBuffer(arquivo);
    }
  );

  return observable;
};
