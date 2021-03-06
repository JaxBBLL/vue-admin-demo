import Layout from '@/components/layout/index.vue';
import Empty from '@/components/layout/empty.vue';

let uid = 0;

function buildRoute(item, isDynamic = false) {
  let component;
  let name = item.name || '';
  // 处理parmas的路由，只支持参数路径后面。如：/user/detail/:id
  let path = item.path.replace(/\/:\w+/gi, '');
  // 是否动态目录菜单
  if (isDynamic) {
    // item.type -> 0：目录；1：菜单；2：内部菜单；3: iframe页面
    if (item.type === 0) {
      // 是目录
      if (item.pid) {
        // 非顶级目录，使用无html结构组件
        component = Empty;
      } else {
        // 顶级目录，使用Layout组件
        component = Layout;
      }
    } else if (item.type == 1 || item.type == 2) {
      // 页面，使用对应路径的组件
      try {
        component = _import(path) || null;
      } catch (e) {}
    } else if (item.type == 3) {
      component = Empty;
    }
    if (path) {
      name = path.replace(/\/(.)/g, function(match, p1) {
        return p1.toUpperCase();
      });
    }
  } else {
    component = item.component;
  }
  return {
    id: uid++, // 自增uid，用于遍历的key
    path: item.path || '',
    name: name,
    title: item.title,
    hidden: item.type === 2,
    leaf: item.leaf || false, // 目录是否显示为页面，true时会把子目录第一个设为导航。如：home页面
    icon: item.icon || '', // 目录图标，使用font-awesome库
    component,
    redirect: item.redirect,
    type: item.type,
    meta: {
      url: item.url,
      type: item.type,
      noBread: !!item.noBread, // 不显示面包屑
      title: item.title,
      noCache: item.type === 2, // 一般内页不缓存
      noTabs: item.noTabs || false // 是否显示tabs栏
    }
  };
}

// 路由递归构建
export function compilerRoutes(treeList, isDynamic = false) {
  var res = [];
  for (var i = 0; i < treeList.length; i++) {
    var route = buildRoute(treeList[i], isDynamic);
    if (treeList[i].children) {
      route.children = compilerRoutes(treeList[i].children, isDynamic);
    }
    res.push(route);
  }
  return res;
}

// 开发环境不使用懒加载, 因为懒加载页面太多的话会造成webpack热更新太慢, 所以只有生产环境使用懒加载
function _import(url) {
  if (process.env.NODE_ENV === 'development') {
    return require(`@/views${url}.vue`).default;
  } else {
    return () => import(/* webpackChunkName: "[index]" */ `@/views${url}.vue`);
  }
}
