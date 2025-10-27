# Pilates Studio Mobile

Aplicação mobile concebida para replicar o visual e a experiência da App Studio, com foco na gestão completa de aulas de pilates. Inclui três modos principais – Professor, Cliente e Administrador – todos acessíveis a partir de um único layout inspirado na app original.

## Funcionalidades de alto nível

- **Dashboard Professor**: métricas de assiduidade, gestão de listas de espera, check-in rápido e acompanhamento visual da presença dos alunos.
- **Experiência Cliente**: controlo de créditos, confirmação de presenças, aviso de faltas, reagendamento em aulas com vagas e visualização dos próximos treinos.
- **Painel Administrador**: gestão de mensalidades, planos activos, movimentação de alunos e tarefas prioritárias, com o mesmo look&feel da App Studio.

A interface usa gradientes, cartões com sombras suaves e ícones em linha com a identidade visual da App Studio, garantindo que a experiência mobile permanece familiar para todos os perfis.

## Estrutura do projecto

```
mobile_app/
├── App.js                # Ponto de entrada Expo/React Native
├── app.json              # Configuração Expo
├── package.json          # Dependências e scripts
└── src/
    ├── components/       # Componentes reutilizáveis (cartões, métricas, cabeçalho)
    ├── data/             # Dados mock para prototipagem offline
    ├── screens/          # Ecrãs dos modos Professor, Cliente e Admin
    └── theme/            # Paleta de cores alinhada com a App Studio
```

## Como executar

1. Instale as dependências com o Expo CLI:

   ```bash
   cd mobile_app
   npm install
   ```

2. Inicie o projecto:

   ```bash
   npm start
   ```

3. Abra a aplicação Expo Go no dispositivo físico ou utilize um emulador iOS/Android para visualizar a app, que reproduz fielmente o design da App Studio.

## Estado actual

- Todos os componentes foram desenhados com base nos padrões visuais da App Studio (gradientes escuros, cartões com cantos arredondados e ícones Ionicons).
- Estrutura pronta para integrar dados reais (API ou Firebase) mantendo a estética e navegação móveis esperadas.
- Dados mock permitem demonstrar fluxos completos sem backend.

Sinta-se à vontade para substituir os dados mock por integrações reais e acrescentar navegação adicional conforme necessário.

## Como partilhar o código com uma LLM

Para obter respostas úteis de um modelo de linguagem de grande porte (LLM) ao discutir esta aplicação, forneça o máximo de contexto organizado possível:

1. **Partilhe o repositório ou um excerto relevante**
   - Se o código estiver hospedado no GitHub/GitLab, envie o URL do repositório e indique as pastas/ficheiros que precisam de análise (`mobile_app/src/components`, `mobile_app/src/screens`, etc.).
   - Caso contrário, compacte o projecto (por exemplo, `zip -r pilates-app.zip mobile_app`) e disponibilize o ficheiro para download ou copie apenas os trechos relevantes.

2. **Explique o objectivo da análise**
   - Descreva o que a LLM deve fazer: revisar funcionalidades, propor melhorias, detectar bugs, optimizar UI, gerar testes, etc.
   - Acrescente requisitos específicos (ex.: “comparar com a App Studio”, “sugerir integração com pagamentos”).

3. **Forneça contexto adicional**
   - Inclua requisitos funcionais, fluxos de utilizador esperados e qualquer documentação de apoio (por exemplo, notas sobre paridade com a App Studio ou capturas de ecrã).
   - Informe o estado actual do projecto (ex.: “dados mock”, “sem backend”) para que a LLM adapte as sugestões.

4. **Divida o conteúdo em blocos menores quando necessário**
   - Para ficheiros longos, envie secções relevantes em mensagens separadas ou peça à LLM para solicitar mais contexto conforme necessário.
   - Utilize resumos (`README`, `Estrutura do projecto`) para guiar a LLM antes de partilhar o código completo.

5. **Verifique limites de tamanho**
   - LLMs têm limites de tokens; se o projecto for grande, priorize ficheiros críticos e forneça descrições das partes restantes.
   - Considere usar ferramentas automáticas de resumo (`npx expo-optimize`, `npx expo export --dump-sourcemap`) para gerar insights sintéticos antes de envolver a LLM.

Seguindo estes passos, a LLM terá contexto suficiente para compreender a estrutura, objectivos e estado actual da aplicação mobile, produzindo respostas mais precisas e accionáveis.
