<template>
  <section id="cp-container">

   <header class="mint-header border-bottom">
      <div class="mint-header-button is-left">
        <a href="#/" class="router-link-active">
        </a>
      </div>
      <h1 class="mint-header-title">信用卡管理</h1>
    </header>
     <div class="list" v-if="this.creditCardList.length > 0">
        <ul>
          <li v-for="(item,index) in creditCardList" @click="clickCard(item)">
            <div class="topView" v-bind:style="{backgroundColor:item.bankColor}">
              <img :src="'../../../static/bank/bank' + item.bankId + '.png'" alt="">
              <label>{{item.bankName}}</label>
            </div>
            <div class="cardView">
              {{item.cardNo}}
            </div>
            <div class="billView">
              <label class="leftLab">账单日<br><span>{{item.billDate}}号</span></label>
              <label class="rightLab">还款日<br><span>{{item.paymentDate}}号</span></label>
            </div>

            <div class="bottomBtn">
              <button class="rightBtn" @click.stop="repaymentPlan(item)">还款计划</button>
              <button class="leftBtn" :class="{ isplanStatus:item.planStatus}"  @click.stop="makePlan(item)">制订计划</button>
            </div>
          </li>
        </ul>
     </div>



    <button class="addBtn"  @click="addCredictCard"></button>
      <div class="text" >
        添加信用卡
      </div>
  </section>
</template>

<script>
import { Toast } from 'mint-ui';
//http://172.31.0.188:8081/#/?feeRate=0.006&fee=100&outUserId=9999&name=%E8%B0%AD%E4%BA%AE&idCard=321023199308243414&minMoney=500000&maxMoney=1000000
export default {
  data () {
    return {
     isHaveCard:true,
     creditCardList:[],
     isShowAdd:false,
     plansstatus:"",

    }
  },
 created(){//使用外部跳转路径参数check用户是否存在

    //获取用户信息
    this.getUserInfo();
    //获取配置信息
    this.getConfigInfo();

 },
 mounted( ){

 },
  computed:{
   ishaveplan: {
      get:function( ){
         return
      }
   }
  },
  methods:{
    //获取用户信息
    getUserInfo(){
      //如果有路由参数
    if( this.$route.query.outUserId ){

    console.log(this.$route.query)
    var check={
      outUserId:this.$route.query.outUserId,
      name:this.$route.query.name,
      idCard:this.$route.query.idCard

    }
    console.log(check)
    console.log('上面是check获取的对象')
      console.log('有路由参数----')
      this.$http.post('/ak/api/user/check',
      this.transformRequest(check)
    )
    .then((res) => {
       console.log(res.data)
       console.log("上面是验证出来的用户id")
       if(res.data.code == 1){
         //配置用户信息
          var useObj = {
            id:res.data.data,
            name:this.$route.query.name,
            idCard:this.$route.query.idCard,
            feeRate:this.$route.query.feeRate,
            fee:this.$route.query.fee,
            minMoney: this.$route.query.minMoney,
            maxMoney: this.$route.query.maxMoney,
          }
          //存储
          window.localStorage.userinfo = JSON.stringify(useObj)
          console.log(JSON.parse(window.localStorage.userinfo))
        //获取信用卡列表
         this.getCreditCardlist();
       }else{
           Toast({
            message:res.data.msg,
            position: 'center',
            duration: 1000
           })
       }
    })
    }
    else{
       //如果没直接去路由参数去本地拿
       this.getCreditCardlist( );
    }

    },
    //获取信用卡列表
    getCreditCardlist(){

      this.$http.get('/ak/api/card/list',{
      params: { //去本地那check存储的userid
        id: JSON.parse(window.localStorage.userinfo).id
      }}).then( (response)=>{
          if(response.data.code==1){
            //如果不存在会返回一个空数组
            console.log(response )
            this.creditCardList = response.data.data;
          }else{
             Toast({
                    message:res.data.msg,
                    position: 'center',
                    duration: 1000
              })
          }
        })
        .catch(function (error) {
            console.log(error);
        })
    },
    //获取配置信息
    getConfigInfo(){
      this.$http.get('/ak/api/config',{
      params:{

      }})
      .then( (response)=>{
          if(response.data.code == 1){
            console.log(response )
            //存储配置信息
            var config = {
                "id": response.data.data.id,
                "payAmountMin": response.data.data.payAmountMin, // 还款最低金额(分)
                "payAmountMax": response.data.data.payAmountMax, // 还款最高金额(分)
                "payTimeBegin": response.data.data.payTimeBegin, // 还款每天开始时间
                "payTimeEnd": response.data.data.payTimeEnd,     // 还款每天结束时间
                "payCountMin": response.data.data.payCountMin,   // 单日还款最少次数
                "payCountMax": response.data.data.payCountMax,   // 单日还款最多次数
                "consumeCountMin": response.data.data.consumeCountMin,// 单日消费最少次数
                "consumeCountMax": response.data.data.consumeCountMax,// 单日消费最多次数
                "createTime": response.data.data.createTime,
                "updateTime": response.data.data.updateTime
            }
            window.localStorage.config = JSON.stringify(config);
          }
        })
        .catch(function (error) {
            console.log(error);
        })
    },
    //添加信用卡
    addCredictCard(){
      if(!window.localStorage.userinfo ){
            Toast({
            message:'用户信息获取失败,请重试!',
            position: 'center',
            duration: 1000
           })
          return ;
      }
      this.$router.push({"path":'/newadd'})
    },
    //跳转卡片详情
    clickCard(item){
      //如果有执行计划就不跳转
      if(item.planStatus===1){
        return
      }
      localStorage.setItem("cardItem",JSON.stringify(item))
      this.$router.push({"path":'/carddetail'});
    },
    // 查看还款计划
    repaymentPlan(item){
       console.log(this.creditCardList)


      // 查看的时候携带动态路由传卡片id
      this.$router.push({ name: 'paymentStatus', query: {cardId: item.id}})

    },
     //制订计划
    makePlan(item){
       //如果plansstatus为1在执行
       if(item.planStatus===1){
          return
       }
       var nowdate=new Date();
       if ( item.paymentDate - nowdate.getDate()==1) {
          Toast({
            message:'还款日当天不能指定计划!',
            position: 'center',
            duration: 1000
           })
         return  ;
       }
       this.$router.push({"path":'/makeplan',query:{cardId:item.id,billDate:item.billDate,paymentDate:item.paymentDate}})
    }
  }

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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


#cp-container .list ul li{
  margin: 10px;
  background-color: white;
  height: 185px;
  border-radius: 10px;
}

#cp-container .list .topView{
  background-color: white;
  height: 60px;
  border-radius:10px 10px 0 0 ;
  display: -webkit-flex;
}
#cp-container .list .topView img{
  display: inline-block;
  width: 40px;
  height: 40px;
  margin: 10px 0 10px 20px;
}
#cp-container .list .topView label
{
  height: 40px;
  line-height: 40px;
  margin: 10px 20px 10px 10px;
  color: #fff;
  font-size: 16px;
}

#cp-container .list .cardView
{
  width: 100%;
  margin-top: 5px;
  color: #333;
  background: white;
  font-size: 20px;
  letter-spacing:2px;
  text-align: center;
}

#cp-container .list .billView{
  margin: 10px 20px 0 20px;
  display: -webkit-flex;
}

#cp-container .list .billView .leftLab{
  font-size: 14px;
  color: #999;
  width: 50%;
  display: inline;
}

#cp-container .list .billView .leftLab span{
  font-size: 18px;
  color: #333;
}

#cp-container .list .billView .rightLab{
  font-size: 14px;
  color: #999;
  text-align: right;
  width: 50%;
  display: inline;

}

#cp-container .list .billView .rightLab span{
  font-size: 18px;
  color: #333;
  text-align: right;
}

#cp-container .list .bottomBtn
{
  width: 100%;
  margin-top: 5px;
  background-color: blue;
}

#cp-container .list .bottomBtn .rightBtn
{
  margin-right: 20px;
  font-size: 15px;
  float: right;
  color: rgb(1, 143, 253);
  border: none;
  background-color: #fff;
  outline: none;
}

#cp-container .list .bottomBtn .leftBtn
{
  margin-right: 20px;
  font-size: 15px;
  float: right;
  color: rgb(1, 143, 253);
  border: none;
  background-color: #fff;
  outline: none;
}
#cp-container .list .bottomBtn .leftBtn.isplanStatus{
  color:#999;
}
#cp-container .addBtn
{
  background: url('../../../static/bank/+@3x.png') no-repeat;
  height: 50px;
  margin: 10px;
  display: block;
  width: 50px;
  background-size: contain;
  border-radius:15px;
  outline: none;
  border: none;
  margin: 0 auto;
}
.text{
  margin-top: 8px;
  text-align: center;
  font-size: 17px;
}
</style>
