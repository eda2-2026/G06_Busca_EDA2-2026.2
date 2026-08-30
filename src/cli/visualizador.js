/**
 * Utilitário de Visualização Terminal para Tabelas Hash e Listas Auto-organizáveis
 */
export class VisualizadorTerminal {
  static CORES = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgBlue: '\x1b[44m',
    bgRed: '\x1b[41m'
  };

  /**
   * Renderiza o cabeçalho do sistema LiveGuard
   */
  static exibirBanner() {
    const { bright, cyan, yellow, reset } = this.CORES;
    console.log(cyan + `
  ██████╗  ██████╗  ██████╗     ██████╗ ██╗   ██╗███████╗ ██████╗ █████╗ 
 ██╔════╝ ██╔═████╗██╔════╝     ██╔══██╗██║   ██║██╔════╝██╔════╝██╔══██╗
 ██║  ███╗██║██╔██║███████╗     ██████╔╝██║   ██║███████╗██║     ███████║
 ██║   ██║████╔╝██║██╔═══██╗    ██╔══██╗██║   ██║╚════██║██║     ██╔══██║
 ╚██████╔╝╚██████╔╝╚██████╔╝    ██████╔╝╚██████╔╝███████║╚██████╗██║  ██║
  ╚═════╝  ╚═════╝  ╚═════╝     ╚═════╝  ╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝
    ` + reset);
    console.log(yellow + bright + `    🛡️  LiveGuard: Moderação de Chat em Tempo Real com Hashing Auto-organizável` + reset);
    console.log(this.CORES.dim + `       Disciplina: Estruturas de Dados e Algoritmos 2 - UnB (2026.2)\n` + reset);
  }

  /**
   * Imprime os baldes não-vazios de uma tabela hash aberta mostrando a ordem dos nós
   * @param {import('../core/HashMoveToFront.js').HashMoveToFront} tabelaHash 
   * @param {number} limiteBaldes - Máximo de baldes a exibir
   */
  static exibirBaldesAbertos(tabelaHash, limiteBaldes = 15) {
    const { bright, cyan, yellow, green, red, magenta, reset } = this.CORES;
    console.log(bright + `\n📦 Visualização da Estrutura dos Baldes (Separate Chaining):` + reset);
    console.log(`Capacidade: ${tamanho(tabelaHash)} | Elementos: ${tabelaHash.totalElementos} | Fator de Carga: ${tabelaHash.obterFatorCarga().toFixed(3)}\n`);

    let baldesExibidos = 0;

    for (let i = 0; i < tabelaHash.tamanho; i++) {
      const lista = tabelaHash.tabela[i];
      if (lista.tamanho > 0) {
        let linha = `${cyan}[Bucket #${i.toString().padStart(3, '0')}]${reset} (${lista.tamanho} itens) ➜ `;
        
        let atual = lista.cabeca;
        let nos = [];
        while (atual !== null) {
          const detec = atual.dado.vezesDetectado > 0 
            ? `${red}🔥${atual.dado.vezesDetectado}${reset}` 
            : `${green}0${reset}`;
          nos.push(`[${bright}${atual.dado.termo}${reset} (${detec})]`);
          atual = atual.proximo;
        }

        linha += nos.join(` ${yellow}──▶${reset} `) + ` ${magenta}──▶ [null]${reset}`;
        console.log(linha);

        baldesExibidos++;
        if (baldesExibidos >= limiteBaldes) {
          console.log(this.CORES.dim + `... e mais baldes omitidos para melhor legibilidade.` + reset);
          break;
        }
      }
    }
  }

  /**
   * Exibe o log de moderação de uma mensagem
   */
  static exibirResultadoMensagem(resultado) {
    const { bright, green, red, yellow, cyan, dim, reset } = this.CORES;
    const badge = resultado.status === 'APROVADA'
      ? `${green}[APROVADA]${reset}`
      : resultado.status === 'SINALIZADA'
        ? `${yellow}[SINALIZADA]${reset}`
        : `${red}${bright}[BLOQUEADA]${reset}`;

    console.log(`\n${badge} ${bright}@${resultado.usuario}${reset}: "${resultado.textoSanitizado}"`);
    console.log(dim + `   └─ Comparações: ${resultado.comparacoesNaMensagem} | Tempo: ${resultado.tempoProcessamentoMs}ms | Original: "${resultado.textoOriginal}"` + reset);

    if (resultado.infracoes.length > 0) {
      for (const inf of resultado.infracoes) {
        console.log(`      ⚠️  ${red}Termo: "${inf.termo}"${reset} | Categoria: ${inf.categoria} | Severidade: ${inf.severidade}/5 (Busca: ${inf.comparacoes} comparações)`);
      }
    }
  }
}

function tamanho(tabela) {
  return tabela.tamanho;
}
