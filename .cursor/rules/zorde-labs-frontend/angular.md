
---
description: Cursor rules for the Zorde Labs frontend
ApplyIntelligently: true
---
# Cursor Rules - Zorde Labs Frontend

Estas diretrizes definem o comportamento do agente do Cursor para o desenvolvimento da aplicação frontend na pasta `apps/app/zorde-labs`. O projeto é construído em Angular e exige padrões modernos e rigorosos de engenharia de software.

## 1. Estado e Reatividade (Signals First)
- **Obrigatoriedade**: Utilize a abordagem **Signals first**. Todo estado reativo local, propriedades de componentes e fluxos de dados devem priorizar a API de Signals do Angular (`signal`, `computed`, `effect`, inputs baseados em signals).
- **Formulários e Inputs**: **NUNCA** utilize `ngModel` (Template-driven forms). Para formulários, adote integrações reativas com Signals ou Reactive Forms, garantindo que o bind de dados e as atualizações de estado fluam de maneira previsível.
- **OnPush Change Detection**: **NÃO**   Utilize o `ChangeDetectionStrategy.OnPush` para componentes que não dependem de inputs externos ou fluxos de dados reativos. O `ChangeDetectionStrategy.OnPush` é o padrão em Angular v22+


## 2. Tipagem e TypeScript Estrito
- **Fim do `any`**: É terminantemente proibido o uso do tipo `any` em qualquer parte do código.
- **Prevalência do `unknown`**: Quando não for possível inferir o tipo ou ao lidar com respostas externas não mapeadas, utilize `unknown`. O agente deve realizar o *type narrowing* seguro (como *type guards* ou asserções controladas) antes de manipular a variável.
- **Contratos Claros**: Especifique de forma estrita os tipos de parâmetros, retornos de funções e interfaces de entidades de dados.

## 3. Estrutura de Pastas e Arquitetura
- **Respeito à Hierarquia**: O agente deve examinar e respeitar rigidamente a estrutura de diretórios existente. Não recrie utilitários ou serviços que já habitam pastas de domínio ou núcleos compartilhados.
- **Princípios SOLID e Fronteiras Limpas**: Garanta que os serviços tenham responsabilidade única. Mantenha a lógica de negócios isolada da camada de apresentação visual.
- **Ecossistema de UI**: Siga os padrões estabelecidos para construção de interfaces modulares utilizando Tailwind CSS e componentes da estrutura que está no projeto, usando sempre o padrão do design system, sem introduzir paradigmas visuais conflitantes.

## 4. Comportamento do Agente de IA
- **Componentes Modernos**: Ao gerar ou refatorar componentes Angular, assuma sempre que devem ser *Standalone Components*.
- **Sem Atalhos**: Se faltar clareza sobre um modelo de dados, não adivinhe nem crie "tipos fantasma"; utilize `unknown` ou peça confirmação.