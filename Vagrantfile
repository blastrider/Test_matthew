# Vagrantfile
require_relative "vagrant/settings"
require_relative "vagrant/provision"

Vagrant.configure("2") do |config|
  config.vm.define "nginx1" do |node|
    Settings.apply(node, hostname: "nginx-bookworm-1", host_port: 8080)
    Provision.apply(node)
  end

  config.vm.define "nginx2" do |node|
    Settings.apply(node, hostname: "nginx-bookworm-2", host_port: 8081)
    Provision.apply(node)
  end
end
