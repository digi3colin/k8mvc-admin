const K8     = require('k8mvc');
const ControllerMixinView = K8.require('controller-mixin/View');
const ControllerMixinMultipartForm = K8.require('controller-mixin/MultipartForm');

const Controller         = K8.require('Controller');
const Auth               = K8.require('Auth');


class ControllerAuth extends Controller{
  constructor(request, response) {
    super(request, response);

    this.addMixin(this.mixinView = new ControllerMixinView(this));
    this.addMixin(new ControllerMixinMultipartForm(this));

    Auth.session = this.request.session;
  }

  action_login(){
    this.tpl = this.mixinView.getView('templates/login', {
      destination : this.request.query.cp,
      message : '',
    });
  }

  action_logout(){
    Auth.logout();

    this.tpl = this.mixinView.getView('templates/login', {
      destination : '/admin/',
      message : 'User Log Out Successfully.',
    });
  }

  action_fail(){
    this.tpl = this.mixinView.getView('templates/login', {
      destination : this.request.query.cp,
      message : 'Login fail.',
    });
  }

  action_auth(){
    const $_POST      = this.$_POST;
    const destination = (!$_POST['destination'] || $_POST['destination'] === '')? '/admin/' : $_POST['destination'];

    //guard empty post data;
    if(!$_POST['user'] || !$_POST['password'] || $_POST['user'] === '' || $_POST['password'] === ''){
      this.redirect(`/admin/login/fail?cp=${encodeURIComponent(destination)}`);
      return;
    }

    const user = Auth.authorize($_POST['user'], $_POST['password']);

    if(!user){
      this.redirect(`/admin/login/fail?cp=${encodeURIComponent(destination)}`);
      return;
    }

    this.redirect(destination);
  }

}

module.exports = ControllerAuth;