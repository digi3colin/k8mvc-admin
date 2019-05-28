const K8 = require('k8mvc');
const RouteList = K8.require('RouteList');

RouteList.add('/admin', 'controller/admin/ControllerAdminHome');
RouteList.add('/admin/login', 'controller/ControllerAuth', 'login');
RouteList.add('/admin/login', 'controller/ControllerAuth', 'auth', 'post');
RouteList.add('/admin/login/fail', 'controller/ControllerAuth', 'fail');
RouteList.add('/admin/logout', 'controller/ControllerAuth', 'logout');
