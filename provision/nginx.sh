#!/usr/bin/env bash
set -euxo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends nginx ca-certificates

systemctl enable --now nginx

# Copie la landing page + assets depuis le dossier partagé /vagrant
install -d -o root -g root -m 0755 /var/www/html/assets/css /var/www/html/assets/js
install -o root -g root -m 0644 /vagrant/www/index.html /var/www/html/index.html
install -o root -g root -m 0644 /vagrant/www/assets/css/style.css /var/www/html/assets/css/style.css
install -o root -g root -m 0644 /vagrant/www/assets/js/main.js /var/www/html/assets/js/main.js

nginx -t
systemctl reload nginx
