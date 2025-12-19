# Vagrantfile
require_relative "vagrant/settings"
require_relative "vagrant/provision"

Vagrant.configure("2") do |config|
  Settings.apply(config)
  Provision.apply(config)
end
