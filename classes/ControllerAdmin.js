const K8 = require('k8mvc');
const Controller = K8.require('Controller');
const ControllerMixinView = K8.require('controller-mixin/View');
const ControllerMixinORM = K8.require('controller-mixin/ORM');
const ControllerMixinORMWrite = K8.require('controller-mixin/ORMWrite');
const ControllerMixinORMEdit = K8.require('controller-mixin/ORMEdit');

const ORM = K8.require('ORM');

class ControllerAdmin extends Controller{
  constructor(request, response){
    super(request, response);
    if(!this.request.session.admin_logged_in){
      return this.redirect(`/admin/login?cp=${encodeURIComponent(this.request.raw.url)}`);
    }

    this.layout = 'layout/admin/default';
    this.tpl = null;

    this.id = null;

    this.addMixin(this.mixinView = new ControllerMixinView(this));
    this.addMixin(this.mixinORM = new ControllerMixinORM(this));
    this.addMixin(this.mixinORMWrite = new ControllerMixinORMWrite(this));
    this.addMixin(this.mixinORMEdit = new ControllerMixinORMEdit(this));
  }

  async before(){
    await super.before();
    Object.assign(this.mixinView.view.data, {
      model            : this.model,
      action           : this.request.params.action,
      user_full_name   : this.request.session.user_full_name,
      user_role        : this.request.session.user_role,
      site             : ORM.prepare('SELECT * FROM shops').get(),
    })
  }

  action_index(){
    const instances = this.mixinORM.action_index();
    this.tpl = this.mixinView.getView('templates/admin/index', {items: instances, type: this.model});
  }

  action_read() {
    const instance = this.mixinORM.action_read();
    const data = this.mixinORMEdit.action_edit(instance);
    this.tpl = this.mixinView.getView('templates/admin/edit', data);
  }

  action_create(){
    const instance = new this.model();
    const $_GET = this.request.query || {};

    if($_GET['values']){
      const values = JSON.parse($_GET['values']);
      Object.keys(instance).forEach(x => {
        if(values[x] !== undefined){
          instance[x] = values[x];
        }
      });
    }
    const data = this.mixinORMEdit.action_edit(instance);
    this.tpl = this.mixinView.getView('templates/admin/edit', data);
  }

  action_update(){
    this.mixinORMWrite.action_update();
    this.redirectAfterFormSubmit(`/admin/${this.model.tableName}/${this.id}`);
  }

  redirectAfterFormSubmit(defaultDestination){
    const $_POST      = this.$_POST;
    const destination = (!$_POST['destination'] || $_POST['destination'] === '')? defaultDestination : $_POST['destination'];
    this.redirect(destination);
  }

  action_delete(){
    if(!this.id){
      this.response.code(500);
      throw new Error(`500 / Delete ${this.model.name} require object id`);
    }

    if(!this.request.query['confirm']){
      this.mixinView.getView('templates/admin/dialog', {
        title: `Please confirm to delete ${this.model.name} (${this.id})`,
        message : `Are you sure?`,
        cancelURL : `/admin/${this.model.tableName}`,
        confirmURL: `/admin/${this.model.tableName}/delete/${this.id}?confirm=true`,
        label : 'Confirm',
      });
      return;
    }

    ORM.prepare(`DELETE FROM ${this.model.tableName} WHERE id = ?`).run(this.id);

    this.redirectAfterFormSubmit(`admin/${this.model.tableName}`);
  }
}

module.exports = ControllerAdmin;