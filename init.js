const K8 = require('k8mvc');
const RouteList = K8.require('RouteList');

RouteList.add('/admin', 'controllers/admin/ControllerAdminHome');
RouteList.add('/admin/login', 'controllers/ControllerAuth', 'login');
RouteList.add('/admin/login', 'controllers/ControllerAuth', 'auth', 'post');
RouteList.add('/admin/login/fail', 'controllers/ControllerAuth', 'fail');
RouteList.add('/admin/logout', 'controllers/ControllerAuth', 'logout');
