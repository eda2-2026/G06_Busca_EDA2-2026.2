import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { HashMoveToFront } from '../core/HashMoveToFront.js';
import { HashTransposicao } from '../core/HashTransposicao.js';
import { HashDuplo } from '../core/HashDuplo.js';
import { ModeradorChat } from '../engine/ModeradorChat.js';
import { VisualizadorTerminal } from './visualizador.js';
import { executarComparativo } from '../benchmark/comparador.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const rl = readline.createInterface({ input, output });

  // Instancia tabela MTF por padrão
  const tabela = new HashMoveToFront(53);
  const moderador = new ModeradorChat(tabela);

  // Carrega base de termos
  const termosPath = path.join(__dirname, '../../data/termos_moderacao.json');
  const termosJson = JSON.parse(fs.readFileSync(termosPath, 'utf-8'));
  moderador.carregarTermos(termosJson);

  let executando = true;

  while (executando) {
    console.clear();
    VisualizadorTerminal.exibirBanner();

    console.log(`\n📋 MENU PRINCIPAL:`);
    console.log(`1. ✍️  Digitar mensagem e testar moderação em tempo real`);
    console.log(`2. ⚡ Simular streaming de chat (50 mensagens com Zipf)`);
    console.log(`3. 🔍 Inspecionar buckets e nós da Tabela Hash (MTF)`);
    console.log(`4. 📊 Executar Benchmark comparativo (MTF vs Transposição vs Duplo)`);
    console.log(`5. 🚪 Sair\n`);

    const opcao = await rl.question('Escolha uma opção (1-5): ');

    switch (opcao.trim()) {
      case '1': {
        console.log(`\n[Modo Digitação] Digite 'voltar' para sair.`);
        let digitando = true;
        while (digitando) {
          const texto = await rl.question('\nMensagem de chat > ');
          if (texto.toLowerCase() === 'voltar') {
            digitando = false;
            break;
          }
          const res = moderador.processarMensagem({
            usuario: 'usuario_teste',
            texto
          });
          VisualizadorTerminal.exibirResultadoMensagem(res);
        }
        break;
      }

      case '2': {
        const samplePath = path.join(__dirname, '../../data/chat_stream_sample.json');
        const stream = JSON.parse(fs.readFileSync(samplePath, 'utf-8')).slice(0, 50);
        console.log(`\n🚀 Iniciando simulação de 50 mensagens em tempo real...\n`);

        for (const msg of stream) {
          const res = moderador.processarMensagem(msg);
          VisualizadorTerminal.exibirResultadoMensagem(res);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        console.log(`\n✅ Simulação concluída!`);
        VisualizadorTerminal.exibirBaldesAbertos(tabela, 10);
        await rl.question('\nPressione Enter para voltar ao menu...');
        break;
      }

      case '3': {
        VisualizadorTerminal.exibirBaldesAbertos(tabela, 30);
        const stats = tabela.obterEstatisticas();
        console.log(`\n📈 Estatísticas Estruturais:`);
        console.log(`- Capacidade M: ${stats.tamanhoTabela}`);
        console.log(`- Elementos N: ${stats.totalElementos}`);
        console.log(`- Fator de Carga α: ${stats.fatorCarga}`);
        console.log(`- Taxa de Ocupação: ${stats.taxaOcupacao}%`);
        console.log(`- Custo Médio de Comparações: ${stats.custoMedioComparacoes}`);
        await rl.question('\nPressione Enter para continuar...');
        break;
      }

      case '4': {
        console.log(`\n📊 Executando Benchmark detalhado...\n`);
        executarComparativo(10000);
        await rl.question('\nPressione Enter para voltar ao menu...');
        break;
      }

      case '5': {
        executando = false;
        console.log(`\nAté logo!\n`);
        break;
      }

      default:
        console.log(`Opção inválida!`);
        await new Promise((r) => setTimeout(r, 1000));
    }
  }

  rl.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
