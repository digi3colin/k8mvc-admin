const K8 = require('k8mvc');
const ControllerAdmin = K8.require('ControllerAdmin');

class ControllerAdminHome extends ControllerAdmin{
  async action_index() {
    this.tpl = this.getView('templates/admin/home', {});
  }
}

module.exports = ControllerAdminHome;