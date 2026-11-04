#!/usr/bin/env bash
set -euo pipefail
archive="$1"
release_id="$2"
[[ "$release_id" =~ ^[0-9]{8}-[0-9]{6}$ ]] || exit 2
base=/var/www/renan-portfolio
release="$base/releases/$release_id"
test -f "$archive"
test ! -e "$release"
if grep -Eq '^renanfulas\.com\.br[[:space:]]*\{' /etc/caddy/Caddyfile; then
  echo 'Domain already configured; inspect current configuration before updating.' >&2
  exit 3
fi
mkdir -p "$release" /etc/caddy/backups
tar -xzf "$archive" -C "$release" --no-same-owner
find "$release" -type d -exec chmod 755 {} +
find "$release" -type f -exec chmod 644 {} +
test -f "$release/index.html"
backup="/etc/caddy/backups/Caddyfile-portfolio-$release_id"
cp -p /etc/caddy/Caddyfile "$backup"
cp -p /etc/caddy/Caddyfile /etc/caddy/Caddyfile.portfolio-candidate
schema_hash=$(python3 -c 'import re,hashlib,base64,sys; s=open(sys.argv[1]).read(); t=re.search(r"<script type=\"application/ld\+json\">(.*?)</script>",s).group(1); print(base64.b64encode(hashlib.sha256(t.encode()).digest()).decode())' "$release/index.html")
cat >> /etc/caddy/Caddyfile.portfolio-candidate <<EOF

renanfulas.com.br {
    root * /var/www/renan-portfolio/current
    encode zstd gzip
    header {
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-$schema_hash'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests"
        -Server
    }
    @html path / /projetos/* /privacidade/* *.html
    header @html Cache-Control "no-cache"
    file_server
    handle_errors {
        rewrite * /404.html
        file_server
    }
}

www.renanfulas.com.br {
    redir https://renanfulas.com.br{uri} permanent
}
EOF
caddy fmt --overwrite /etc/caddy/Caddyfile.portfolio-candidate
caddy validate --config /etc/caddy/Caddyfile.portfolio-candidate --adapter caddyfile
ln -s "$release" "$base/current-next"
mv -Tf "$base/current-next" "$base/current"
mv /etc/caddy/Caddyfile.portfolio-candidate /etc/caddy/Caddyfile
if ! systemctl reload caddy; then
    cp -p "$backup" /etc/caddy/Caddyfile
    systemctl reload caddy
    echo 'Reload failed; original Caddy configuration restored.' >&2
    exit 4
fi
printf 'DEPLOYED_RELEASE=%s\nCADDY_BACKUP=%s\n' "$release" "$backup"
systemctl is-active caddy
