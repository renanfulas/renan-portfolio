# Renan Fulas — Portfólio

Site estático para `https://renanfulas.com.br`, servido por Caddy na VPS configurada pelo usuário. Não utiliza o serviço de hospedagem Sites: o destino solicitado nesta conversa é a VPS existente.

## Conteúdo e construção

- `build.py`: conteúdo, layout HTML compartilhado e páginas de projetos. `python build.py` gera o HTML e os metadados em `dist/`.
- `dist/styles.css`: identidade visual, componentes e responsividade.
- `dist/site.js`: menu mobile e cópia de e-mail.
- `dist/assets/`: imagens e fontes locais. As fotos foram fornecidas pelo usuário; as telas são de seus projetos. `prepare_assets.py` documenta a preparação original; não é necessário executá-lo para editar a página.
- `verify.py`: verifica links internos, âncoras, arquivos, títulos H1 e textos alternativos.
- `review/`: capturas de revisão; não publicar.

Prévia: `python -m http.server 8840 --bind 127.0.0.1 --directory dist`.

Validação: `python build.py`, `python verify.py`, `node --check dist/site.js` e revisão responsiva no navegador.

## Publicação

Enviar apenas `dist/` para uma nova pasta em `/var/www/renan-portfolio/releases/`. Atualizar o link `/var/www/renan-portfolio/current` de forma atômica. O Caddy serve esse link nos domínios raiz e www, com redirecionamento de www para o raiz. O subdomínio `demo` mantém sua configuração independente.

Antes de alterar o Caddyfile, criar cópia datada em `/etc/caddy/backups/`; executar `caddy validate` e recarregar o serviço somente se válido. Restaurar a cópia se a validação falhar.

## Notas editoriais

O usuário confirmou experiência na HostGator, responsabilidade por todas as decisões técnicas da Fontesan e Support FAQ Agent e liderança de equipe de quatro pessoas neste último. Curva pertence ao ecossistema OctoBox. Não se afirmam métricas de resultado comercial.

O contato usa `renanfulas@outlook.com`, obtido do perfil GitHub conectado. O CTA principal abre o WhatsApp no número +55 11 93735-0535, fornecido pelo usuário, com mensagem preenchida. O e-mail continua como alternativa. Não há formulário nem envio automático.
