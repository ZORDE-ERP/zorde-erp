# @repo/angular-ui

Biblioteca Angular standalone de componentes reutilizáveis (`app-*`) para o ecossistema Zorde.

## Uso no zorde-labs

O app `zorde-labs` compila a fonte via alias `@repo/angular-ui` apontando para `src/ui-lib` (cópia local usada pelo Angular builder). A fonte canônica do monorepo fica em `packages/angular-ui/src`.

Após alterar o pacote, sincronize para o app:

```bash
rsync -a --delete packages/angular-ui/src/ apps/app/zorde-labs/src/ui-lib/
```

## Dependências

- Angular 22
- `@angular/cdk`
- `@lucide/angular`

## Categorias

- primitives (button, input, field, …)
- data-display (card, badge, avatar, …)
- feedback (toast, spinner, skeleton)
- overlays (modal, dropdown, tooltip, popover)
- formatting (CPF, CNPJ, BRL)
- navigation / layout (sidebar, navbar, app-layout, auth-layout)
