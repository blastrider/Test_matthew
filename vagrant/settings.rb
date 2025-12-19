# vagrant/settings.rb
module Settings
  def self.apply(config, hostname: "nginx-bookworm", host_port: 8080, private_ip: nil)
    config.vm.box = "debian/bookworm64"
    config.vm.hostname = hostname

    # Réseau
    if host_port
      config.vm.network "forwarded_port", guest: 80, host: host_port, auto_correct: true
    end
    if private_ip
      config.vm.network "private_network", ip: private_ip
    end

    # Provider
    config.vm.provider "virtualbox" do |vb|
      vb.name = hostname
      vb.memory = 1024
      vb.cpus = 4
    end
  end
end
