<template>
  <section id="cp-container">
       <header class="mint-header border-bottom">
          <div class="mint-header-button is-left">
            <a href="#/" class="router-link-active">
              <i class="mintui mintui-back"></i>
            </a>
          </div>
          <h1 class="mint-header-title">信用卡详情</h1>
        </header>

      <div class="list" v-if="operationCard">
        <ul>
          <li>
            <div class="topView" v-bind:style="{backgroundColor:operationCard.bankColor}">
              <img :src="'../../../static/bank/bank' + operationCard.bankId + '.png'" alt="">
              <label>{{operationCard.bankName}}</label>
            </div>
            <div class="cardView">
              {{operationCard.cardNo}}
            </div>
            <div class="billView">
              <label class="leftLab">账单日<br>
                <span v-if="operationCard.billDate">{{operationCard.billDate}}号</span>
                </label>
              <label class="rightLab">还款日<br>
                <span v-if="operationCard.paymentDate">{{operationCard.paymentDate}}号</span>
              </label>
            </div>

            <div class="ed-dl">
                <div class="ed" @click="edit">编辑</div>
                <div class="dl" @click="kill">删除</div>
            </div>
          </li>
        </ul>
      </div>



          <picker v-model="mask" :data-items="paylist" @change="onpaylistChange">
              <div class="top-content" slot="top-content" style="position: absolute;width: 100%;top: -42px;
    z-index: 1000;">


                 <div class="clearfix" style="background:#45adfd;">
                   <div @click='cancel' style="float:left;font-size:17px;width:50%;height:40px;text-align:left;padding-left:18px;line-height:40px;color:#fff;">取消</div>
                   <div @click='sure'   style="float:right;font-size:17px;width:50%;height:40px;line-height:40px;text-align:right;padding-right:18px;color:#fff;">确定</div>
                 </div>
                 <div class="clearfix" style="background:#fff;border-bottom:1px solid #999;">
                   <div style="float:left;font-size:17px;width:50%;height:40px;text-align:left;padding-left:18px;line-height:40px;">账单日</div>
                   <div style="float:right;font-size:17px;width:50%;height:40px;text-align:right;padding-right:18px;line-height:40px;">还款日</div>
                 </div>
              </div>
          </picker>

  </section>

</template>

<script>
import { MessageBox } from 'mint-ui';
import picker from 'vue-3d-picker';
import { Toast } from 'mint-ui';
export default {
  data() {
    return {
        paylist:[
          {
          values:Array.from({length: 28}, (value, index) =>1 + index ),
          },
          {
            values:Array.from({length: 28}, (value, index) =>1 + index),
          },
        ],
        operationCard:{

        },
        selBillData:"",
        selPaymentDate:"",
        //遮罩层
        mask:false,
    }
  },
   components:{
     picker
  },
  methods: {
    onpaylistChange(bills,pay){
        this.selBillData=bills
        this.selPaymentDate=pay
    },
    sure:function(){
    //求该账单日还款日的接口数据来自上个页面的本地存储
    this.mask=false;
    var  params={
      cardId:this.operationCard.id,
      billDate:this.selBillData,
      payDate:this.selPaymentDate
    }

    this.$http.post('/ak/api/card/modify',
      this.transformRequest(params)
    ).then(function (res) {
       if(res.data.code===1){//请求成功后修改本地存储并且跟新视图
          console.log(res)
          this.operationCard = JSON.parse(localStorage.getItem("cardItem"))
          this.operationCard.billDate = this.selBillData;
          this.operationCard.paymentDate = this.selPaymentDate;
          Toast({
            message:'账单日还款日,修改成功!',
            position: 'center',
            duration: 1000
          })
       }
       else{
        Toast({
            message:res.data.msg,
            position: 'center',
            duration: 1000
          })
        }
    }.bind(this))
    .catch(function(error){
      // 处理getJSON和前一个回调函数运行时发生的错误
      console.log(error);
    });

    },
    edit(){//编辑按钮的事件
      this.mask=true;
    },
    kill(){//删除信用卡接口
      MessageBox.confirm('确定执行此操作?').then(
          yes=>{
            console.log('确认删除')
             var  params={
                cardId:this.operationCard.id,
              }
            this.$http.post('/ak/api/card/delete',
              this.transformRequest(params)
            ).then(function (res) {
              console.log(res)
              if(res.data.code===1){//请求成功后修改本地存储并且跟新视图
                this.operationCard=""//删除试图
                this.$router.push('/')
              }else{
                Toast({
                    message:res.data.msg,
                    position: 'center',
                    duration: 1000
                })
              }
            }.bind(this))
            .catch(function(error){
              // 处理getJSON和前一个回调函数运行时发生的错误
              console.log(error);

            });
          },
          no=>{
          console.log('取消删除')
          }
      );
    },
    cancel:function(){
       this.mask=false;
    },
  },
  created( ) {
   //进入页面获取上个页面的银行卡信息，保存到当前页面的一个data属性中
    this.operationCard = JSON.parse(localStorage.getItem("cardItem"))
        console.log(  this.operationCard )
  },
  update(){

  },
  destroyed(){
     localStorage.removeItem("cardItem");
  },
  mounted() {

  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mint-header-button{
  flex:none;
}
.mint-header-button .mintui{
  font-size: 20px;
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
#cp-container>.mint-header {
  background-color: #fff;
  color: #333;
  font-size: 17px;
}
#cp-container .list ul li{
  margin: 10px;
  background-color: white;
  height: 185px;
  border-radius: 10px;
}

#cp-container .list .topView{
  background-color: cyan;
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
  font-size: 18px;
  letter-spacing:3px;
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
  display: inline-block;
  margin-top: 5px;
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
  display: inline-block;
  margin-top: 5px;
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
  color: blue;
  border: none;
  background-color: #fff;
  outline: none;
}

#cp-container .list .bottomBtn .leftBtn
{
  margin-right: 20px;
  font-size: 15px;
  float: right;
  color: #999;
  border: none;
  background-color: #fff;
  outline: none;
}
#cp-container .ed-dl{
  display: flex;
  justify-content:flex-end;
  padding-top:3px;
}
#cp-container .ed-dl .ed{
  flex-basis:80px;
  color:#0678d0;
  text-align: center;
  height: 30px;
  line-height: 30px;
  border:1px solid #45adfd ;
  border-radius: 5px;
   font-size: 13px;
   margin-right: 10px;
}
#cp-container .ed-dl .dl{
  flex-basis:80px;
  color:#0678d0;
  text-align: center;
  height: 30px;
  line-height: 30px;
  border:1px solid #45adfd;
  border-radius: 5px;
  font-size: 13px;
   margin-right: 12px;
}

/* 模态框样式 */

.ss{
  position: fixed;
  bottom: 0rem ;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: rgba(0,0,0,0.7);
}
.choosen {
  position:fixed;
  bottom: 208px;
  z-index: 99;
  width: 100%;
  height: 50px/* 50/25 */;
  border-top:1px/* 1/25 */ solid #2c97f1;

}
.choosen .sure{
  width: 50%;
  color:#fff;
  float: left;
  font-size:17px/* 17/25 */;
  height: 40px/* 40/25 */;
  background-color:#2c97f1;
}
.choosen .cancel{
  width: 50%;
  float: left;
  color:#fff;
  font-size: 17px /* 17/25 */;
  height: 40px/* 40/25 */;
  background-color:#2c97f1;
}
.aa{
    position: fixed;
    left: 0px;
    bottom: 0px;
    z-index: 99;
    width: 100%;
}

</style>
