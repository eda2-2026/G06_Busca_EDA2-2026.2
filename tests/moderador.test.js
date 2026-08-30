import test from 'node:test';
import assert from 'node:assert';

import { TermoProibido } from '../src/models/TermoProibido.js';
import { ListaEncadeadaAutoOrganizavel } from '../src/models/ListaEncadeada.js';
import { HashFunctions } from '../src/core/HashFunctions.js';
import { HashMoveToFront } from '../src/core/HashMoveToFront.js';
import { HashTransposicao } from '../src/core/HashTransposicao.js';
import { HashDuplo } from '../src/core/HashDuplo.js';
import { ModeradorChat } from '../src/engine/ModeradorChat.js';

test('HashFunctions - Cálculo de dispersão e primalidade', async (t) => {
  await t.test('Deve calcular hash primário dentro dos limites [0, M-1]', () => {
    const M = 53;
    const h1 = HashFunctions.hashPrimario('pix_gratis', M);
    assert.ok(h1 >= 0 && h1 < M);
  });

  await t.test('Deve calcular hash secundário h2 >= 1 e nunca igual a zero', () => {
    const M = 53;
    const h2 = HashFunctions.hashSecundario('compre_seguidores', M);
    assert.ok(h2 >= 1 && h2 < M);
  });

  await t.test('Deve identificar primos e calcular o próximo primo corretamente', () => {
    assert.strictEqual(HashFunctions.ehPrimo(2), true);
    assert.strictEqual(HashFunctions.ehPrimo(17), true);
    assert.strictEqual(HashFunctions.ehPrimo(18), false);
    assert.strictEqual(HashFunctions.proximoPrimo(10), 11);
    assert.strictEqual(HashFunctions.proximoPrimo(50), 53);
  });
});

test('ListaEncadeadaAutoOrganizavel - Heurísticas de Reorganização', async (t) => {
  await t.test('Move-to-Front (MTF) deve mover o nó acessado para a cabeça', () => {
    const lista = new ListaEncadeadaAutoOrganizavel();
    lista.inserir({ termo: 'c' });
    lista.inserir({ termo: 'b' });
    lista.inserir({ termo: 'a' }); // Ordem: a -> b -> c

    // Busca o elemento 'c' (que estava no final)
    const res = lista.buscarMoveToFront('c');
    assert.strictEqual(res.registro.termo, 'c');
    assert.strictEqual(res.comparacoes, 3);

    // Agora 'c' deve ser a nova cabeça da lista
    assert.strictEqual(lista.cabeca.dado.termo, 'c');

    // Nova busca por 'c' deve ter apenas 1 comparação (O(1))
    const res2 = lista.buscarMoveToFront('c');
    assert.strictEqual(res2.comparacoes, 1);
  });

  await t.test('Transposição deve trocar o nó acessado com o anterior imediato', () => {
    const lista = new ListaEncadeadaAutoOrganizavel();
    lista.inserir({ termo: 'c' });
    lista.inserir({ termo: 'b' });
    lista.inserir({ termo: 'a' }); // Ordem: a -> b -> c

    // Busca 'c' com transposição (troca com 'b')
    const res = lista.buscarTransposicao('c');
    assert.strictEqual(res.registro.termo, 'c');

    // Nova ordem deve ser: a -> c -> b
    const arr = lista.paraArray();
    assert.strictEqual(arr[0].termo, 'a');
    assert.strictEqual(arr[1].termo, 'c');
    assert.strictEqual(arr[2].termo, 'b');
  });

  await t.test('Remoção deve excluir o nó e decrementar tamanho', () => {
    const lista = new ListaEncadeadaAutoOrganizavel();
    lista.inserir({ termo: 'x' });
    lista.inserir({ termo: 'y' });
    assert.strictEqual(lista.tamanho, 2);

    const removido = lista.remover('x');
    assert.strictEqual(removido, true);
    assert.strictEqual(lista.tamanho, 1);
    assert.strictEqual(lista.cabeca.dado.termo, 'y');
  });
});

test('Tabelas Hash - Inserção, Busca e Resolução de Colisões', async (t) => {
  await t.test('HashMoveToFront deve inserir e localizar registros', () => {
    const hashMTF = new HashMoveToFront(11);
    hashMTF.inserir(new TermoProibido('spam_a', 'SPAM', 3));
    hashMTF.inserir(new TermoProibido('spam_b', 'SPAM', 4));

    const busca = hashMTF.buscar('spam_a');
    assert.ok(busca.registro !== null);
    assert.strictEqual(busca.registro.termo, 'spam_a');

    const naoExiste = hashMTF.buscar('palavra_limpa');
    assert.strictEqual(naoExiste.registro, null);
  });

  await t.test('HashDuplo deve resolver colisões por rehash e permitir tombstone', () => {
    const hashDuplo = new HashDuplo(7);
    hashDuplo.inserir(new TermoProibido('termo1', 'SPAM', 3));
    hashDuplo.inserir(new TermoProibido('termo2', 'OFENSA', 4));
    hashDuplo.inserir(new TermoProibido('termo3', 'SPAM', 2));

    assert.strictEqual(hashDuplo.totalElementos, 3);
    const busca = hashDuplo.buscar('termo2');
    assert.strictEqual(busca.registro.termo, 'termo2');

    // Remoção lógica com tombstone
    const removido = hashDuplo.remover('termo2');
    assert.strictEqual(removido, true);
    assert.strictEqual(hashDuplo.buscar('termo2').registro, null);

    // Deve continuar encontrando outros elementos que colidiram após o tombstone
    assert.strictEqual(hashDuplo.buscar('termo3').registro.termo, 'termo3');
  });
});

test('ModeradorChat - Filtragem de Mensagens e Métricas', async (t) => {
  await t.test('Deve aprovar mensagens legítimas sem infrações', () => {
    const tabela = new HashMoveToFront(31);
    const moderador = new ModeradorChat(tabela);
    moderador.carregarTermos([
      { termo: 'pix_gratis', categoria: 'SPAM', severidade: 4 }
    ]);

    const res = moderador.processarMensagem({
      usuario: 'aluno_unb',
      texto: 'Salve professor, boa noite!'
    });

    assert.strictEqual(res.status, 'APROVADA');
    assert.strictEqual(res.infracoes.length, 0);
  });

  await t.test('Deve bloquear mensagens com termos de alta severidade e censurar texto', () => {
    const tabela = new HashMoveToFront(31);
    const moderador = new ModeradorChat(tabela, { limiteSeveridadeBloqueio: 4 });
    moderador.carregarTermos([
      { termo: 'urubu_do_pix', categoria: 'SPAM', severidade: 5 }
    ]);

    const res = moderador.processarMensagem({
      usuario: 'spammer_99',
      texto: 'Acessem o urubu do pix para lucrar'
    });

    assert.strictEqual(res.status, 'BLOQUEADA');
    assert.strictEqual(res.infracoes.length, 1);
    assert.strictEqual(res.infracoes[0].termo, 'urubu_do_pix');
    assert.strictEqual(res.textoSanitizado, '[MENSAGEM BLOQUEADA PELO MODERADOR]');
  });
});
