import { HashFunctions } from './HashFunctions.js';
import { ListaEncadeadaAutoOrganizavel } from '../models/ListaEncadeada.js';

/**
 * Tabela Hash Aberta (Separate Chaining) com baldes organizados
 * pela heurística MOVE-TO-FRONT (MTF) - Slides 21, 101-104 de EDA2.
 * 
 * Ao buscar uma chave colidida no balde, se encontrada, ela é movida
 * para a cabeça da lista encadeada daquele balde. Em cenários de busca
 * com distribuição assimétrica (como termos de spam / Lei de Zipf),
 * o custo médio de busca converge para O(1).
 */
export class HashMoveToFront {
  /**
   * @param {number} tamanhoInicial - Capacidade inicial M da tabela (primo recomendado)
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

  /**
   * Insere um registro na tabela hash
   * @param {import('../models/TermoProibido.js').TermoProibido} registro 
   */
  inserir(registro) {
    if (!registro || !registro.termo) return false;
    const indice = HashFunctions.hashPrimario(registro.termo, this.tamanho);
    this.tabela[indice].inserir(registro);
    this.totalElementos++;
    return true;
  }

  /**
   * Busca um termo na tabela hash usando a heurística Move-To-Front no balde
   * @param {string} termo 
   * @returns {{ registro: any, comparacoes: number, indiceBucket: number }}
   */
  buscar(termo) {
    const termoNormalizado = termo.toLowerCase().trim();
    const indice = HashFunctions.hashPrimario(termoNormalizado, this.tamanho);
    const resultado = this.tabela[indice].buscarMoveToFront(termoNormalizado);

    this.totalBuscasRealizadas++;
    this.totalComparacoesAcumuladas += resultado.comparacoes;

    return {
      registro: resultado.registro,
      comparacoes: resultado.comparacoes,
      indiceBucket: indice
    };
  }

  /**
   * Remove um termo da tabela hash
   * @param {string} termo 
   * @returns {boolean}
   */
  remover(termo) {
    const termoNormalizado = termo.toLowerCase().trim();
    const indice = HashFunctions.hashPrimario(termoNormalizado, this.tamanho);
    const removido = this.tabela[indice].remover(termoNormalizado);
    if (removido) {
      this.totalElementos--;
    }
    return removido;
  }

  /**
   * Retorna o fator de carga da tabela: alpha = N / M
   * @returns {number}
   */
  obterFatorCarga() {
    return this.totalElementos / this.tamanho;
  }

  /**
   * Custo médio de comparações por busca realizada
   * @returns {number}
   */
  obterCustoMedioComparacoes() {
    if (this.totalBuscasRealizadas === 0) return 0;
    return this.totalComparacoesAcumuladas / this.totalBuscasRealizadas;
  }

  /**
   * Coleta métricas estruturais da tabela hash para fins didáticos e de visualização
   */
  obterEstatisticas() {
    let baldesOcupados = 0;
    let maiorBalde = 0;
    let contagensPorTamanho = {};

    for (let i = 0; i < this.tamanho; i++) {
      const tam = this.tabela[i].tamanho;
      if (tam > 0) {
        baldesOcupados++;
        if (tam > maiorBalde) maiorBalde = tam;
      }
      contagensPorTamanho[tam] = (contagensPorTamanho[tam] || 0) + 1;
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
      custoMedioComparacoes: Number(this.obterCustoMedioComparacoes().toFixed(4)),
      distribuicaoBaldes: contagensPorTamanho
    };
  }

  /**
   * Retorna todos os registros da tabela em um array
   * @returns {any[]}
   */
  obterTodosRegistros() {
    const todos = [];
    for (let i = 0; i < this.tamanho; i++) {
      todos.push(...this.tabela[i].paraArray());
    }
    return todos;
  }
}
