import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MENSAGENS_LEGITIMAS = [
  "Salve chat, boa noite!",
  "Jogou muito agora!",
  "Qual a sensibilidade que você usa na mira?",
  "GG WP, partida sensacional!",
  "Manda salve pra Brasília!",
  "Qual o próximo jogo da live?",
  "Essa fase é muito difícil, cuidado com a esquerda",
  "Kkkkkkkk não acredito que isso aconteceu",
  "Aulas e palestras nessa gameplay",
  "Alguém sabe quando sai a próxima atualização?",
  "Estudando EDA2 enquanto assisto a live",
  "Hoje tem corujão?",
  "Muito bom o conteúdo, continue assim!",
  "Caramba, quase ganhou no último segundo",
  "Que jogada incrível meus amigos!"
];

const AUTORES = [
  "lucas_gamer", "ana_dev", "pedro_unb", "mari_streamer",
  "carlos_eda", "julia_tech", "rodrigo_99", "beatriz_fga",
  "gabriel_pro", "fernanda_live", "felipe_bot", "camila_code"
];

/**
 * Gera um índice de 0 a total-1 seguindo a distribuição de Zipf aproximada
 * P(r) = (1 / r^s) / H_N,s
 * @param {number} totalItens 
 * @param {number} s - Expoente de assimetria (default: 1.1)
 * @returns {number}
 */
export function gerarIndiceZipf(totalItens, s = 1.1) {
  let somaHarmonica = 0;
  for (let i = 1; i <= totalItens; i++) {
    somaHarmonica += 1 / Math.pow(i, s);
  }

  const aleatorio = Math.random();
  let acumulado = 0;

  for (let i = 1; i <= totalItens; i++) {
    acumulado += (1 / Math.pow(i, s)) / somaHarmonica;
    if (aleatorio <= acumulado) {
      return i - 1;
    }
  }

  return 0;
}

/**
 * Gera uma lista de mensagens simuladas de chat
 * @param {number} quantidade - Número de mensagens a gerar
 * @param {number} taxaSpam - Fração de mensagens contendo spams/termos proibidos (ex: 0.35)
 */
export function gerarFluxoMensagens(quantidade = 1000, taxaSpam = 0.35) {
  const termosJsonPath = path.join(__dirname, 'termos_moderacao.json');
  const termos = JSON.parse(fs.readFileSync(termosJsonPath, 'utf-8'));

  const mensagens = [];

  for (let i = 0; i < quantidade; i++) {
    const usuario = AUTORES[Math.floor(Math.random() * AUTORES.length)];
    const ehSpam = Math.random() < taxaSpam;

    let texto = "";
    let termoInserido = null;

    if (ehSpam && termos.length > 0) {
      // Escolhe o termo proibido seguindo Zipf (os primeiros termos são massivamente mais frequentes)
      const indiceTermo = gerarIndiceZipf(termos.length, 1.2);
      const objTermo = termos[indiceTermo];
      termoInserido = objTermo.termo;

      const formatos = [
        `Galera acessem ${termoInserido} agora mesmo!`,
        `Imperdível: ${termoInserido} confira no perfil`,
        `${termoInserido} ${termoInserido} ${termoInserido}`,
        `Testem isso: ${termoInserido}`,
        `Mensagem suspeita detectada com ${termoInserido}`
      ];

      texto = formatos[Math.floor(Math.random() * formatos.length)];
    } else {
      texto = MENSAGENS_LEGITIMAS[Math.floor(Math.random() * MENSAGENS_LEGITIMAS.length)];
    }

    mensagens.push({
      id: i + 1,
      timestamp: new Date(Date.now() + i * 150).toISOString(),
      usuario,
      texto,
      termoEsperado: termoInserido
    });
  }

  return mensagens;
}

// Se executado diretamente pelo Node, gera o sample de 500 mensagens
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sample = gerarFluxoMensagens(500, 0.4);
  const samplePath = path.join(__dirname, 'chat_stream_sample.json');
  fs.writeFileSync(samplePath, JSON.stringify(sample, null, 2), 'utf-8');
  console.log(`[Gerador] Arquivo ${samplePath} criado com ${sample.length} mensagens geradas.`);
}
