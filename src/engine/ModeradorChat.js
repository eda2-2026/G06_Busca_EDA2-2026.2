import { TermoProibido } from '../models/TermoProibido.js';

/**
 * Motor de Moderação de Mensagens de Chat em Tempo Real
 * 
 * Processa streams contínuos de mensagens de chat, normaliza texto,
 * tokeniza palavras e executa buscas nas tabelas hash configuradas
 * para interceptar e censurar spams, ofensas e links nocivos.
 */
export class ModeradorChat {
  /**
   * @param {any} tabelaHash - Instância de tabela hash (HashMoveToFront, HashTransposicao, HashDuplo, etc.)
   * @param {Object} opcoes
   * @param {number} [opcoes.limiteSeveridadeBloqueio=4] - Severidade a partir da qual a mensagem é descartada
   */
  constructor(tabelaHash, opcoes = {}) {
    this.tabelaHash = tabelaHash;
    this.limiteSeveridadeBloqueio = opcoes.limiteSeveridadeBloqueio || 4;

    this.estatisticas = {
      totalMensagens: 0,
      mensagensAprovadas: 0,
      mensagensSinalizadas: 0,
      mensagensBloqueadas: 0,
      termosDetectadosTotais: 0,
      comparacoesTotais: 0,
      tempoTotalProcessamentoMs: 0
    };
  }

  /**
   * Carrega uma lista de termos proibidos na tabela hash
   * @param {Array<{termo: string, categoria?: string, severidade?: number}>} listaTermos 
   */
  carregarTermos(listaTermos) {
    let inseridos = 0;
    for (const item of listaTermos) {
      const termoObj = new TermoProibido(item.termo, item.categoria, item.severidade);
      if (this.tabelaHash.inserir(termoObj)) {
        inseridos++;
      }
    }
    return inseridos;
  }

  /**
   * Normaliza e extrai tokens de busca de um texto
   * @param {string} texto 
   * @returns {string[]}
   */
  extrairTokens(texto) {
    if (!texto) return [];

    // Normaliza acentuação e caracteres especiais
    const textoLimpo = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Palavras separadas por espaços ou pontuações
    const palavras = textoLimpo
      .replace(/[^\w\s_]/g, ' ')
      .split(/\s+/)
      .filter((p) => p.length > 0);

    const tokens = new Set(palavras);

    // Também adiciona combinações de palavras unidas por underscore (ex: "pix gratis" -> "pix_gratis")
    for (let i = 0; i < palavras.length - 1; i++) {
      tokens.add(`${palavras[i]}_${palavras[i + 1]}`);
      if (i < palavras.length - 2) {
        tokens.add(`${palavras[i]}_${palavras[i + 1]}_${palavras[i + 2]}`);
      }
    }

    return Array.from(tokens);
  }

  /**
   * Analisa uma mensagem de chat e aplica regras de moderação
   * @param {{id?: number|string, usuario?: string, texto: string, timestamp?: string}} mensagem 
   * @returns {{
   *   id: any,
   *   usuario: string,
   *   status: 'APROVADA'|'SINALIZADA'|'BLOQUEADA',
   *   textoOriginal: string,
   *   textoSanitizado: string,
   *   infracoes: Array<{termo: string, categoria: string, severidade: number, comparacoes: number}>,
   *   comparacoesNaMensagem: number,
   *   tempoProcessamentoMs: number
   * }}
   */
  processarMensagem(mensagem) {
    const inicio = performance.now();
    const texto = typeof mensagem === 'string' ? mensagem : mensagem.texto;
    const tokens = this.extrairTokens(texto);

    let comparacoesMensagem = 0;
    const infracoes = [];
    let maiorSeveridade = 0;
    let textoSanitizado = texto;

    for (const token of tokens) {
      const resultado = this.tabelaHash.buscar(token);
      comparacoesMensagem += resultado.comparacoes;

      if (resultado.registro) {
        infracoes.push({
          termo: resultado.registro.termo,
          categoria: resultado.registro.categoria,
          severidade: resultado.registro.severidade,
          comparacoes: resultado.comparacoes
        });

        if (resultado.registro.severidade > maiorSeveridade) {
          maiorSeveridade = resultado.registro.severidade;
        }

        // Censura o termo no texto sanitizado
        const regexTermo = new RegExp(resultado.registro.termo.replace(/_/g, '[\\s_]'), 'gi');
        textoSanitizado = textoSanitizado.replace(regexTermo, '***');
      }
    }

    const fim = performance.now();
    const tempoMs = fim - inicio;

    let status = 'APROVADA';
    if (infracoes.length > 0) {
      if (maiorSeveridade >= this.limiteSeveridadeBloqueio) {
        status = 'BLOQUEADA';
        this.estatisticas.mensagensBloqueadas++;
      } else {
        status = 'SINALIZADA';
        this.estatisticas.mensagensSinalizadas++;
      }
      this.estatisticas.termosDetectadosTotais += infracoes.length;
    } else {
      this.estatisticas.mensagensAprovadas++;
    }

    this.estatisticas.totalMensagens++;
    this.estatisticas.comparacoesTotais += comparacoesMensagem;
    this.estatisticas.tempoTotalProcessamentoMs += tempoMs;

    return {
      id: mensagem.id || this.estatisticas.totalMensagens,
      usuario: mensagem.usuario || 'anônimo',
      status,
      textoOriginal: texto,
      textoSanitizado: status === 'BLOQUEADA' ? '[MENSAGEM BLOQUEADA PELO MODERADOR]' : textoSanitizado,
      infracoes,
      comparacoesNaMensagem: comparacoesMensagem,
      tempoProcessamentoMs: Number(tempoMs.toFixed(3))
    };
  }

  /**
   * Retorna um relatório analítico consolidado do desempenho
   */
  obterRelatorio() {
    const stats = this.estatisticas;
    const mediaComparacoesMsg = stats.totalMensagens > 0 ? stats.comparacoesTotais / stats.totalMensagens : 0;
    const mediaTempoMs = stats.totalMensagens > 0 ? stats.tempoTotalProcessamentoMs / stats.totalMensagens : 0;
    const taxaBloqueio = stats.totalMensagens > 0 ? ((stats.mensagensBloqueadas + stats.mensagensSinalizadas) / stats.totalMensagens) * 100 : 0;

    return {
      ...stats,
      mediaComparacoesPorMensagem: Number(mediaComparacoesMsg.toFixed(3)),
      tempoMedioPorMensagemMs: Number(mediaTempoMs.toFixed(4)),
      taxaBloqueioPercentual: Number(taxaBloqueio.toFixed(2)),
      dadosEstruturaisTabela: this.tabelaHash.obterEstatisticas ? this.tabelaHash.obterEstatisticas() : null
    };
  }
}
