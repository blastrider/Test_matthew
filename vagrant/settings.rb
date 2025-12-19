# vagrant/settings.rb
module Settings
  def self.apply(config)
    config.vm.box = "debian/bookworm64"
    config.vm.hostname = "nginx-bookworm"

    # Réseau
    config.vm.network "forwarded_port", guest: 80, host: 8080, auto_correct: true
    # Optionnel : IP privée
    # config.vm.network "private_network", ip: "192.168.56.10"

    # Provider
    config.vm.provider "virtualbox" do |vb|
      vb.name = "nginx-bookworm"
      vb.memory = 1024
      vb.cpus = 2
    end
  end
end
