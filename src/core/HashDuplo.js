import { HashFunctions } from './HashFunctions.js';

const DELETED = Symbol('DELETED');

/**
 * Tabela Hash Fechada (Endereçamento Aberto) com Resolução de Colisões por HASH DUPLO
 * (Slides 97-98 de EDA2).
 * 
 * Sequência de Sondagem:
 * pos(k, i) = (h1(k) + i * h2(k)) mod M
 * 
 * Onde:
 * - h1(k) é o hash polinomial primário
 * - h2(k) é o hash secundário com h2(k) >= 1 e MDC(h2(k), M) = 1
 * - O Hashing Duplo elimina tanto o agrupamento primário (linear probing)
 *   quanto o secundário (quadratic probing), proporcionando excelente dispersão.
 */
export class HashDuplo {
  /**
   * @param {number} tamanhoInicial - Capacidade inicial M (primo)
   * @param {number} fatorCargaMaximo - Limite para rehash (padrão 0.7)
   */
  constructor(tamanhoInicial = 101, fatorCargaMaximo = 0.7) {
    this.tamanho = HashFunctions.proximoPrimo(tamanhoInicial);
    this.fatorCargaMaximo = fatorCargaMaximo;
    this.totalElementos = 0;
    this.totalTombstones = 0;
    this.totalComparacoesAcumuladas = 0;
    this.totalBuscasRealizadas = 0;
    this.tabela = new Array(this.tamanho).fill(null);
  }

  /**
   * Insere um registro na tabela hash usando rehash duplo
   * @param {import('../models/TermoProibido.js').TermoProibido} registro 
   * @returns {boolean}
   */
  inserir(registro) {
    if (!registro || !registro.termo) return false;

    // Se atingir o fator de carga limite, redimensiona
    if ((this.totalElementos + this.totalTombstones + 1) / this.tamanho >= this.fatorCargaMaximo) {
      this._redimensionar(this.tamanho * 2);
    }

    const termo = registro.termo.toLowerCase().trim();
    const h1 = HashFunctions.hashPrimario(termo, this.tamanho);
    const h2 = HashFunctions.hashSecundario(termo, this.tamanho);

    let primeiroSlotDisponivel = -1;

    for (let i = 0; i < this.tamanho; i++) {
      const pos = (h1 + i * h2) % this.tamanho;
      const slot = this.tabela[pos];

      if (slot === null) {
        const destino = primeiroSlotDisponivel !== -1 ? primeiroSlotDisponivel : pos;
        if (destino === primeiroSlotDisponivel) {
          this.totalTombstones--;
        }
        this.tabela[destino] = registro;
        this.totalElementos++;
        return true;
      }

      if (slot === DELETED) {
        if (primeiroSlotDisponivel === -1) {
          primeiroSlotDisponivel = pos;
        }
      } else if (slot.termo === termo) {
        // Chave já existe, substitui / atualiza
        this.tabela[pos] = registro;
        return true;
      }
    }

    // Se encontrou um slot DELETED antes de varrer toda a tabela
    if (primeiroSlotDisponivel !== -1) {
      this.tabela[primeiroSlotDisponivel] = registro;
      this.totalTombstones--;
      this.totalElementos++;
      return true;
    }

    // Tabela completamente cheia (não deve ocorrer com resize)
    return false;
  }

  /**
   * Busca um termo usando a sequência de sondagem dupla
   * @param {string} termo 
   * @returns {{ registro: any, comparacoes: number, indiceSlot: number }}
   */
  buscar(termo) {
    const termoNormalizado = termo.toLowerCase().trim();
    const h1 = HashFunctions.hashPrimario(termoNormalizado, this.tamanho);
    const h2 = HashFunctions.hashSecundario(termoNormalizado, this.tamanho);

    let comparacoes = 0;

    for (let i = 0; i < this.tamanho; i++) {
      comparacoes++;
      const pos = (h1 + i * h2) % this.tamanho;
      const slot = this.tabela[pos];

      if (slot === null) {
        break; // Não encontrado
      }

      if (slot !== DELETED && slot.termo === termoNormalizado) {
        if (typeof slot.registrarOcorrencia === 'function') {
          slot.registrarOcorrencia();
        } else if (typeof slot.vezesDetectado === 'number') {
          slot.vezesDetectado++;
        }

        this.totalBuscasRealizadas++;
        this.totalComparacoesAcumuladas += comparacoes;

        return {
          registro: slot,
          comparacoes,
          indiceSlot: pos
        };
      }
    }

    this.totalBuscasRealizadas++;
    this.totalComparacoesAcumuladas += comparacoes;

    return {
      registro: null,
      comparacoes,
      indiceSlot: -1
    };
  }

  /**
   * Remove um termo aplicando deleção lógica (Tombstone)
   * @param {string} termo 
   * @returns {boolean}
   */
  remover(termo) {
    const termoNormalizado = termo.toLowerCase().trim();
    const h1 = HashFunctions.hashPrimario(termoNormalizado, this.tamanho);
    const h2 = HashFunctions.hashSecundario(termoNormalizado, this.tamanho);

    for (let i = 0; i < this.tamanho; i++) {
      const pos = (h1 + i * h2) % this.tamanho;
      const slot = this.tabela[pos];

      if (slot === null) {
        return false;
      }

      if (slot !== DELETED && slot.termo === termoNormalizado) {
        this.tabela[pos] = DELETED;
        this.totalElementos--;
        this.totalTombstones++;
        return true;
      }
    }
    return false;
  }

  /**
   * Redimensiona a tabela para o próximo primo e reinsere os elementos ativos
   * @private
   */
  _redimensionar(novoTamanhoMinimo) {
    const elementosAntigos = this.obterTodosRegistros();
    this.tamanho = HashFunctions.proximoPrimo(novoTamanhoMinimo);
    this.tabela = new Array(this.tamanho).fill(null);
    this.totalElementos = 0;
    this.totalTombstones = 0;

    for (const elem of elementosAntigos) {
      this.inserir(elem);
    }
  }

  obterFatorCarga() {
    return this.totalElementos / this.tamanho;
  }

  obterCustoMedioComparacoes() {
    if (this.totalBuscasRealizadas === 0) return 0;
    return this.totalComparacoesAcumuladas / this.totalBuscasRealizadas;
  }

  obterEstatisticas() {
    let ocupados = 0;
    let tombstones = 0;
    let livres = 0;

    for (let i = 0; i < this.tamanho; i++) {
      if (this.tabela[i] === null) livres++;
      else if (this.tabela[i] === DELETED) tombstones++;
      else ocupados++;
    }

    return {
      tamanhoTabela: this.tamanho,
      totalElementos: this.totalElementos,
      fatorCarga: Number(this.obterFatorCarga().toFixed(4)),
      slotsOcupados: ocupados,
      slotsTombstones: tombstones,
      slotsLivres: livres,
      totalBuscas: this.totalBuscasRealizadas,
      comparacoesTotais: this.totalComparacoesAcumuladas,
      custoMedioComparacoes: Number(this.obterCustoMedioComparacoes().toFixed(4))
    };
  }

  obterTodosRegistros() {
    const lista = [];
    for (let i = 0; i < this.tamanho; i++) {
      if (this.tabela[i] !== null && this.tabela[i] !== DELETED) {
        lista.push(this.tabela[i]);
      }
    }
    return lista;
  }
}
