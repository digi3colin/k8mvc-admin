const K8 = require('k8mvc');
const ControllerAdmin = K8.require('ControllerAdmin');

module.exports = class ControllerAdminHome extends ControllerAdmin{
  constructor(request, response) {
    super(request, response);
    this.model = {name: 'Home', lowercase: 'home'};
  }

  action_index() {
    this.tpl = this.mixinView.getView('templates/admin/home', {});
  }
};
