<template>
  <section id="new-add">

    <header class="mint-header border-bottom">
      <div class="mint-header-button is-left">
        <a href="#/" class="router-link-active">
           <i class="mintui mintui-back"></i>
        </a>
      </div>
      <h1 class="mint-header-title">添加信用卡</h1>
    </header>

      <section class="container">
        <div class="username border-bottom">
          <label>本人姓名</label>
          <div>
             {{username}}
          </div>
        </div>
        <div class="sfz border-bottom">
          <label>身份证号</label>
          <div>
            {{sfz}}
          </div>
        </div>
        <div class="cdname border-bottom">
          <label>银行名称</label>
            <div  v-bind:class="{'moren1':flag1}"    id="BankName" @click="choosebn($event)">{{showBankName}}</div>
        </div>
        <div class="cdnum border-bottom" style="padding:8px 0;">
          <label>银行卡号</label>
          <div>
            <input type="text" placeholder="您的信用卡号码"    v-model.trim="user.cardNo">
          </div>
        </div>
       <div class="youxiao clearfix  border-bottom " style="padding:8px 0;">
          <label >有效期</label>
          <div   v-bind:class="{'moren2':flag2}"  id="Validityperiod"  @click="chooseValidityperiod($event)">
            {{showpickmonth}} {{showpickyear}}
          </div>

       </div>

        <div class="safe border-bottom border-top" style="padding:8px 0;">
          <label>安全码</label>
          <div>
            <input type="text"    placeholder="信用卡背面后三位数字"  v-model.trim="user.ccv">
          </div>
        </div>
      <!-- 账单日 -->
          <div class="zdr border-bottom">
          <label>账单日</label>
            <div   v-bind:class="{'moren3':flag3}"  id="StatementDate"  @click="chooseStateDate($event)">{{showStatementDate}}</div>

        </div>
      <!-- 还款日 -->
         <div class="hkr border-bottom">
          <label>还款日</label>
          <div>
             <div  v-bind:class="{'moren4':flag4}"    id="RepaymentDate"  @click="chooseRepayDate($event)">{{showRepaymentDate}}</div>
          </div>
        </div>

        <div class="yuliu border-bottom" style="padding:8px 0;">
          <label>预留号码</label>
          <div>
            <input type="text" placeholder="信用卡预留手机号"      v-model.trim="user.phone">
          </div>
        </div>
        <div class="yz border-bottom">
              <label>验证码</label>
              <input type="text" placeholder="验证码" v-model.trim="yz"   v-bind:style="{background:'#fff'}">
              <div class="yzclk" @click="send" v-bind:style="{border:'none',background:'#fff',color:'#26a2ff'}">
                  <span  v-bind:style="{color:'#999'}"    v-if="sendMsgDisabled">{{time+'秒后可以再次获取'}}</span>
                  <span v-if="!sendMsgDisabled">获取验证码</span>
              </div>
          </div>
        </div>


      </section>
        <button id="last" type="primary" @click="completed"  >完成</button>

          <picker v-model="visible" :data-items="items" @change="onValuesChange">
            <div class="top-content" slot="top-content">
              <div class="clearfix"    style="background:#45adfd;">
                 <div style="float:left;font-size:17px;width:50%;height:40px;text-align:center;line-height:40px;color:#fff;"  @click='cancel'>取消</div>
                <div style="float:right;font-size:17px;width:50%;height:40px;text-align:center;line-height:40px;color:#fff;"  @click='sure'>确定</div>
              </div>
            </div>

          </picker>

           <picker v-model="yxq" :data-items="yxqitem" @change="onyxqChange">
              <div class="top-content" slot="top-content">
                 <div class="clearfix"   style="background:#45adfd;">
                   <div style="float:left;font-size:17px;width:50%;height:40px;text-align:center;line-height:40px;color:#fff;"  @click='Validitycancel'>取消</div>
                   <div style="float:right;font-size:17px;width:50%;height:40px;text-align:center;line-height:40px;color:#fff;"   @click='Validitysure'>确定</div>
                 </div>
              </div>

          </picker>
  </section>

</template>

<script>
import { Toast } from 'mint-ui';
import picker from 'vue-3d-picker';
var banknameArray=["工商银行","农业银行","中国银行","建设银行","招商银行","邮政储蓄","中信银行","光大银行","交通银行","兴业银行","民生银行",
      "平安银行","广发银行","北京银行","华夏银行","浦发银行","上海银行","渤海银行","江苏银行"]
var StatementDateArray=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
var RepaymentDateArray=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
var month=['01','02','03','04','05','06','07','08','09','10','11','12']
var year=['17','18','19','20','21','22','23','24','25','26','27','28','29','30']

var who; //判断用户点击的是哪一个
export default {
  data() {
    return {
      //姓名
      username: "名字",
      //身份证
      sfz: "321023********6666",
      user:{
      //用户id路由传过来
      userId:"",
      //银行名称
      bankId:"",
      //信用卡号
      cardNo:"",
      //有效期
      expire:"",
      //后三码
      ccv:"",
      //账单日
      billDate:"",
      //还款日
      payDate:"",
      //手机号码
      phone:""
      },
      //手机验证码
      yz:"",
      //卡片id 调用一次请求拿
      cardId:"",
      //倒计时
      time:60,
      //防止多次点击完成
      canbind:true,
      sendMsgDisabled:false,
      //视图显示的银行数据
      showBankName:"请选择银行",
      //视图显示的还款日数据
      showStatementDate:"请选择账单日",
      //视图显示的还款日
      showRepaymentDate:"请选择还款日",
      showpickmonth:"请选择有效期(mmyy)",
      showpickyear:"",
      //控制类名颜色
      flag1:true,
      flag2:true,
      flag3:true,
      flag4:true,
      //控制单选弹出框的显示
      visible:false,
      //控制有效期弹出框的显示
      yxq:false,
      onechoosenPicker:"",
      monthchoosenPicker:'',
      yearchoosenPicker:'',
      items: [
        {
          values:banknameArray,

        },
      ],
      yxqitem:[
         {
          values:month,
        },
        {
          values:year,
        },
      ]
    }
  },
  components:{
     picker
  },
  created:function(){





     //已进入页面拿本地存储的userId提交参数做准备
    this.user.userId=JSON.parse(window.localStorage.userinfo).id
    this.username=JSON.parse(window.localStorage.userinfo).name
    this.sfz=JSON.parse(window.localStorage.userinfo).idCard
  },
  methods: {
    onValuesChange(result1) {
      //单选赋值给data
      this.onechoosenPicker=result1
    }
    ,
    onyxqChange(month,year){
       console.log(month,year);
        this.yearchoosenPicker= year
        this.monthchoosenPicker=month
    },
    send() {//发送验证码的点击事件
    if(this.sendMsgDisabled){//正在倒计时
            return
        }
         console.log(this.user)
        console.log("绑定事件")
        if(this.user.bankId===""){
            Toast({
            message: '请选择银行名称',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.cardNo===""){
            Toast({
            message: '请填写信用卡号',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.expire===""){
            Toast({
            message: '请选择有效期',
            position: 'center',
            duration: 1000
         })
         return
        }
         if(this.user.ccv===""){
            Toast({
            message: '请填写安全码(信用卡背面后三位数字)',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.billDate===""){
            Toast({
            message: '请选择账单日',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.payDate===""){
            Toast({
            message: '请选择还款日',
            position: 'center',
            duration: 1000
         })
         return
        }

        if(this.user.phone===""){
            Toast({
            message: '请填写预留手机号',
            position: 'center',
            duration: 1000
           })
         return
        }
        if(/^1\d{10}$/.test(this.user.phone)){

        }else{
           Toast({
              message: '请填写正确的11位手机号',
              position: 'center',
              duration: 1000
            })
            return
        }
       console.log(this.user)
    //     //发送验证码请求
      this.$http.post('/ak/api/card/create',
      this.transformRequest(this.user)
    ).then(function (res) {
          console.log(res)
       if(res.data.code==1){//发送成功获得卡片id复制给data里面后来要传的为完成按钮做准备
           this.user.cardId=res.data.data
           console.log( this.cardId)
           let me = this;
            me.sendMsgDisabled = true;
            let interval = window.setInterval(function() {
            if ((me.time--) <= 0) {
              me.time = 60;
              me.sendMsgDisabled = false;
              window.clearInterval(interval);
                  }
            }, 1000);
       }else{
          Toast({
            message: res.data.msg,
            position: 'center',
            duration: 1000
         })
       }
    }.bind(this))
    .catch(function(error){
         console.log(error);
    });



   },
   completed(){
        console.log("完成事件")
        if(this.user.bankId===""){
            Toast({
            message: '请选择银行名称',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.cardNo===""){
            Toast({
            message: '请填写信用卡号',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.expire===""){
            Toast({
            message: '请选择有效期',
            position: 'center',
            duration: 1000
         })
         return
        }
         if(this.user.ccv===""){
            Toast({
            message: '请填写安全码(信用卡背面后三位数字)',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.billDate===""){
            Toast({
            message: '请选择账单日',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.payDate===""){
            Toast({
            message: '请选择还款日',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(this.user.phone==="" ){
            Toast({
            message: '请填写预留手机号',
            position: 'center',
            duration: 1000
         })
         return
        }
        if(/^1\d{10}$/.test(this.user.phone)){

        }else{
           Toast({
              message: '请填写正确的11位手机号',
              position: 'center',
              duration: 1000
            })
            return
        }
        if(this.yz===""){
            Toast({
            message: '请填写验证码',
            position: 'center',
            duration: 1000
         })
           return
        }

       //完成发送绑定请求给user对象添加验证码
     this.user.code=this.yz;
     console.log(this.user)
     console.log(this.canbind)
     if( this.canbind ){
       console.log('进入请求了')
       this.canbind=false;
       this.$http.post('/ak/api/card/bind',
       this.transformRequest(this.user)
        ).then(function (res) {
          console.log(res)
          if(res.data.code==1){
             //跳转到信用卡列表
              Toast({
                message: '绑定成功',
                position: 'center',
                duration: 1000
            })
             this.$router.push({"path":'/'});
          }else{
            Toast({
                message: res.data.msg,
                position: 'center',
                duration: 1000
              })
            setTimeout(()=>{
              this.canbind=true;
            },2000)
          }
    }.bind(this))
    .catch((error)=>{
      console.log(error);
      this.canbind=true;
    });

    }
   },
   queryBankId(pickvalue){//查询银行对应id的下标的方法
    for (var index = 0; index < banknameArray.length; index++) {
      var element = banknameArray[index];
      if (element === pickvalue) {
        return index + 1;
      }
    }
   },
   sure(  ){//确认银行卡选择还有账单日还款日选择
    if(who.id=="BankName"){
        console.log('银行')
        this.user.bankId=this.queryBankId( this.onechoosenPicker);//银行卡名称回调函数特殊处理赋值传给后台的真实id
        console.log( this.user.bankId)
        //更银行卡名称的视图
        this.showBankName = this.onechoosenPicker;
        this.flag1=false;
     }
     else if(who.id=="StatementDate"){
        console.log(who.id)
         //更新账单日提交的数据
        this.user.billDate= this.onechoosenPicker;
        //更新账单日视图
        this.showStatementDate=  this.onechoosenPicker;
         this.flag3=false;
     }else if(who.id=="RepaymentDate"){
         console.log(who.id)
          //更新还款日提交数据
        this.user.payDate= this.onechoosenPicker;
        //更新还款日视图
        this.showRepaymentDate= this.onechoosenPicker;
        this.flag4=false;
     }
        this.visible=false
   },
   cancel( ){//取消银行卡选择
      this.visible=false
   },
   choosebn($event){//点击弹出银行名称框
       who = $event.target
       this.items[0].values=banknameArray
       this.visible=true
   },
   chooseStateDate($event){//账单日弹出
        who = $event.target
         this.items[0].values=StatementDateArray
        this.visible=true

   },
   chooseRepayDate($event ){//还款日弹出
        who = $event.target
        this.items[0].values=RepaymentDateArray
        console.log( this.items[0].name)
        this.visible=true
   },
   chooseValidityperiod( $event){//弹出有效期的事件
        this.yxq=true;
   },
   Validitysure(){//有效期的确认事件
      //赋值传给后台的数据
      this.user.expire = this.monthchoosenPicker+this.yearchoosenPicker
      console.log(this.monthchoosenPicker)
       console.log( this.user.expire)
      console.log(this.user);
      //更新视图
      this.showpickyear=this.yearchoosenPicker;
      this.showpickmonth=this.monthchoosenPicker;
      this.flag2=false;
      this.yxq=false
   },
   Validitycancel(){//有效期的取消事件
       this.yxq=false
   }
  },

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
section{
  height:100%;
}
.picker-backdrop{
      position:fixed;
}
#new-add .container{
 background-color: #fff;
}
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

#new-add div.border-bottom {
   padding: 13px 0;
}

#new-add div.border-bottom label {
  width: 80px;
  height: 30px;
  line-height: 30px;
  float: left;
  font-size: 15px;
}
#new-add .sfz label{
  line-height:20px !important;
}
#new-add .username label {
 line-height: 20px !important;
}
#new-add div.border-bottom >div {
  overflow: hidden;
  font-size: 15px;
}

#new-add div.border-bottom >div input {
  width: 100%;
  height: 30px;
  font-size: 15px;
}
#new-add  .container{
   padding: 0px 15px;
}
.mint-button--normal{
  width: 90%;
  display: block;
  margin: 30px auto;
  border-radius:20px;
}
.yz.border-bottom>label{
  line-height: 20px !important;
}
.yz.border-bottom>.yzclk{
  position: absolute;
  right:20px/* 20/25 */;
  top:25%;
}
#yxq>label{
   float: left;
   height: 24px /* 24/25 */!important;
   width: 70px/* 70/25 */!important;
   line-height:24px /* 24/25 */!important;
}
#yxq>div{

}
#yxq>div>span{
  text-indent: 8px/* 8/25 */;
  display: inline-block;

}
#yxq{
 padding: 10px  0!important;
}
#last{
  display: block;
  width: 80%;
  height: 50px /* 50/25 */;
  font-size: 20px /* 20/25 */;
  background: rgb(38, 162, 255);
  color:#fff;
  margin: 0 auto;
  border-radius: 40px /* 40/25 */;
  margin-top: 30px/* 30/25 */;
}
.active{
  visibility: hidden;
}
.cdname>label{
  margin-top:-2px /* 3/25 */;
}
.mask,.mask2{
  position: fixed;
  bottom: 0rem /* 0/25 */;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: rgba(0,0,0,0.7);
}
.choosenlaber .pd-select-item{
  position:fixed;
  bottom:0 /* 200/25 */;
  z-index: 99;
}
.choosen {
  position:fixed;
  bottom:209px /* 160/25 */;
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
/*有效期的样式*/
.youxiao{

}
.youxiao label{
   width: 80px;
   height: 30px;
  line-height: 30px;
  float: left;
  font-size: 16px;
}
.youxiao div{
  overflow: hidden;
  font-size: 15px;
  height: 30px;
  line-height: 30px;
   font-size: 16px;
}
.zdr label{
margin-top: -4px;
}
.hkr label{
margin-top: -4px;
}
/*有效期的弹出框的样式*/
.Validityperiod{

}
.Validityperiod .cho {
  position:fixed;
  bottom: 208px;
  z-index: 99;
  width: 100%;
  height: 50px/* 50/25 */;
  border-top:1px/* 1/25 */ solid #2c97f1;

}
.Validityperiod .cho .Validitysure{
  width: 50%;
  color:#fff;
  float: left;
  font-size:17px/* 17/25 */;
  height: 40px/* 40/25 */;
  background-color:#2c97f1;
}
.Validityperiod .cho .Validitycancel{
  width: 50%;
  float: left;
  color:#fff;
  font-size: 17px /* 17/25 */;
  height: 40px/* 40/25 */;
  background-color:#2c97f1;
}
.Validityperiod .aa{
    position: fixed;
    left: 0px;
    bottom: 0px;
    z-index: 99;
    width: 100%;
}
.moren1{
  color: #999;
}
.moren2{
  color: #999;
}
.moren3{
  color: #999;
}
.moren4{
  color: #999;
}
</style>
