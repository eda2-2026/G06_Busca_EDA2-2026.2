import fs from "fs";
import readline from "readline";
import { ListaAutoOrganizavel } from "./ListaAutoOrganizavel.js";

const dados = JSON.parse(fs.readFileSync("./data/contatos.json", "utf-8"));

const listaNormal = new ListaAutoOrganizavel();
const listaMTF = new ListaAutoOrganizavel();

dados.forEach(c => {
    listaNormal.inserir(c);
    listaMTF.inserir(c);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function exibirMenu() {
    console.log("\n==================================================");
    console.log("📱 LISTA DE CONTATOS INTELIGENTE (MOVE-TO-FRONT)");
    console.log("==================================================");
    console.log("1. 🔍 Buscar contato (Interativo)");
    console.log("2. 📋 Ver ordem atual da lista de contatos");
    console.log("3. ➕ Adicionar novo contato");
    console.log("4. ⚡ Rodar simulação automática de alto volume");
    console.log("0. 🚪 Sair");
    console.log("==================================================");
    rl.question("Escolha uma opção: ", tratarOpcao);
}

function tratarOpcao(opcao) {
    switch (opcao.trim()) {
        case "1":
            rl.question("\nDigite o nome do contato para buscar: ", (nome) => {
                const resNormal = listaNormal.buscarPadrao(nome);
                const resMTF = listaMTF.buscarMoveToFront(nome);

                if (!resMTF.contato) {
                    console.log(`\n❌ Contato "${nome}" não encontrado na lista!`);
                } else {
                    console.log(`\n✅ Contato Encontrado: ${resMTF.contato.nome} - Tel: ${resMTF.contato.telefone}`);
                    console.log(`--------------------------------------------------`);
                    console.log(`🔴 Busca Tradicional : ${resNormal.comparacoes} comparações`);
                    console.log(`🟢 Move-to-Front     : ${resMTF.comparacoes} comparação(ões)`);

                    if (resNormal.comparacoes > resMTF.comparacoes) {
                        console.log(`💡 Economia de ${resNormal.comparacoes - resMTF.comparacoes} passos de busca!`);
                    } else {
                        console.log(`📌 O contato foi movido para o topo da lista.`);
                    }
                    console.log(`📋 Nova ordem: ${listaMTF.obterOrdemNomes()}`);
                }
                exibirMenu();
            });
            break;

        case "2":
            console.log("\n📋 ORDEM ATUAL DOS CONTATOS (DO TOPO AO FINAL):");
            console.log(listaMTF.obterOrdemNomes());
            exibirMenu();
            break;

        case "3":
            rl.question("\nNome do novo contato: ", (nome) => {
                rl.question("Telefone: ", (telefone) => {
                    const novo = { id: Date.now(), nome, telefone };
                    listaNormal.inserir(novo);
                    listaMTF.inserir(novo);
                    console.log(`\n✅ Contato "${nome}" adicionado com sucesso no topo!`);
                    exibirMenu();
                });
            });
            break;

        case "4":
            console.log("\n⚡ EXECUTANDO SIMULAÇÃO DE 8 BUSCAS REPETIDAS...");
            const buscas = ["Alice Silva", "Alice Silva", "Bob Santos", "Alice Silva", "João Pedro", "Alice Silva", "Bob Santos", "João Pedro"];

            let totNormal = 0;
            let totMTF = 0;

            buscas.forEach((n, i) => {
                const rNorm = listaNormal.buscarPadrao(n);
                const rM = listaMTF.buscarMoveToFront(n);
                totNormal += rNorm.comparacoes;
                totMTF += rM.comparacoes;
                console.log(`[Busca ${i + 1}] "${n}": Tradicional=${rNorm.comparacoes} passos | MTF=${rM.comparacoes} passos`);
            });

            console.log(`\n📊 Total Tradicional: ${totNormal} passos | Total MTF: ${totMTF} passos`);
            console.log(`🚀 Redução total de esforço: ${(((totNormal - totMTF) / totNormal) * 100).toFixed(1)}%`);
            exibirMenu();
            break;

        case "0":
            console.log("\nAté logo!");
            rl.close();
            break;

        default:
            console.log("\n⚠️ Opção inválida!");
            exibirMenu();
            break;
    }
}

console.clear();
exibirMenu();