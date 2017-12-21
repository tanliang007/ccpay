import Vue from 'vue'
import App from './App'
import router from './router'
import VueHttp from './utility/http'
import MintUI from 'mint-ui'
import { Toast } from 'mint-ui';
import 'mint-ui/lib/style.css'
import "../static/common.css";
import '../static/mymint.css';//全局修改mint-UI样式  
import pdSelect from 'pd-select'


// import 'lib-flexible/flexible.js'

Vue.config.productionTip = false
Vue.use(VueHttp)
Vue.use(MintUI)
Vue.use(pdSelect)

//post请求参数解决问题
Vue.prototype.transformRequest=function  (data) {
  let ret = ''
  for (let it in data) {
    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
  }
  return ret
}
/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
