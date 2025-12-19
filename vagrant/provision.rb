# vagrant/provision.rb
module Provision
  def self.apply(config, role: "nginx", nfs_server_ip: nil, nfs_allowed_subnet: nil)
    config.vm.provision "ansible_local" do |ansible|
      ansible.playbook = "ansible/playbook.yml"
      ansible.become = true
      ansible.extra_vars = { node_role: role }
      ansible.extra_vars["nfs_server_ip"] = nfs_server_ip if nfs_server_ip
      ansible.extra_vars["nfs_allowed_subnet"] = nfs_allowed_subnet if nfs_allowed_subnet
    end
  end
end
