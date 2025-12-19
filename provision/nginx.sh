#!/usr/bin/env bash
set -euxo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends nginx ca-certificates

systemctl enable --now nginx

# Copie la landing page depuis le dossier partagé /vagrant
install -o root -g root -m 0644 /vagrant/www/index.html /var/www/html/index.html

nginx -t
systemctl reload nginx
