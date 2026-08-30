import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { HashMoveToFront } from '../core/HashMoveToFront.js';
import { HashTransposicao } from '../core/HashTransposicao.js';
import { HashEstatico } from '../core/HashEstatico.js';
import { HashDuplo } from '../core/HashDuplo.js';
import { ModeradorChat } from '../engine/ModeradorChat.js';
import { gerarFluxoMensagens } from '../../data/gerador_mensagens.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executa benchmark comparativo de desempenho entre as estruturas de busca
 * @param {number} totalMensagens 
 * @param {number} taxaSpam 
 */
export function executarComparativo(totalMensagens = 20000, taxaSpam = 0.4) {
  const termosPath = path.join(__dirname, '../../data/termos_moderacao.json');
  const termos = JSON.parse(fs.readFileSync(termosPath, 'utf-8'));

  console.log(`\n========================================================================`);
  console.log(`  🔬 BENCHMARK DE BUSCA E HASHING - GRUPO 06 (EDA2 - 2026.2)`);
  console.log(`========================================================================`);
  console.log(`- Total de Mensagens Simuladas: ${totalMensagens.toLocaleString()}`);
  console.log(`- Termos Proibidos Carregados: ${termos.length}`);
  console.log(`- Distribuição de Frequência: Lei de Zipf (Recuperação Recorrente, Slide 21)`);
  console.log(`- Taxa de Mensagens com Termos: ${(taxaSpam * 100).toFixed(0)}%\n`);

  // Gera o conjunto idêntico de mensagens para todos os modelos
  const mensagens = gerarFluxoMensagens(totalMensagens, taxaSpam);

  const estruturas = [
    { nome: '1. Hash Aberto + Move-to-Front (MTF)', instancia: new HashMoveToFront(53) },
    { nome: '2. Hash Aberto + Transposição',        instancia: new HashTransposicao(53) },
    { nome: '3. Hash Aberto Estático (Baseline)',   instancia: new HashEstatico(53) },
    { nome: '4. Hash Fechado (Rehash Duplo)',       instancia: new HashDuplo(79) }
  ];

  const resultados = [];

  for (const item of estruturas) {
    const moderador = new ModeradorChat(item.instancia);
    moderador.carregarTermos(termos);

    const inicio = performance.now();
    for (let i = 0; i < mensagens.length; i++) {
      moderador.processarMensagem(mensagens[i]);
    }
    const fim = performance.now();

    const relatorio = moderador.obterRelatorio();
    const tempoTotalMs = fim - inicio;

    resultados.push({
      nome: item.nome,
      tempoTotalMs: Number(tempoTotalMs.toFixed(2)),
      comparacoesTotais: relatorio.comparacoesTotais,
      mediaComparacoesMsg: relatorio.mediaComparacoesPorMensagem,
      custoMedioPorBusca: item.instancia.obterCustoMedioComparacoes().toFixed(4),
      mensagensBloqueadas: relatorio.mensagensBloqueadas + relatorio.mensagensSinalizadas
    });
  }

  // Tabela formatada
  console.log('┌──────────────────────────────────────────────┬──────────────┬──────────────────┬─────────────────┬─────────────┐');
  console.log('│ Algoritmo / Estrutura                        │ Tempo Total  │ Comparações Tot. │ Média Comp/Msg  │ Custo Busca │');
  console.log('├──────────────────────────────────────────────┼──────────────┼──────────────────┼─────────────────┼─────────────┤');

  for (const r of resultados) {
    const nomePad = r.nome.padEnd(44);
    const tempoPad = `${r.tempoTotalMs} ms`.padEnd(12);
    const compTotPad = r.comparacoesTotais.toLocaleString().padEnd(16);
    const compMsgPad = r.mediaComparacoesMsg.toString().padEnd(15);
    const custoPad = r.custoMedioPorBusca.toString().padEnd(11);
    console.log(`│ ${nomePad} │ ${tempoPad} │ ${compTotPad} │ ${compMsgPad} │ ${custoPad} │`);
  }
  console.log('└──────────────────────────────────────────────┴──────────────┴──────────────────┴─────────────────┴─────────────┘');

  // Análise teórica
  const compEstatico = resultados[2].comparacoesTotais;
  const compMTF = resultados[0].comparacoesTotais;
  const compTransp = resultados[1].comparacoesTotais;
  const reducaoMTF = (((compEstatico - compMTF) / compEstatico) * 100).toFixed(2);
  const reducaoTransp = (((compEstatico - compTransp) / compEstatico) * 100).toFixed(2);

  console.log(`\n💡 CONCLUSÃO E ANÁLISE TEÓRICA:`);
  console.log(`- O Move-to-Front (MTF) reduziu o total de comparações em ${reducaoMTF}% frente à lista estática.`);
  console.log(`- A Transposição reduziu o total de comparações em ${reducaoTransp}%.`);
  console.log(`- Conforme previsto pelo Slide 21 da disciplina, sob busca recorrente assimétrica (Lei de Zipf), a reorganização dinâmica aproxima a busca de O(1) mesmo em listas com colisões.`);
  console.log(`========================================================================\n`);

  return resultados;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  executarComparativo(25000);
}
