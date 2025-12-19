# Vagrantfile
require_relative "vagrant/settings"
require_relative "vagrant/provision"

Vagrant.configure("2") do |config|
  config.vm.define "storage" do |node|
    Settings.apply(
      node,
      hostname: "nginx-storage",
      host_port: nil,
      private_ip: "192.168.56.12"
    )
    Provision.apply(node, role: "storage", nfs_allowed_subnet: "192.168.56.0/24")
  end

  config.vm.define "nginx1" do |node|
    Settings.apply(
      node,
      hostname: "nginx-bookworm-1",
      host_port: 8080,
      private_ip: "192.168.56.10"
    )
    Provision.apply(node, role: "nginx", nfs_server_ip: "192.168.56.12")
  end

  config.vm.define "nginx2" do |node|
    Settings.apply(
      node,
      hostname: "nginx-bookworm-2",
      host_port: 8081,
      private_ip: "192.168.56.11"
    )
    Provision.apply(node, role: "nginx", nfs_server_ip: "192.168.56.12")
  end
end
