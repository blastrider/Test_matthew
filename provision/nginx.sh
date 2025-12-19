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

# Nginx: endpoints de status + logs
install -o root -g root -m 0644 /vagrant/provision/nginx-site.conf /etc/nginx/sites-available/default
install -d -o root -g root -m 0755 /var/www/html/_logs
install -o root -g root -m 0644 /dev/null /var/www/html/_logs/nginx_status.log

nginx -t
systemctl reload nginx
