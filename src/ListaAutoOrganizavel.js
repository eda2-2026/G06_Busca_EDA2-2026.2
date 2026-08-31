class Node {
    constructor(contato, proximo = null) {
        this.contato = contato;
        this.proximo = proximo;
    }
}

export class ListaAutoOrganizavel {
    constructor() {
        this.cabeca = null;
    }

    inserir(contato) {
        this.cabeca = new Node(contato, this.cabeca);
    }

    // 1. Busca Tradicional (Slide 18 do PDF)
    buscarPadrao(nome) {
        let comparacoes = 0;
        let atual = this.cabeca;

        while (atual !== null) {
            comparacoes++;
            if (atual.contato.nome.toLowerCase() === nome.toLowerCase()) {
                return { contato: atual.contato, comparacoes };
            }
            atual = atual.proximo;
        }
        return { contato: null, comparacoes };
    }

    // 2. Busca Move-to-Front (Slide 21 do PDF: move o achado para o início)
    buscarMoveToFront(nome) {
        let comparacoes = 0;
        let atual = this.cabeca;
        let anterior = null;

        while (atual !== null) {
            comparacoes++;
            if (atual.contato.nome.toLowerCase() === nome.toLowerCase()) {
                // Se encontrou e não é a cabeça, move para a cabeça
                if (anterior !== null) {
                    anterior.proximo = atual.proximo;
                    atual.proximo = this.cabeca;
                    this.cabeca = atual;
                }
                return { contato: atual.contato, comparacoes };
            }
            anterior = atual;
            atual = atual.proximo;
        }
        return { contato: null, comparacoes };
    }

    obterOrdemNomes() {
        let atual = this.cabeca;
        const nomes = [];
        while (atual) {
            nomes.push(atual.contato.nome.split(" ")[0]);
            atual = atual.proximo;
        }
        return nomes.join(" -> ");
    }
}