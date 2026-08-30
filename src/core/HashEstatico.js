import { HashFunctions } from './HashFunctions.js';
import { ListaEncadeadaAutoOrganizavel } from '../models/ListaEncadeada.js';

/**
 * Tabela Hash Aberta Estática (Separate Chaining Tradicional)
 * Utilizada como linha de base (baseline) para mensurar o ganho
 * das heurísticas Move-To-Front e Transposição.
 */
export class HashEstatico {
  /**
   * @param {number} tamanhoInicial - Capacidade inicial M da tabela
   */
  constructor(tamanhoInicial = 101) {
    this.tamanho = HashFunctions.proximoPrimo(tamanhoInicial);
    this.totalElementos = 0;
    this.totalComparacoesAcumuladas = 0;
    this.totalBuscasRealizadas = 0;
    this.tabela = new Array(this.tamanho);

    for (let i = 0; i < this.tamanho; i++) {
      this.tabela[i] = new ListaEncadeadaAutoOrganizavel();
    }
  }

  inserir(registro) {
    if (!registro || !registro.termo) return false;
    const indice = HashFunctions.hashPrimario(registro.termo, this.tamanho);
    this.tabela[indice].inserir(registro);
    this.totalElementos++;
    return true;
  }

  buscar(termo) {
    const termoNormalizado = termo.toLowerCase().trim();
    const indice = HashFunctions.hashPrimario(termoNormalizado, this.tamanho);
    const resultado = this.tabela[indice].buscarEstatica(termoNormalizado);

    this.totalBuscasRealizadas++;
    this.totalComparacoesAcumuladas += resultado.comparacoes;

    return {
      registro: resultado.registro,
      comparacoes: resultado.comparacoes,
      indiceBucket: indice
    };
  }

  remover(termo) {
    const termoNormalizado = termo.toLowerCase().trim();
    const indice = HashFunctions.hashPrimario(termoNormalizado, this.tamanho);
    const removido = this.tabela[indice].remover(termoNormalizado);
    if (removido) {
      this.totalElementos--;
    }
    return removido;
  }

  obterFatorCarga() {
    return this.totalElementos / this.tamanho;
  }

  obterCustoMedioComparacoes() {
    if (this.totalBuscasRealizadas === 0) return 0;
    return this.totalComparacoesAcumuladas / this.totalBuscasRealizadas;
  }

  obterEstatisticas() {
    let baldesOcupados = 0;
    let maiorBalde = 0;

    for (let i = 0; i < this.tamanho; i++) {
      const tam = this.tabela[i].tamanho;
      if (tam > 0) {
        baldesOcupados++;
        if (tam > maiorBalde) maiorBalde = tam;
      }
    }

    return {
      tamanhoTabela: this.tamanho,
      totalElementos: this.totalElementos,
      fatorCarga: Number(this.obterFatorCarga().toFixed(4)),
      baldesOcupados,
      taxaOcupacao: Number(((baldesOcupados / this.tamanho) * 100).toFixed(2)),
      maiorBalde,
      totalBuscas: this.totalBuscasRealizadas,
      comparacoesTotais: this.totalComparacoesAcumuladas,
      custoMedioComparacoes: Number(this.obterCustoMedioComparacoes().toFixed(4))
    };
  }

  obterTodosRegistros() {
    const todos = [];
    for (let i = 0; i < this.tamanho; i++) {
      todos.push(...this.tabela[i].paraArray());
    }
    return todos;
  }
}
