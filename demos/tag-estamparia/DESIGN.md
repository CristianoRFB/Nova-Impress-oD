# TAG Estamparia — Direção de Arte / Demo Conceitual (02/11/2026)

## Identidade e proveniência
- **CONFIRMADO NO PRINT**: Instagram `@tag.estamparia`; nome TAG ESTAMPARIA; São Paulo; bio com Silk, malha sustentável, camisetas, oversized, moletons; destaques de tabelas de medidas, camisetas, bermudas e moletons; link público `https://wa.link/xk458w`.
- **HIPÓTESE**: clientes precisariam consultar categorias, combinar especificações de arte e acompanhar a fila de pedidos. Não se confirmou software interno, política de preços, pedido mínimo, estoque, prazos ou aceitação de encomendas pelo site.
- **PROPOSTA NÃO OFICIAL**: estampas, elementos gráficos, textos de posicionamento, fluxo de atendimento e pedidos de exemplo são autorais e fictícios. Não implica parceria.

## Missão da interface
Mostrar valor de uma vitrine e intake de orçamento em menos de 90 segundos: filtrar categoria → escolher peça → configurar cor/tamanho/quantidade → descrever arte → gerar e copiar resumo → abrir WhatsApp para pedir confirmação; gestor avança os pedidos em um painel DEMO.

## Direção visual
**Expressiva · underground · editorial**. Contraste de preto de estúdio com cartazes neon inspirados na linguagem visual legível da captura, sem reutilizar imagens ou logos reais. Tipografia Barlow Condensed para títulos e DM Sans para interação, com fallback local. Paleta:
- canvas `#0e0e11` / surface `#17171b` / input `#111115`;
- ink `#f5f2e9` / muted `#a6a3aa` / border `#333238`;
- CTA `#d9ff43` com texto `#161616`;
- acentos `#ff3e97`, `#ff9b36`;
- feedback `#232a18` com borda `#90b250`; erro `#ff8b9a`.

## Grid e responsividade
Mobile-first de fato: empilhamento do hero/estúdio abaixo de 700px; grid de 2 cards em 320–430px e 3 em desktop; menus substituídos por CTA claro no celular, com CTA fixo no rodapé. Escala de espaçamento 8, 12, 16, 24, 32, 48, 64. Breakpoints 375/700/950. Testar 320/360/390/430/768/1024/1440.

## Fluxos implementados
1. **Vitrine:** filtros de Camiseta, Oversized, Moletom e Bermuda com 4 mockups SVG próprios, todos rotulados como exemplos.
2. **Briefing:** variante, cor, tamanho, quantidade de 1 a 9999, nome opcional, texto descritivo obrigatório mínimo de 8 caracteres; preview SVG em tempo real, feedback e cópia do resumo. O link público do WhatsApp abre sem envio automático.
3. **Gestão:** pedidos seed EXEMPLO; novos briefings locais aparecem na mesma sessão/origem; botão de avançar até Concluído; contadores derivados; reiniciar cenário com confirmação; localStorage versionado.

## Limites de segurança e transparência
O painel não possui autenticação porque é uma simulação com dados fake e **não** expõe o backend da TAG. Os registros não chegam ao estabelecimento; o navegador armazena apenas dados enviados pelo próprio visitante e exibe localmente. Não houve cobrança, estoque, automação de mensagens, autenticação real, integração de arquivos ou API, nem uso autorizado de fotografias da TAG. Evitar colocar dados pessoais reais na demonstração.

## Comportamento e acessibilidade
Tags semânticas, labels e foco visível; botões com `aria-pressed` para cor/filtros; role status/alert; resumo opcional copiado pelo clipboard com fallback; `prefers-reduced-motion`; estados sem pedidos e restaurar seed. Ilustrações SVG em HTML sem imagens de terceiros.

## Escopo para produção futura
**GLOBAL:** componentes, filtros, forms, estados, temas.
**VERTICAL (estamparia):** personalização de peças, arte, etapas de produção, tabelas de medidas, atendimento/orçamentos.
**LOCAL:** branding, coleção, categorias, regras de preço/mínimo, contato, domínio.
Produção requer autenticação/roles, consentimento, backend isolado multi-tenant, regras de tamanho/preços oficiais, upload autorizado, LGPD, trilhas de eventos, validação e aceite do titular da marca.
