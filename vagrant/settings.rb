# vagrant/settings.rb
module Settings
  def self.apply(config, hostname: "nginx-bookworm", host_port: 8080)
    config.vm.box = "debian/bookworm64"
    config.vm.hostname = hostname

    # Réseau
    config.vm.network "forwarded_port", guest: 80, host: host_port, auto_correct: true
    # Optionnel : IP privée
    # config.vm.network "private_network", ip: "192.168.56.10"

    # Provider
    config.vm.provider "virtualbox" do |vb|
      vb.name = hostname
      vb.memory = 1024
      vb.cpus = 4
    end
  end
end
