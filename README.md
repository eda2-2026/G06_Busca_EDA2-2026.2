# G06 - Busca Sequencial Auto-Organizável (Move-to-Front)

Projeto prático da disciplina de **Estruturas de Dados 2 (2026.2)**.

**Disciplina:** Estruturas de Dados e Algoritmos 2 (EDA 2)  
**Semestre:** 2026.2  
**Grupo:** 06  

---

## 👥 Integrantes

| Matrícula | Nome | GitHub |
| :--- | :--- | :--- |
| - 222008468 | Danilo Sarmento Barros | [@auslogyc](https://github.com/auslogyc) |


---

## 📌 Sobre o Projeto
Este projeto implementa e demonstra o funcionamento prático do algoritmo de **Busca Sequencial Auto-Organizável com a estratégia Move-to-Front (Mover-para-Frente)** e **Transposição**, baseado nos **Slides 21 e 22** do material didático de *Métodos de Busca (SCC-201 - ICMC/USP)*.

### 📱 Aplicação no Mundo Real
O algoritmo simula o mecanismo de **Contatos Frequentes e Histórico Recente** utilizado em aplicativos de mensagens (como WhatsApp) e discadores de smartphones:
- **O Problema:** Em uma lista de contatos, o acesso aos dados não é distribuído uniformemente. Os usuários costumam se comunicar com um grupo seleto de contatos em mais de 80% das vezes (*Princípio de Pareto / Recuperação Recorrente*).
- **A Solução:** Na Busca Tradicional, o sistema percorre a lista do zero toda vez ($O(N)$). Com o **Move-to-Front**, assim que um contato é acessado, ele é deslocado para o topo da lista ligada. Nas próximas buscas por esse mesmo contato, a recuperação ocorre em apenas **1 comparação ($O(1)$ amortizado)**.

---

## 📊 Comparativo Teórico de Complexidade
| Estrutura / Técnica | Pior Caso | Caso Médio (Acesso Uniforme) | Caso Médio (Recuperação Recorrente) |
| :--- | :---: | :---: | :---: |
| **Busca Sequencial Tradicional** | $O(N)$ | $O(N/2)$ | $O(N)$ |
| **Busca Auto-Organizável (Move-to-Front)** | $O(N)$ | $O(N/2)$ | **$O(1)$** |

---

## 🎥 Vídeo de Apresentação
- **Link do Vídeo (até 5 min):** [Clique aqui para assistir ao vídeo no YouTube/Loom](https://link-do-seu-video-aqui)

---

## 🚀 Como Instalar e Executar

### Pré-requisitos
- Ter o **Node.js** instalado (versão 18 ou superior).

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/eda2-2026/G06_Busca_EDA2-2026.2.git
   cd G06_Busca_EDA2-2026.2
