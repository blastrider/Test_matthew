# vagrant/provision.rb
module Provision
  def self.apply(config)
    root = File.expand_path("..", __dir__)
    script = File.join(root, "provision", "nginx.sh")

    config.vm.provision "shell", path: script
  end
end
