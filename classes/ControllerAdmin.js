/* abstract class of controller require administrator role.*/

const K8 = require('k8mvc');
const Controller = K8.require('Controller');
const ControllerMixinMime = K8.require('controller-mixin/Mime');
const ControllerMixinView = K8.require('controller-mixin/View');
const ControllerMixinORM = K8.require('controller-mixin/ORM');
const ControllerMixinORMWrite = K8.require('controller-mixin/ORMWrite');
const ControllerMixinORMEdit = K8.require('controller-mixin/ORMEdit');
const ControllerMixinMultiDomainDB = K8.require('controller-mixin/MultiDomainDB');
const ControllerMixinAdminActionLogger = K8.require('controller-mixin/AdminActionLogger');

class ControllerAdmin extends Controller{
  constructor(request, response){
    super(request, response);
    if(!this.request.session.admin_logged_in){
      return this.redirect(`/admin/login?cp=${encodeURIComponent(this.request.raw.url)}`);
    }

    this.layout = 'layout/admin/default';
    this.templates = {
      index : 'templates/admin/index',
      read  : 'templates/admin/edit',
      create: 'templates/admin/edit',
      dialog: 'templates/admin/dialog'
    };
    this.tpl = null;

    this.id = null;

    this.addMixin(new ControllerMixinMime(this));
    this.addMixin(new ControllerMixinAdminActionLogger(this));
    this.addMixin(new ControllerMixinMultiDomainDB(this));
    this.addMixin(new ControllerMixinView(this));
    this.addMixin(new ControllerMixinORM(this));
    this.addMixin(new ControllerMixinORMWrite(this));
    this.addMixin(new ControllerMixinORMEdit(this));
  }

  async before(){
    await super.before();
    Object.assign(this.view.data, {
      model            : this.model,
      action           : this.request.params.action,
      user_full_name   : this.request.session.user_full_name,
      user_role        : this.request.session.user_role,
      site             : this.db.prepare('SELECT * FROM shops').get(),
    })
  }

  async action_index(){
    const data = {items: this.instances, type: this.model};
    this.tpl = this.getView(this.templates.index, data);
  }

  async action_read() {
    this.tpl = this.getView(this.templates.read, this.data);
  }

  async action_create(){
    this.tpl = this.getView(this.templates.create, this.data);
  }

  async action_update(){
    this.redirectAfterFormSubmit(`/admin/${this.model.tableName}/${this.id}`);
  }

  redirectAfterFormSubmit(defaultDestination){
    const $_POST      = this.$_POST;
    const destination = (!$_POST['destination'] || $_POST['destination'] === '')? defaultDestination : $_POST['destination'];
    this.redirect(destination);
  }

  async action_delete(){
    if(!this.id){
      throw new Error(`500 / Delete ${this.model.name} require object id`);
    }

    if(!this.request.query['confirm']){
      this.tpl = this.getView(this.templates.dialog, {
        title: `Please confirm to delete ${this.model.name} (${this.id})`,
        message : `Are you sure?`,
        cancelURL : `/admin/${this.model.tableName}`,
        confirmURL: `/admin/${this.model.tableName}/delete/${this.id}?confirm=true`,
        label : 'Confirm',
      });
      return;
    }

    this.db.prepare(`DELETE FROM ${this.model.tableName} WHERE id = ?`).run(this.id);

    this.redirectAfterFormSubmit(`/admin/${this.model.tableName}`);
  }
}

module.exports = ControllerAdmin;