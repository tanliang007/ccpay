import axios from 'axios'

export default {
  install (Vue, options) {

    var instance = axios.create({
      timeout:10000,
      headers: {'ccp-oem':'oem001','ccp-appKey':'9KpIJ9QmhDn4GlGV'}
    });
    
    Vue.prototype.$http = instance      
  }
}
