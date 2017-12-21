<template>
   <section>
         <header class="mint-header border-bottom">
          <div class="mint-header-button is-left">
            <router-link :to="{path:'/paymentStatus',query:{cardId:callbackId}}" class="router-link-active">
                 <i class="mintui mintui-back"></i>
            </router-link>
          </div>
          <h1 class="mint-header-title">还款计划详情</h1>
       
        </header>
        

      <div v-show="items.length>0">
           
        <div class="title">
          <div class="zong">总计还款金额&nbsp;:&nbsp;¥{{amount}}</div>
          <div class="bi clearfix" >
            <div>总还款笔数&nbsp;:&nbsp;{{count}}</div>
            <div>手续费&nbsp;:&nbsp;{{fee}}</div>
          </div>
        </div>

   <ul>
          <li v-for="item in items">
            <div class="lists clearfix">
              <div>
                还款金额&nbsp;:&nbsp;¥{{item.refundAmount/100}}
              </div>
              <div>               
                {{arr[item.status]}}
              </div>
            </div>
            <div class="detail clearfix">
               <div>
                {{item.day}}
               </div>            
              <router-link :to="{path:'/nowdayplandetail',query: {planId:planId,day:item.day,cardId:callbackId}}" class="link" >
                    详情
              </router-link>
            </div>
          </li>
        </ul>
        </div>
   </section>
</template>
<script>
import { Toast } from 'mint-ui';
export default {
    data(){
      return {
        amount:"",
        count:"",
        fee:"",
        items:"",
        planId:"",
        callbackId:"",
        arr:['未执行','执行中', '成功', '失败']
      }
    },
    created(){
      this.callbackId=this.$route.query.cardId;
      this.$http.get('/ak/api/plan/summary',{
       params: { //去本地那check存储的userid
         planId: this.$route.query.planId
        }
      }).then((res)=>{
        if(res.data.code==1){
         console.log(res)
         this.amount=res.data.data.amount/100;
         this.count=res.data.data.count;
         this.fee=res.data.data.fee/100;
         this.planId=res.data.data.planId;
         this.items=res.data.data.list;
        }else{
          Toast({
                    message:res.data.msg,
                    position: 'center',
                    duration: 1000
          })
        }
      }).catch((error)=>{
          console.log(error)
      })  
    }
    
}
</script>
<style scoped>
 .mint-header-button{
  flex:none;
}
.mint-header-button .mintui{
  font-size:20px;
}
.mint-header-title{
   font-size: 18px;
   overflow: visible;
}
.mint-header {
  background-color: #fff;
  color: #333;
  margin-bottom: 10px;
}
.title{
 background: #26a2ff;
 color: #fff ;
 width: 95%;
 margin: 0 auto ;
 border-radius:8px;
}
 .title  .zong{
  font-size: 15px; 
  padding: 14px 0px;
  padding-left: 8px;
 }
.title  .bi>div:nth-child(1){
  float: left;
  font-size: 15px;
  padding: 5px 0px;
  padding-left: 8px;
  padding-bottom: 10px;
 }
 .title  .bi>div:nth-child(2){
  float: right;
  font-size: 15px; 
  padding: 5px 0px;
  padding-right: 20px;
  padding-bottom: 12px;
 }
 ul{ 
    width: 95%;
    margin: 0 auto ;
 }
  ul li{
    background: #fff;
    margin-top: 8px; 
  }
 ul li .lists{
    padding: 10px 0;
    padding-left: 8px;
 }
 ul li .lists div:nth-child(1){
  float: left;
   font-size: 15px;
 }
 ul li .lists div:nth-child(2){
 float: right;
padding-right: 20px;
 font-size: 15px;

 }
 ul li .detail{
   padding-left: 8px;
 }
  ul li .detail div:nth-child(1){
  float: left;
   padding-bottom: 10px;
   padding-top: 15px;
    font-size: 15px;
 }
 ul li .detail .link{
 float: right;
 padding-right: 20px;
 padding-bottom: 10px;
 padding-top: 15px;
 font-size: 15px;
 color: #26a2ff;
 }

</style>

