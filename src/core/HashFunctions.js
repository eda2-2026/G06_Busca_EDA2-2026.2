/**
 * Módulo de Funções Hash para Strings e Tratamento de Colisões
 * 
 * Implementa os conceitos teóricos de EDA2:
 * - Função Hash Polinomial por Divisão (Slides 74 e 83)
 * - Função Hash Secundária para Hash Duplo (Slides 97-98)
 * - Utilitários de primalidade para dimensionamento de tabelas
 */
export class HashFunctions {
  /**
   * Constante padrão para hash polinomial (número primo pequeno)
   */
  static PRIME_BASE = 31;
  static PRIME_BASE_2 = 37;

  /**
   * Função Hash Primária (h1) baseada na regra de Horner para avaliação polinomial
   * h1(str) = (s[0]*p^(n-1) + s[1]*p^(n-2) + ... + s[n-1]) mod M
   * 
   * @param {string} str - Chave string a ser mapeada
   * @param {number} tamanhoTabela - Tamanho M da tabela (idealmente primo)
   * @returns {number} Índice entre 0 e M - 1
   */
  static hashPrimario(str, tamanhoTabela) {
    if (!str || str.length === 0) return 0;
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * this.PRIME_BASE + str.charCodeAt(i)) % tamanhoTabela;
    }
    return (hash + tamanhoTabela) % tamanhoTabela;
  }

  /**
   * Função Hash Secundária (h2) para Hashing Duplo
   * Garante:
   * 1. 1 <= h2(k) < M
   * 2. h2(k) nunca é 0 (para não entrar em loop infinito)
   * 3. MDC(h2(k), M) = 1 quando M é primo
   * 
   * Fórmula: h2(k) = 1 + (h_sec(k) mod (M - 1))
   * 
   * @param {string} str - Chave string
   * @param {number} tamanhoTabela - Tamanho M da tabela
   * @returns {number} Passo de incremento entre 1 e M - 1
   */
  static hashSecundario(str, tamanhoTabela) {
    if (!str || str.length === 0) return 1;

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * this.PRIME_BASE_2 + str.charCodeAt(i)) % (tamanhoTabela - 1);
    }
    const passo = 1 + ((hash + (tamanhoTabela - 1)) % (tamanhoTabela - 1));
    return passo;
  }

  /**
   * Função Hash alternativa FNV-1a para comparação de distribuição de bits
   * @param {string} str 
   * @param {number} tamanhoTabela 
   * @returns {number}
   */
  static hashFNV1a(str, tamanhoTabela) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % tamanhoTabela;
  }

  /**
   * Verifica se um número é primo
   * @param {number} n 
   * @returns {boolean}
   */
  static ehPrimo(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  /**
   * Retorna o próximo número primo maior ou igual a n
   * @param {number} n 
   * @returns {number}
   */
  static proximoPrimo(n) {
    let candidato = Math.max(2, Math.floor(n));
    if (candidato % 2 === 0 && candidato > 2) candidato++;
    while (!this.ehPrimo(candidato)) {
      candidato += 2;
    }
    return candidato;
  }
}
