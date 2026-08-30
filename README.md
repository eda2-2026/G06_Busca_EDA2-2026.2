# LiveGuard - Filtro Anti-Spam e Moderação em Tempo Real com Hashing Auto-organizável

**Disciplina:** Estruturas de Dados e Algoritmos 2 (EDA 2)  
**Semestre:** 2026.2  
**Grupo:** 06  

---

## 👥 Integrantes

| Matrícula | Nome | GitHub |
| :--- | :--- | :--- |
| - | Integrante 1 | [@usuario1](https://github.com/) |
| - | Integrante 2 | [@usuario2](https://github.com/) |
| - | Integrante 3 | [@usuario3](https://github.com/) |
| - | Integrante 4 | [@usuario4](https://github.com/) |

---

## 📌 Sobre o Projeto

O **LiveGuard** é um sistema de moderação e filtragem de mensagens em tempo real voltado para plataformas de chat e transmissões ao vivo (como Twitch, YouTube Live e Discord).

Em ambientes de streaming de alta densidade, milhões de mensagens são enviadas a cada minuto. O comportamento empírico dos spammers segue uma distribuição de frequência assimétrica (Lei de Zipf): cerca de **80% do spam ativo provém de um conjunto reduzido de 10 a 20 termos populares no momento**.

Para viabilizar a análise em nanossegundos por mensagem sem degradar a experiência dos usuários, o LiveGuard combina **Tabelas Hash com Listas Auto-organizáveis**, aplicando heurísticas de recuperação de registros:
- **Move-to-Front (MTF):** Move o termo proibido detectado diretamente para o topo do bucket, garantindo custo $O(1)$ para spams recorrentes.
- **Transposição:** Troca o termo com o nó imediatamente anterior a cada detecção, promovendo termos frequentes de forma gradual.
- **Hashing com Endereçamento Fechado e Aberto:** Análise comparativa entre encadeamento separado e hashing duplo.

---

## 🧠 Algoritmos e Estruturas de Dados Utilizados

1. **Hashing Aberto (*Separate Chaining*):**
   - Vetor de ponteiros para listas encadeadas com resolução de colisão por encadeamento.
2. **Heurística Move-to-Front (MTF):**
   - Realocação do nó buscado para o início da lista ligada no bucket.
3. **Heurística de Transposição:**
   - Troca de posição do nó com seu predecessor imediato.
4. **Hashing Fechado com Hash Duplo (*Double Hashing*):**
   - Sonda com segunda função de dispersão para evitar agrupamento primário e secundário.
5. **Funções Hash de Strings:**
   - Método da Divisão e Método Polinomial (Regra de Horner / FNV-1a).

---

## 📂 Estrutura do Repositório

```text
G06_Busca_EDA2-2026.2/
├── package.json
├── .gitignore
├── README.md
├── src/
│   ├── models/
│   │   ├── TermoProibido.js      # Modelo do registro moderado
│   │   └── ListaEncadeada.js     # Lista auto-organizável (MTF e Transposição)
│   ├── core/
│   │   ├── HashFunctions.js      # Funções de dispersão primária e secundária
│   │   ├── HashMoveToFront.js    # Tabela Hash Aberta com MTF
│   │   ├── HashTransposicao.js   # Tabela Hash Aberta com Transposição
│   │   └── HashDuplo.js          # Tabela Hash Fechada com Hash Duplo
│   ├── engine/
│   │   └── ModeradorChat.js      # Motor de análise de streams de chat
│   ├── benchmark/
│   │   └── comparador.js         # Benchmark com simulação de 50.000 mensagens
│   └── cli/
│       ├── visualizador.js       # Visualizador dos buckets no terminal
│       └── index.js              # Interface interativa CLI
├── data/
│   ├── termos_moderacao.json     # Dicionário de termos e regras de severidade
│   └── chat_stream_sample.json   # Amostra de fluxo de mensagens
└── tests/
    └── moderador.test.js         # Testes automatizados unitários
```

---

## 🚀 Como Executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/eda2-2026/G06_Busca_EDA2-2026.2.git

# Entrar no diretório
cd G06_Busca_EDA2-2026.2
```

### Executar a Aplicação (CLI Interativa)
```bash
npm start
```

### Executar os Benchmarks de Comparação
```bash
npm run benchmark
```

### Executar os Testes Unitários
```bash
npm test
```

---

## 📊 Demonstração e Resultados

*(Serão adicionados os gráficos comparativos de número de comparações e tempos médios de busca por algoritmo)*