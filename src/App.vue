<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
    html.overflow,body.overflow,#app.overflow {
      height: 100%;
      overflow: hidden;
    }
    /* tab栏的样式 */
    .mint-navbar{
     padding: 0 12px; 
    }
    .mint-navbar .mint-tab-item.is-selected{
      margin-bottom:-2px;
    }
</style>
