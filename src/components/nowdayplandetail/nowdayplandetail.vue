<template>
   <section>
          <header class="mint-header border-bottom">
          <div class="mint-header-button is-left">
            <router-link :to="{path:'/repaymentdetail',query:{planId:planId,cardId:callbackId}}" class="router-link-active">
                 <i class="mintui mintui-back"></i>
            </router-link>
          </div>
          <h1 class="mint-header-title">计划详情</h1>
        </header>
         <div id="container" v-show='expenseList.length>0'>

           <div class="expenseAmount clearfix">
             <div> <span  style="margin-right:5px;">消费金额&nbsp;:</span>{{expenseAmount/100}} </div>
             <div> 笔数&nbsp;:&nbsp;{{expenseCount}} </div>
           </div>

           <ul class="expenseList">
             <li v-for="item in expenseList">
               <div class="xfstatus clearfix">
                  <div>
                    {{item.day}}
                  </div>
                  <div>
                    {{arr[item.status]}}
                  </div>
               </div>
               <div class="xiaofei clearfix">
                   <div class="consumption">
                      消费金额:{{item.amount/100}}
                   </div>
                   <div class="Manual"  v-if="item.status==3" @click="consumeManualPay(item.detailId)" >手动消费</div>
               </div>
             </li>
           </ul>


          <div class="refundAmount clearfix">
             <div> <span style="margin-right:5px;">还款金额&nbsp;:</span>{{refundAmount/100}} </div>
             <div> <span >笔数&nbsp;:&nbsp;</span>{{refundCount}} </div>
           </div>

         </div>
           <ul class="refundList">
             <li v-for="item in refundList">
               <div class="hkstatus clearfix">
                  <div>
                    {{item.day}}
                  </div>
                  <div>
                    {{arr[item.status]}}
                  </div>
               </div>
               <div class="huankuan">
                 还款金额&nbsp;:&nbsp;{{item.amount/100}}
                 <div class="Manual"  v-if="item.status==3" @click="repayManualPay(item.detailId)" >手动还款</div>
               </div>
             </li>
          </ul>


   </section>
</template>
<script>
import { Toast } from 'mint-ui';
export default {
    data(){
      return {
        planId:"",
        callbackId:"",
        expenseAmount:"",
        expenseCount:"",
        expenseList:"",
        refundAmount:"",
        refundCount:"",
        refundList:"",
        arr:['未执行','执行中', '成功', '失败']
      }
    },
    created(){
      console.log(this.$route.query)
      this.callbackId=this.$route.query.cardId
      this.planId=this.$route.query.planId
      var obj={
        planId:this.$route.query.planId,
        day:this.$route.query.day,
      }
      this.$http.get('/ak/api/plan/detail',{
       params: this.$route.query
      }).then((res)=>{
        if(res.data.code==1){
           console.log(res)
           this.expenseAmount=res.data.data.expenseAmount
           this.expenseCount=res.data.data.expenseCount
           this.expenseList=res.data.data.expenseList
           this.refundAmount=res.data.data.refundAmount
           this.refundCount=res.data.data.refundCount
           this.refundList=res.data.data.refundList
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
    },
    methods:{
      consumeManualPay (ManualPay){
       console.log(ManualPay)
       //跳转到消费失败手动消费的页面
        this.$router.push( { path: 'Manualpayments', query: { ManualPay: ManualPay,stu:0}})
      },
      repayManualPay(ManualPay){
           //跳转到还款失败手动消费的页面
         this.$router.push( { path: 'Manualpayments', query: { ManualPay: ManualPay,stu:1}})
      }
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

.expenseAmount,.refundAmount{
  background: #26a2ff;
  width: 95%;
  margin: 0 auto;
  border-radius: 8px;
  font-size: 15px;
  height: 40px;
  line-height: 40px;
  color: #fff;
}
.refundAmount{
  margin-top: 10px;
}
.expenseAmount div:nth-child(1),.refundAmount div:nth-child(1){
 float: left;
 padding-left: 8px;
}
.expenseAmount div:nth-child(2),.refundAmount div:nth-child(2){
 float: right;
 padding-right: 60px;
}
.expenseList {
  width: 95%;
  margin: 0 auto;
}
.expenseList li{
  padding: 0 8px;
  margin-top: 5px;
  background: #fff;

}
.expenseList .xfstatus{
  padding: 10px 0;
}

.expenseList .xfstatus div:nth-child(1){
  float: left;
}
.expenseList .xfstatus div:nth-child(2){
  float: right;
  color: #26a2ff;
}
/* 样式傅用 */
.refundList {
  width: 95%;
  margin: 0 auto;
}
.refundList li{
  padding: 0 8px;
  margin-top: 5px;
  background: #fff;

}
.refundList .hkstatus{
  padding: 10px 0;
}
.refundList .huankuan{
  padding-bottom: 10px;
  height: 53px;
  line-height: 53px;
}
.refundList .hkstatus div:nth-child(1){
  float: left;
}
.refundList .hkstatus div:nth-child(2){
  float: right;
  color: #26a2ff;
}
.consumption{
  float:left;
  height: 53px;
  line-height: 53px;
}
.Manual{
 float:right;
 color:#26a2ff;
 padding: 0 5px;
 margin-top: 8px;
 height: 40px;
 line-height: 40px;
 border: 1px solid #26a2ff;
}
</style>

