# Nginx Vagrant Lab (2 web + 1 storage)

This repo provisions three Debian VMs:
- nginx1: Nginx + PHP-FPM, served on http://localhost:8080
- nginx2: Nginx + PHP-FPM, served on http://localhost:8081
- storage: NFS server that exports `/var/www/html/upload` for shared uploads

Uploads are stored on the NFS share so they survive a web VM failure.

## Prerequisites
- Vagrant
- VirtualBox

## Quick start
```
vagrant up
```

If VMs already exist:
```
vagrant reload --provision
```

## Services
- nginx1: http://localhost:8080
- nginx2: http://localhost:8081

Private network IPs:
- nginx1: 192.168.56.10
- nginx2: 192.168.56.11
- storage: 192.168.56.12

## Uploads
- Upload endpoint: `POST /upload`
- Upload list: `GET /upload/` (autoindex)
- Stored files: `/var/www/html/upload` (shared via NFS)

In the UI, use the "Envoyer sur le serveur" button. The "Serveur" link opens the list view.

## Nginx status
- Status endpoint: `GET /nginx_status`
- Last logs: `GET /nginx_status_logs`

The "Status (optionnel)" button opens a modal with status + last 20 log lines.

## Provisioning
Ansible is used via `ansible_local` in Vagrant. The playbook:
- installs Nginx + PHP-FPM on nginx1/nginx2
- installs NFS server on storage
- mounts the NFS share on nginx1/nginx2 at `/var/www/html/upload`
- deploys the static site + upload API

### Re-provision a single VM
```
vagrant provision nginx1
vagrant provision nginx2
vagrant provision storage
```

## Project layout
- `www/`: static site + upload handler
- `ansible/playbook.yml`: provisioning logic
- `provision/nginx-site.conf`: Nginx site config
- `vagrant/`: Vagrant settings and provisioning glue

