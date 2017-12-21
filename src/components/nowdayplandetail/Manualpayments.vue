<template>
   <section>
      <header class="mint-header border-bottom">
      <div class="mint-header-button is-left">
        <div @click="back"  class="router-link-active">
           <i class="mintui mintui-back"></i>
        </div>
      </div>
      <h1 class="mint-header-title">手动消费</h1>
    </header>

       <div class="consume">
         <div class="consumeChild">
           <div>{{type===0?'消费金额':'还款金额'}}</div>
            <div>
                {{consumption/100}}
            </div>
         </div>
       </div>

       <div class="bkinfo clearfix">
         <div>{{bankName}}</div>
         <div>尾号{{tail}}</div>
       </div>

       <div @click="surePay" class="surePay">
         确认支付
       </div>
   </section>
</template>
<script>
import { MessageBox } from 'mint-ui';
import { Toast } from 'mint-ui';
export default {
    data(){
      return{
       consumption:"",
       bankName:'',
       tail:'',
       type:"",
       canpay:true
      }
    },
    mounted ( ){
        //详情接口
        this.type=parseInt(this.$route.query.stu) ;

      this.$http.get('/ak/api/plan/manualDetail',{
        params: {
          detailId:this.$route.query.ManualPay
        }
      }).then((res)=>{
          if(res.data.code==1){
           console.log( res)
           if(parseInt(this.$route.query.stu) === 0){//如果是消费失败取下面字段
            this.consumption=res.data.data.amount
           }else{
            this.consumption=res.data.data.actualAmount
           }
            this.bankName=res.data.data.bankName;
            this.tail=res.data.data.cardNo;

          }else{
            Toast({
              message:res.data.msg,
              position: 'center',
              duration: 1000
            })
          }
       }).catch((res)=>{

       })

    },
    methods:{
      back(){
        console.log(1)
          this.$router.go(-1)
      },
      surePay(){ //发送手动消费的接口
        //拿请求参数
          MessageBox.confirm('确定执行此操作?').then(
          yes=>{
            if(!this.canpay){//防止多次点击处理
               return  
            }
            this.canpay=false;
            console.log('确认删除')
            console.log( this.$route.query.ManualPay)
            var obj={
              detailId:this.$route.query.ManualPay
            }
            console.log( yes+'----' )
            this.$http.post('/ak/api/plan/manualExec',
              this.transformRequest(obj)
            ).then((res)=>{
              if(res.data.code==1){
                  Toast({
                  message:'手动操作成功',
                  position: 'center',
                  duration: 1000
                })

                this.$router.push('/')
              }else{
                Toast({
                  message:res.data.msg,
                  position: 'center',
                  duration: 1000
                })
                this.canpay=true;
              }
            }).catch((res)=>{
                this.canpay=true;
            })
          },
          no=>{
            console.log('取消删除')
          }
       );
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
.consume{
  height: 200px;
  display:flex;/*Flex布局*/
  display: -webkit-flex; /* Safari */
  align-items:center;/*指定垂直居中*/
  justify-content:center;
  background: #fff;
  margin-bottom: 6px;
}
.consumeChild div:nth-child(1){
  text-align: center;
  height: 30px;
   line-height:30px;
}
.consumeChild div:nth-child(2){
  font-size: 35px;
  letter-spacing:5px;
}
.bkinfo{
  background: #fff;
  height: 40px;
  line-height: 40px;
}
.bkinfo div:nth-child(1){
  float: left;
  padding-left: 18px;
}
.bkinfo div:nth-child(2){
   float: right;
   padding-right: 18px;
}
.surePay{
  width: 90%;
  background: #26a2ff;
  margin: 0 auto ;
   margin-top: 30px;
  height: 40px;
  color: #fff;
  text-align: center;
  line-height: 40px;
  border-radius: 30px;
}
</style>


