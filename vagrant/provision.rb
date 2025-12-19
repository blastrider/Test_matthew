# vagrant/provision.rb
module Provision
  def self.apply(config)
    config.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "ansible/playbook.yml"
      ansible.become = true
    end
  end
end
