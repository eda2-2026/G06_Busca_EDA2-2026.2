/**
 * Nó para a Lista Encadeada Simples
 */
export class Node {
  constructor(dado, proximo = null) {
    this.dado = dado;
    this.proximo = proximo;
  }
}

/**
 * Lista Encadeada com suporte a heurísticas de auto-organização:
 * 1. Move-to-Front (MTF) - Move o elemento acessado para a cabeça da lista.
 * 2. Transposição - Troca o elemento acessado com seu antecessor imediato.
 * 3. Busca Padrão (Estática) - Não altera a ordem dos nós (para comparações).
 */
export class ListaEncadeadaAutoOrganizavel {
  constructor() {
    this.cabeca = null;
    this.tamanho = 0;
  }

  /**
   * Insere um novo elemento no início da lista (O(1))
   * @param {any} dado 
   */
  inserir(dado) {
    this.cabeca = new Node(dado, this.cabeca);
    this.tamanho++;
  }

  /**
   * Remove um elemento pelo termo
   * @param {string} termo 
   * @returns {boolean}
   */
  remover(termo) {
    let atual = this.cabeca;
    let anterior = null;

    while (atual !== null) {
      if (atual.dado.termo === termo) {
        if (anterior === null) {
          this.cabeca = atual.proximo;
        } else {
          anterior.proximo = atual.proximo;
        }
        this.tamanho--;
        return true;
      }
      anterior = atual;
      atual = atual.proximo;
    }
    return false;
  }

  /**
   * Busca com estratégia MOVE-TO-FRONT (MTF)
   * Se o item for encontrado, é movido imediatamente para o início da lista.
   * @param {string} termo
   * @returns {{ registro: any, comparacoes: number }}
   */
  buscarMoveToFront(termo) {
    let comparacoes = 0;
    let atual = this.cabeca;
    let anterior = null;

    while (atual !== null) {
      comparacoes++;
      if (atual.dado.termo === termo) {
        if (typeof atual.dado.registrarOcorrencia === 'function') {
          atual.dado.registrarOcorrencia();
        } else if (typeof atual.dado.vezesDetectado === 'number') {
          atual.dado.vezesDetectado++;
        }

        // Se não estiver na cabeça, move para a cabeça
        if (anterior !== null) {
          anterior.proximo = atual.proximo;
          atual.proximo = this.cabeca;
          this.cabeca = atual;
        }
        return { registro: atual.dado, comparacoes };
      }
      anterior = atual;
      atual = atual.proximo;
    }

    return { registro: null, comparacoes };
  }

  /**
   * Busca com estratégia de TRANSPOSIÇÃO
   * Se o item for encontrado, troca de posição com o nó imediatamente anterior.
   * @param {string} termo
   * @returns {{ registro: any, comparacoes: number }}
   */
  buscarTransposicao(termo) {
    let comparacoes = 0;
    let atual = this.cabeca;
    let anterior = null;
    let antesDoAnterior = null;

    while (atual !== null) {
      comparacoes++;
      if (atual.dado.termo === termo) {
        if (typeof atual.dado.registrarOcorrencia === 'function') {
          atual.dado.registrarOcorrencia();
        } else if (typeof atual.dado.vezesDetectado === 'number') {
          atual.dado.vezesDetectado++;
        }

        // Se não estiver na cabeça, troca com o anterior
        if (anterior !== null) {
          anterior.proximo = atual.proximo;
          atual.proximo = anterior;
          if (antesDoAnterior === null) {
            this.cabeca = atual;
          } else {
            antesDoAnterior.proximo = atual;
          }
        }
        return { registro: atual.dado, comparacoes };
      }
      antesDoAnterior = anterior;
      anterior = atual;
      atual = atual.proximo;
    }

    return { registro: null, comparacoes };
  }

  /**
   * Busca Estática Padrão (Sem reorganização)
   * @param {string} termo
   * @returns {{ registro: any, comparacoes: number }}
   */
  buscarEstatica(termo) {
    let comparacoes = 0;
    let atual = this.cabeca;

    while (atual !== null) {
      comparacoes++;
      if (atual.dado.termo === termo) {
        if (typeof atual.dado.registrarOcorrencia === 'function') {
          atual.dado.registrarOcorrencia();
        } else if (typeof atual.dado.vezesDetectado === 'number') {
          atual.dado.vezesDetectado++;
        }
        return { registro: atual.dado, comparacoes };
      }
      atual = atual.proximo;
    }

    return { registro: null, comparacoes };
  }

  /**
   * Retorna os elementos da lista como um array
   * @returns {any[]}
   */
  paraArray() {
    const itens = [];
    let atual = this.cabeca;
    while (atual !== null) {
      itens.push(atual.dado);
      atual = atual.proximo;
    }
    return itens;
  }
}