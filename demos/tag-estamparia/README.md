# TAG Estamparia — Conceito independente

**Página pública verificada em 02/11/2026:** https://77-tag-estamparia-conceito.on7.workers.dev/

Fonte da implementação: [index.html](./index.html) — HTML/CSS/JS puro, sem dependências de compilação.
Esta página fica na branch `demo/tag-estamparia-v1` do repositório usado como base de experimentos na vertical de estamparia; o produto **Nova Impressão** existente em `main` não foi alterado.

## Demonstre em 90 segundos
1. Acesse a página e observe o banner explícito `Prévia conceitual não oficial`.
2. Use filtros de categoria em **Peças com atitude**; entre em **Personalizar esta peça**.
3. No Studio, mude tipo/cor/tamanho/quantidade, preencha sua ideia com ao menos 8 caracteres e gere um briefing.
4. Copie o briefing; o botão `Abrir WhatsApp` só abre o contato público do print: https://wa.link/xk458w. **Nenhuma mensagem é enviada automaticamente.**
5. Role até **Gestão sem bagunça**; o briefing aparece no painel DEMO local e pode avançar entre os estágios.
6. Reinicie o cenário com o botão correspondente; os pedidos de exemplo voltam.

## Estado técnico
- `DEMO_INTERATIVA_PERSISTIDA_LOCAL`: persistência `localStorage` só no navegador atual; não há sincronização entre dispositivos.
- Sem backend, credenciais, dados reais, cobrança, envio de mensagens, upload ou uso oficial de marca.
- SVGs e identidade visual foram criados para a proposta, não extraídos do Instagram.
- Deploy Cloudflare Worker independente: `77-tag-estamparia-conceito`, sem alterar workers existentes, rotas ou produção.
- `/health` retorna `ok`.
- Fonte de Instagram e descrição comercial: captura fornecida pelo usuário em 02/11/2026. Informações externas com nomes próximos não foram assumidas como TAG.

## QA
- Validações em JavaScript, campos com rótulo, foco `focus-visible`, `prefers-reduced-motion` e layout responsivo (CSS).
- Publicação e `/health` foram verificados por acesso remoto.
- **Não comprovado:** execução E2E automatizada em Chrome/Safari e screenshots reais de 320/360/390/430/768/1024/1440. Validar antes de utilizar como produto real.
- Não abrir PR para merge automático na `main` sem revisão; branch isolada para preservar a aplicação preexistente.

Leia o [DESIGN.md](./DESIGN.md) para decisões e lacunas.
