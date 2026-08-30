export class TermoProibido {
  /**
   * Representa um termo cadastrado na base de moderação.
   * @param {string} termo - Palavra, expressão ou link proibido
   * @param {'SPAM'|'OFENSA'|'LINK_MALICIOSO'|'FLOOD'} categoria - Tipo da infração
   * @param {number} severidade - Nível de gravidade (1 a 5)
   */
  constructor(termo, categoria = 'SPAM', severidade = 3) {
    this.termo = termo.toLowerCase().trim();
    this.categoria = categoria;
    this.severidade = severidade;
    this.vezesDetectado = 0;
    this.criadoEm = new Date();
  }

  /**
   * Incrementa o contador de ocorrências ao detectar o termo em uma mensagem.
   */
  registrarOcorrencia() {
    this.vezesDetectado++;
  }
}