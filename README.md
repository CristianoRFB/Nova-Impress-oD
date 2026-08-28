# Nova Impressão — Central de Artes

Demonstração comercial de um módulo especializado em artes, revisões e aprovações. O objetivo é permitir que qualquer pessoa autorizada encontre rapidamente a versão atual, a versão aprovada, o que mudou, as pendências e a próxima ação — mesmo sem a designer disponível.

## O que a demonstração cobre

- dashboard operacional derivado do estado real;
- busca por cliente, referência, serviço e descrição;
- filtros por status e responsável;
- resumo rápido de cada trabalho;
- versões imutáveis e navegação por versões antigas;
- distinção explícita entre versão atual e versão aprovada;
- solicitações de alteração vinculadas à versão de origem;
- criação de nova versão com resolução opcional de alterações;
- aprovação vinculada à versão exata;
- mudança de status, observações e timeline derivada dos eventos;
- persistência local segura e restauração do cenário inicial;
- interface responsiva para desktop e celular.

## Demonstração x produção

Esta é uma aplicação frontend estática com dados fictícios. O `localStorage` e o seed local existem apenas para tornar a apresentação interativa; não representam uma arquitetura recomendada para produção.

Uma implantação real precisaria de levantamento e, possivelmente, backend, autenticação e autorização, banco, armazenamento de arquivos, auditoria persistente, backup, políticas de LGPD e integrações confirmadas. Esta demo não integra WhatsApp nem qualquer sistema interno.

## Stack e execução

Requer Node.js LTS compatível com Vite 8.

```bash
npm ci
npm run dev
```

Checks e build:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run preview
```

As rotas usam `HashRouter`, compatível com hospedagem estática sem regras de rewrite:

- `#/` — visão geral;
- `#/artes` — consulta e filtros;
- `#/artes/:id` — detalhe do trabalho.

## Caso principal: ART-1048

O trabalho do cliente fictício Mercado Horizonte começa com V1 e V2 preservadas e V3 atual/aprovada. Para demonstrar o contraste central:

1. abra `ART-1048`;
2. clique em **Criar nova versão** e confirme a V4;
3. o resumo passa a exibir **ATUAL: V4** e **APROVADA: V3**;
4. selecione a V4 e use **Registrar aprovação**;
5. a aprovação, o dashboard e a timeline são atualizados, enquanto V1–V3 permanecem consultáveis.

Use **Restaurar dados** no rodapé da navegação para voltar ao cenário inicial. O estado utiliza a chave versionada `nova-impressao-art-demo:v1`; payload inválido é descartado com fallback seguro.

## GitHub Pages

O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) instala de forma determinística, executa lint e testes, gera `dist` e publica com as actions oficiais do GitHub Pages. Ele calcula o `base` no build:

- `/` para um repositório `<usuario>.github.io`;
- `/<nome-do-repositorio>/` para project sites.

Depois de enviar o projeto para o GitHub na branch `main`, selecione **Settings → Pages → Source → GitHub Actions**. Não é necessário commitar `dist`.

## Limitações deliberadas

Não há backend, login real, upload, arquivos reais, API externa, editor gráfico, ERP, produção, estoque, financeiro ou CRM. Os nomes, empresas, pessoas, contatos e previews são fictícios e foram criados apenas para a demonstração.
