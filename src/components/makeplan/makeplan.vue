<template>
  <section id="mp-content">

    <header class="mint-header border-bottom">
      <div class="mint-header-button is-left">
        <a href="#/" class="router-link-active">
           <i class="mintui mintui-back"></i>
        </a>
      </div>
        <h1 class="mint-header-title">新增还款计划</h1>

    </header>


    <div class="container">
        <!-- 还款金额 -->
        <div class="itemContent border-bottom">
          <label>还款金额</label>
          <div>
            <input type="number" placeholder="输入还款金额单位元" @keyup="handleFilterLetters" v-model="inputAmount">
            <span>元</span>
          </div>
        </div>

        <div class="itemContent border-bottom">
          <label>还款日期</label>
          <div class="datePicker">
            <!-- <flat-pickr class="form-control" v-model="selectDate" :config="config" placeholder="选择还款日期">
            </flat-pickr> -->
            <div  @click="chooseday(billDate,paymentDate)" class="form-control">
                    {{showdayStr}}
            </div>
            <img class="clearBtn" @click="clearData" src="../../../static/images/clearBtn.png" alt="">
          </div>
        </div>

        <div class="itemContent border-bottom">
          <label>还款笔数</label>
          <div>
            <button class="reduceBtn" @click="reduceTap">-</button>
            <label  class="showAmount">{{chooseNumber}}</label>
            <button class="plusBtn" @click="plusTap">+</button>
          </div>
        </div>
    </div>

    <button class="calcBtn" @click="beginCalcPayPlan">{{calcBtnTitle}}</button>


    <!-- 展示每天的计划 -->
    <div v-if="isShowDayPlan" class="showPlan">
        <div class="totalView">
            <div class="leftView">
                <label class="topText leftAlign">总还款笔数:{{chooseNumber}}笔</label>
                <label class="bottomText  leftAlign">费率：{{(rate*100).toFixed(2)}}%</label>
            </div>
            <div class="rightView">
                <label class="topText  rightAlign">手续费：{{rateAmount/100}}元</label>
                <label class="bottomText rightAlign">单笔手续费：{{fee/100}}元</label>
            </div>
        </div>
        <!-- 每天的计划显示 -->
        <div class="averView" v-for="(item,index) in dayObjArr">
            <div class="leftTextView">
                <label class="timeLab">{{item.day}}</label>
                <label class="amountLab">还款金额：¥{{item.totalRefund/100}}</label>
            </div>
            <div class="rightBtnView">
                 <button @click="everyDayDetail(item)">详情</button>
            </div>
        </div>

        <button class="generatePlan" @click="generatePlan">生成计划</button>

    </div>


    <!-- 展示详情的弹窗 -->
    <div class="mask" v-show="isShowDeail">

        <div class="modal-frame">
        <img class="closeBtn" @click="hideDetail" src="../../../static/images/maskClose.png" alt="">

        <div class="content">
            <div class="detail-Tleft">消费总额：¥{{this.selectItem.totalExpense/100}}</div>
            <div class="detail-Tright">笔数：{{selectItem.expenseCount}}笔</div>
        </div>

        <div class="expendDetail" v-for="(item,index) in selectItem.expense">
            <div class="top">{{item.expenseTimeStamp}}</div>
            <div class="bottom">消费金额：¥{{item.expenseFee/100}}</div>
            <div class="bottomLine"></div>
        </div>

        <div class="content">
            <div class="detail-Tleft">还款总额：¥{{this.selectItem.totalRefund/100}}</div>
            <div class="detail-Tright">笔数：{{selectItem.refundCount}}笔</div>
        </div>

        <div class="expendDetail" v-for="(item,index) in selectItem.refund">
            <div class="top">{{item.refundTimeStamp}}</div>
            <div class="bottom">还款金额：¥{{item.refundAcMoney/100}}</div>
            <div class="bottomLine"></div>

        </div>
    </div>

    </div>


    <!-- 选择天数的试图 -->
    <article v-show="isShowdatepicker">
           <table class="table1" v-show="lastArray.length>0">
            <tr>
              <th> {{curyymm}}</th>
            </tr>
            <tr class="lastmonth clearfix"   style="display: block;padding:5px  0px 0px 16px;" >
        
               <td :class="{isChoose : lastmonth.isSelected}"  v     @click="chosenlastmonth(lastmonth)" v-for="lastmonth in lastArray">{{lastmonth.data | capitalize}}</td>
            </tr>
          </table>

          <table class="table2" v-show="nextArray.length>0">
            <tr>
              <th> {{nextyymm}}</th>
            </tr>
            <tr class="nextmonth clearfix" style="display: block;padding:5px  0px 0px 16px;" >
                 
                <td  :class="{isChoose : nextmonth.isSelected}"     @click="choosennextmonth(nextmonth)"  v-for="nextmonth in nextArray">{{nextmonth.data | capitalize}}</td>
            </tr>
          </table>

          <div class="canelOrSure">
              <div class="canel"      @click="canelPickerDay">取消</div>
             <div class="showResult"  @click="showResult">确认</div>
          </div>


        </article>
        <div class="datemask" v-show="isShowdatepicker">

        </div>

  </section>

</template>

<script>

import { Toast } from 'mint-ui';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
require("flatpickr/dist/themes/material_blue.css");
export default {
  data () {
    return {
    //计算按钮的标题
    calcBtnTitle:"计算",
    //calc property
    averNumArr:[],//存放所有比数的数组
    dayObjArr:[],//自己拼接对象数组
    tmpDayPlanArr:[],//临时计划数据
    //每天还款笔数的随机数组
    everyDayPayRandomArr:[],
    //每笔的平均金额
    averNumAmount:0.00,
    //是否显示每天的计划
    isShowDayPlan:false,
    /* 动态数据 */
    //输入的金额
    inputAmount:"",
    //选择的比数
    chooseNumber:1,
    //配置的费率
    rate:'',
    fee:'',
    rateAmount:0.00,

    //是否展示详情
    selectItem:{},
    isShowDeail:false,

    //配置信息
    userInfo:{},
    localConfig:{},


    //选择天数数据
      billDate:"",
      paymentDate:"",
    //日历展示的上个月数组
      lastArray:'',
      //日历展示的下个月数组
      nextArray:"",
      //展示的年月
      curyymm:"",
      nextyymm:"",
      //上个月最终选到的值数组
      selectLastArr:[],
      //下个月最终选到的值数组
      selectNextArr:[],
      //最终选好的拼装数组
      selectDay:[],
      showdayStr:"请选择还款日期",
      //是否显示
      isShowdatepicker:false,
   }
  },
  mounted(){

    //去除存储的信息
    this.userInfo = JSON.parse(window.localStorage.userinfo);
    console.log( this.userInfo )
    this.localConfig = JSON.parse(window.localStorage.config);
    this.rate = this.userInfo.feeRate;
    this.fee = this.userInfo.fee;
    //获取账单日还款日
    this.billDate=this.$route.query.billDate;
     console.log(this.billDate)

    this.paymentDate=this.$route.query.paymentDate;
     console.log(this.paymentDate)
  },
  components: {
      flatPickr
  },
  methods:{

  surplusDay(){
  var today = new Date();
  var now = today.getDate();
  var year = today.getYear();
  if (year < 2000) year += 1900;
  var month = today.getMonth();
  var monarr = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
  if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) monarr[1] = "29";
     console.log((monarr[month]-now))
    return (monarr[month]+now);
 },
 clearData(){
     this.selectDay = [];
     this.showdayStr = '请选择还款日期';
     this.resetStatus();
     this.dayObjArr = [];
     this.isShowDayPlan = false;

 },
  //-点击
  reduceTap(){
    if (this.chooseNumber == 1) {
        Toast({
            message: '还款比数不得少于1笔',
            position: 'center',
            duration: 1000
         })
         return;
    };
    this.chooseNumber --;
  },
  //-点击
  plusTap(){
    this.chooseNumber ++;
  },
  //计算还款计划
  beginCalcPayPlan(){

      if (this.inputAmount.length == 0) {
          Toast({
            message: '请填写还款金额',
            position: 'center',
            duration: 1000
         })
         return;
      }
     //配置信息验证
     console.log(parseInt(this.inputAmount * 100));
      if (parseInt(this.inputAmount * 100) < parseInt(this.userInfo.minMoney)) {

          Toast({
            message: '还款金额不得少于'+parseInt(this.userInfo.minMoney)/100,
            position: 'center',
            duration: 1000
          })
          return;
      }

      if (parseInt(this.inputAmount * 100) > parseInt(this.userInfo.maxMoney)) {

          Toast({
            message: '还款金额不得多于'+parseInt(this.userInfo.maxMoney)/100,
            position: 'center',
            duration: 1000
          })
          return;
      }


        if (this.selectDay.length == 0) {
          Toast({
            message: '请选择还款日期',
            position: 'center',
            duration: 1000
         })
         return;
      }

     if (this.chooseNumber < this.selectDay.length) {
          Toast({
            message: '还款笔数不得少于所选天数',
            position: 'center',
            duration: 1000
          })
          return;
      }

     if (this.chooseNumber > 2*this.selectDay.length) {
          Toast({
            message: '还款笔数每天最多2笔',
            position: 'center',
            duration: 1000
          })
          return;
      }

      if (this.selectDay.length > 10) {
          Toast({
            message: '还款笔数不超过20笔',
            position: 'center',
            duration: 1000
          })
          return;
      }
    if (!this.rate || !this.fee) {
        Toast({
            message: '数据获取异常',
            position: 'center',
            duration: 1000
          })
        return;
      }



    this.calcBtnTitle = "重新计算";
      //##############生成计划#############
    this.toCalcCCPlan();


  },
  formatDate(dayStr){
       var date = new Date();
      return date.getFullYear()+"-"+dayStr;
  },
  //每天详情
  everyDayDetail(item){
      console.log('点击了每天详情');
     this.selectItem = item;
     this.isShowDeail = true;
     console.log(window.screen.height);
     document.querySelector('body').className='overflow'
     document.querySelector('html').className='overflow'
     document.querySelector('#app').className='overflow'
  },
  //生成计划
  generatePlan(){
     console.log('点击了生成计划');
     var param = {
        "cardId":this.$route.query.cardId,
        "fee":this.userInfo.fee,
        "feeRate":this.userInfo.feeRate,
        "plan":this.dayObjArr
    }
    console.log(JSON.stringify(param));
    this.$http.post('/ak/api/plan/create',
      param
    ).then(function (res) {//回掉函数
           //存储用户id
       console.log(res.data)
        if(res.data.code==1){
            Toast({
                message:'计划生成成功',
                position: 'center',
                duration: 1000
            })
           this.$router.push('/')
        } else{
            Toast({
                message:res.data.msg,
                position: 'center',
                duration: 1000
            })
        }


    }.bind(this))
    .catch(function(error){
       console.log(error+"---");
    })
  },
////////////////////////////////////////////////////////////////////////////////////////////////////
  toCalcCCPlan:function(){

      //随机生成选择比数的金额数据
      this.averNumArr = [];
      this.dayObjArr = [];
      console.log(this.chooseNumber);
      var actualTotalMoney = this.inputAmount*100  + this.chooseNumber * parseInt(this.fee);
      var actualMaxMoney = actualTotalMoney + this.inputAmount * 0.02;
      this.averNumAmount = (this.inputAmount*100)/this.chooseNumber;
      console.log('每笔的平均金额='+this.averNumAmount);
      console.log('每笔的平均金额1='+actualTotalMoney);
      console.log('每笔的平均金额2='+actualMaxMoney);
      //n-1笔金额总数
      var frontAmount = 0.00;
      for (let index = 0; index < this.chooseNumber; index++) {

          if (index < this.chooseNumber - 1) {

                //生成90～110随机数
                var randomAmount = this.getRandomNum(90,110)/100;
                console.log('随机数'+randomAmount)
               //金额整数
                var intAverAmount = parseInt(randomAmount * this.averNumAmount);
                if (this.contains(this.averNumArr,intAverAmount)) {
                   index --;
                }else
                {
                    this.averNumArr.push(intAverAmount);
                    frontAmount = frontAmount + intAverAmount;
                }

          } else {
              var rightRate = parseFloat (this.rate).toFixed(4);
              var reduceAmount = parseInt(this.inputAmount*100 - frontAmount);
              this.averNumArr.push(reduceAmount);

          }

      }

     //计算总的金额是否满足条件
     /*
      var ttt = 0;
      for (let index = 0; index < this.averNumArr.length; index++) {
        const element = this.averNumArr[index];
        ttt = ttt + parseInt(element);
         //console.log('每笔的随机金额='+element);
      }
         console.log('总共的还款金额='+ttt);
      */

      //开始计算每天的详细计划
      this.toCalcCCDayPlan();

  },
  //生成每天的具体计划
  toCalcCCDayPlan:function(){

     this.everyDayPayRandomArr = [];
    //  this.dayObjArr = [];
     //生成选择的天数 ～ 2*选择的天数 之间的随机数 将多余的比数随机分配到选择的天数
     console.log('随机数范围='+(this.chooseNumber - this.selectDay.length));
     for (let index = 0; index < (this.chooseNumber - this.selectDay.length); index++) {

            var num = this.getRandomNum(0,(this.chooseNumber - this.selectDay.length - 1));
            if(this.contains(this.everyDayPayRandomArr,num)){
                     index--;
            }else{
               this.everyDayPayRandomArr.push(num);
            }
     }

     //构造每天还款数据的对象
     for (let index = 0; index < this.selectDay.length; index++) {
       var obj = {
         "day": this.selectDay[index],
         "expenseCount": 1,
         "refundCount": 1,
         "totalRefund": 0.00,
         "totalExpense": 0.00,
         "expense": [],
         "refund": []
       };
          this.dayObjArr.push(obj);
      }

    // console.log(this.dayObjArr);

     //计算每天的还款比数
     for (let index = 0; index < this.everyDayPayRandomArr.length; index++) {
        const element = this.everyDayPayRandomArr[index];
        var obj = this.dayObjArr[element];
        obj.refundCount ++;
        this.dayObjArr[element] = obj;
      }

    for (let index = 0; index < this.dayObjArr.length; index++) {
         const element = this.dayObjArr[index];
         console.log('每天还款的比数='+JSON.stringify(element));
     }

    //组装每天计划的随机对象
    this.tmpDayPlanArr = this.averNumArr;
     //console.info("ddddd");
    // 还款每次的金额（不包含费率等）
    // console.table( this.tmpDayPlanArr);
    // for (let index = 0; index < this.averNumArr.length; index++) {
    //      const element = this.averNumArr[index];
    //      console.log('每天还款的比数='+(element));
    //  }
     //console.log(this.tmpDayPlanArr)

      var tmpNumber = 0;
      for (let index = 0; index < this.dayObjArr.length; index++) {
        const element = this.dayObjArr[index];
        //组装每天还款的随机对象
        var refundTotalMoney = 0;
        var startTimeRefund = element.day + " 14:00:00";
        var endTimeRefund = element.day + " 21:00:00";
        if (element.refundCount == 1) {

            var refundTimeStamp = this.generateRandomTimeStamp(startTimeRefund,endTimeRefund);
            // element.totalRefund = this.tmpDayPlanArr[tmpNumber];
            var acAmount = parseInt(this.tmpDayPlanArr[tmpNumber]);
            var tmpAmount = Math.ceil(acAmount * 1.0002) + parseInt(this.fee);
            // console.log("bbbb" + tmpAmount);
            // console.log("cccc" + acAmount);
            element.totalRefund =acAmount;
            element.refund = [{
              "refundMoney": tmpAmount,
              "refundAcMoney": acAmount,
              "refundTimeStamp": refundTimeStamp
            }];
            refundTotalMoney = tmpAmount;
            tmpNumber = tmpNumber + 1;
        }else
        {
            var refundTimeStamp1 = this.generateRandomTimeStamp(startTimeRefund, endTimeRefund);
            var refundTimeStamp2 = this.generateRandomTimeStamp(startTimeRefund, endTimeRefund);
            var acAmount1 = parseInt(this.tmpDayPlanArr[tmpNumber]);
            var tmpAmount1 = Math.ceil(acAmount1 * 1.0002) + parseInt(this.fee);
            var acAmount2 = parseInt(this.tmpDayPlanArr[tmpNumber+1]);
            var tmpAmount2 = Math.ceil(acAmount2 * 1.0002) + parseInt(this.fee);
            element.totalRefund = acAmount1 + acAmount2;
            element.refund = [{
              "refundMoney": tmpAmount1,
              "refundAcMoney": acAmount1,
              "refundTimeStamp": refundTimeStamp1
            }, {
              "refundMoney": tmpAmount2,
              "refundAcMoney": acAmount2,
              "refundTimeStamp": refundTimeStamp2
            }];
            refundTotalMoney = tmpAmount1 + tmpAmount2;
            tmpNumber = tmpNumber + 2;
        }


       //组装每天消费的随机对象
       var minconsumeCount = parseInt(this.localConfig.consumeCountMin);
       var maxconsumeCount = parseInt(this.localConfig.consumeCountMax);
       //console.log(this.localConfig);
       //console.log("最小消费="+minconsumeCount,"最大消费="+maxconsumeCount);
       var expenseRandom = this.getRandomNum(minconsumeCount,maxconsumeCount);
       //console.log("消费随机笔数="+expenseRandom);
       var expenseTmpTotal = refundTotalMoney;
       var expenseAver = expenseTmpTotal/expenseRandom;
       var expenseArray = new Array()
       var expenseTotalAmount = 0;

       var startTime = element.day + " 09:00:00";
       var endTime = element.day + " 14:00:00";
       if (expenseRandom === 1) {
         var refundTimeStamp = this.generateRandomTimeStamp(startTime,endTime);
         expenseArray.push({
           "expenseMoney":refundTotalMoney,
           "expenseFee":Math.ceil(expenseTmpTotal/(1 - this.rate)),
           "expenseTimeStamp":refundTimeStamp});
         expenseTotalAmount =  Math.ceil(expenseTmpTotal/(1 - this.rate));
         //给每天的数组赋值
         element.expenseCount = expenseArray.length;
         element.expense = expenseArray;
         element.totalExpense = expenseTotalAmount;
       } else {
         var expenseSum = 0;
         var expenseTotalSum = 0;
         for (let j = 0; j < expenseRandom; j++) {
           if (j < expenseRandom - 1) {
             var curAmount = this.getRandomNum(90, 110) / 100;
             var intAmount = parseInt(curAmount * expenseAver);
             var expenseFee = Math.ceil(intAmount / (1 - this.rate));
             var refundTimeStamp = this.generateRandomTimeStamp(startTime, endTime);
             expenseArray.push({
               "expenseMoney": intAmount,
               "expenseFee": expenseFee,
               "expenseTimeStamp": refundTimeStamp
             });
             expenseSum = expenseSum + intAmount;
             expenseTotalSum = expenseTotalSum + expenseFee;

           } else {
             var lastAmount = parseInt(expenseTmpTotal - expenseSum);
             var expenseFee = Math.ceil(lastAmount / (1 - this.rate));
             var refundTimeStamp = this.generateRandomTimeStamp(startTime, endTime);
             expenseArray.push({
               "expenseMoney": lastAmount,
               "expenseFee": expenseFee,
               "expenseTimeStamp": refundTimeStamp
             });
             expenseTotalSum = expenseTotalSum + expenseFee;
           } // end of if
           console.log('每天消费的金额=' + expenseTotalAmount);
           //给每天的数组赋值
           element.expenseCount = expenseArray.length;
           element.expense = expenseArray;
           element.totalExpense = expenseTotalSum;
         } // end of for
       }

    }
    //显示计划
    this.isShowDayPlan = true;

    //计算费率
    //打印具体的计划
    var totalFate = 0.0;
    for (let index = 0; index < this.dayObjArr.length; index++) {
        const element = this.dayObjArr[index];
        for (let index = 0; index < element.expense.length; index++) {
          const exp = element.expense[index];
          totalFate = totalFate + exp.expenseFee;
        }
        //console.log('每天还款的详细计划='+JSON.stringify(element));
    }
    this.rateAmount = parseInt(totalFate) - parseInt(this.inputAmount *100) ;
    console.log('计划乡详情='+JSON.stringify(this.dayObjArr));
    

  },
////////////////////////////////////////////////////////////////////////////////////////////////////
   //获取一定范围内的随机数
    getRandomNum(Min,Max)
      {
        var Range = Max - Min;
        var Rand = Math.random();
        return(Min + Math.round(Rand * Range));
      },
    //判断数组包含某个对象
    contains(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
   },
   //生成指定范围的时间戳的随机数,并且以2017-11-17 11:57:45 字符串返回
    generateRandomTimeStamp(startTime,endTime)
    {
        var startDate = new Date(Date.parse(startTime.replace(/-/g,"/")));
        var endDate = new Date(Date.parse(endTime.replace(/-/g,"/")));
        var startTimestamp = Date.parse(startDate);
        var endTimestamp = Date.parse(endDate);
        var refundTimestampRandom = this.getRandomNum(startTimestamp,endTimestamp);
        var timeStampDate = new Date(refundTimestampRandom);
        var year=timeStampDate.getFullYear();
        var month=timeStampDate.getMonth()+1;
        var date=timeStampDate.getDate();
        var hour=timeStampDate.getHours();
        var minute=timeStampDate.getMinutes();
        var second=timeStampDate.getSeconds();
        return year+"-"+month+"-"+date+" "+hour+":"+(minute < 10 ? "0"+minute : minute)+":"+(second < 10 ? "0"+second : second);
    },
    handleFilterLetters: function(obj){
                    var self = this;
                    var regStrs = [
                    ['^0(\\d+)$', '$1'], //禁止录入整数部分两位以上，但首位为0
                    ['[^\\d\\.]+$', ''], //禁止录入任何非数字和点
                    ['\\.(\\d?)\\.+', '.$1'], //禁止录入两个以上的点
                    ['^(\\d+\\.\\d{2}).+', '$1'], //禁止录入小数点后两位以上
                    ['^\d+(\.\d+)?$']
                    ];
                    for(let i=0; i<regStrs.length; i++){
                     var reg = new RegExp(regStrs[i][0]);
                     self.inputAmount=self.inputAmount.replace(reg, regStrs[i][1]);
                }
            },
    hideDetail(){
       this.isShowDeail = false;
       document.querySelector('body').className = '';
       document.querySelector('html').className = '';
       document.querySelector('#app').className = '';
    },

    // 选择天数方法
    chosenlastmonth(selectMonth){//选择上一个月的多选事件

       selectMonth.isSelected = !selectMonth.isSelected;

       if (selectMonth.isSelected) {//选中了就放进数组了
         this.selectLastArr.push(selectMonth)
       } else {
               //如果没有选中找到对应的下标，就从数组中去掉
         if (this.findIndex(this.selectLastArr,selectMonth) != -1) {
              this.selectLastArr.splice(this.findIndex(this.selectLastArr,selectMonth),1)
          }
       }
    },
    choosennextmonth(selectMonth){//选择下一个月的多选事件
        selectMonth.isSelected = !selectMonth.isSelected;
        //处理多选
        if( selectMonth.isSelected){
          this.selectNextArr.push(selectMonth);
        }
        else{
           //如果没有选中找到对应的下标，就从数组中去掉
         if (this.findIndex(this.selectNextArr,selectMonth) != -1) {
              this.selectNextArr.splice(this.findIndex(this.selectNextArr,selectMonth),1)
          }
        }
    },
    findIndex(array,val) {
      for (var i = 0; i < array.length; i++) {
      if (array[i] == val) return i;
      }
      return -1;
    },
    showResult(){
      // console.log(this.selectLastArr);
      console.log( this.selectLastArr)
      console.log( this.selectNextArr)
      this.selectDay = [];
      this.showdayStr = '';
      var a = this.selectLastArr.concat(this.selectNextArr)

      for (let index = 0; index < a.length; index++) {
          const element = a[index];
          this.selectDay.push( element.data);
      }


      this.isShowdatepicker=false;


      var dealDayArr = new Array();
      for (let index = 0; index < this.selectDay.length; index++) {
          const element = this.selectDay[index];
          var year = element.split('-')[0];
          var month = element.split('-')[1];
          var day = element.split('-')[2];

          if (month < 10) {
            month = "0" + month;
          }

          if (day < 10) {
             day = "0" + day;
          }
          dealDayArr.push(year+"-"+month+"-"+day);
      }
      this.selectDay = dealDayArr;
      console.log(this.selectDay)
      for (let index = 0; index < this.selectDay.length; index++) {
          const element = this.selectDay[index];
           var month = element.split('-')[1];
           var day = element.split('-')[2];
           var  spelement = month.toString() +"-"+ day.toString();
           this.showdayStr+=spelement+";"

      }
      this.resetStatus()
    },
    canelPickerDay(){
      this.isShowdatepicker=false;
       this.resetStatus()
    },
    resetStatus(){
       this.selectLastArr=[]
       this.selectNextArr=[]
      //  this.selectDay=[]
    },
   chooseday(start,end,transference){
     start=start-0;
     end=end-0;
     //某种情况计划日在开始日后面，但是跑到了下个月
      var curmonth=[];
      var nextmonth=[]
      //制定计划的时间
      var myDate;
      if(transference){
        myDate = new Date(transference)
      }else{
        myDate = new Date()
      }
      console.log(myDate)
      //2017-12-25
      var planday=myDate.getFullYear()+'-'+(myDate.getMonth()+1)+"-"+(myDate.getDate());
      //获取当前月
      var d = new Date(myDate.getFullYear(),myDate.getMonth()+1,0);
      //获取当前月份的天数
      var currentDay= d.getDate( );

      console.log(currentDay+'----当前月份的总天数的天数')

      var planstartDay=myDate.getDate( )
      console.log(start  <  end)
      if( start  <  end  ){
           //1.当月的情况
           console.log(planstartDay+'----计划的日期')
           console.log(start )
            console.log(planstartDay )
            //处理月份天数小于10
            var getmonth=myDate.getMonth()+1
            var  getday=1+myDate.getDate()
          if( start<planstartDay && planstartDay<end ){
            console.log('同月计划日在账单日之间')
                for(var i=0;i<end-myDate.getDate()-1;i++){
                var obj={
                id:i,
                data:myDate.getFullYear()+'-'+(getmonth)+"-"+(i+getday),
                isSelected:false
                }
                curmonth.push(obj)
            }
          }
          else {
            console.log('同月计划日在账单日之前')
            //特殊情况指定计划的时间大于还款日就是下个月的5-25号，否则就是这个月的5-25号
             var especilalYear;
             var especilalMonth;
              especilalMonth=myDate.getMonth()+1;
              especilalYear=myDate.getFullYear()
            if(planstartDay>end){
                especilalMonth+=1;
            }
             for(var i=0;i<end-start-1;i++){
             if(especilalMonth==13){
                  especilalMonth=1;
                  especilalYear=myDate.getFullYear()+1
              }
              var obj={
              id:i,
              data:especilalYear+'-'+(especilalMonth)+"-"+(i+start+1),
              isSelected:false
              }
              curmonth.push(obj)
             }
       }
      }
      else { //跨月
        console.log('跨月的的情况')
        if(planstartDay<end && planstartDay<start){
              console.log( '计划日在下个月月初')
              var especilalYear;
              var especilalMonth;
              especilalMonth=myDate.getMonth()+1;
              console.log(especilalMonth)
              especilalYear=myDate.getFullYear()
            for(var i=0;i<end-planstartDay-1;i++){
             if(especilalMonth==13){
                  especilalMonth=1;
                  especilalYear=myDate.getFullYear()+1
              }
            var obj={
              id:i,
              data:especilalYear+'-'+especilalMonth+"-"+(i+1+planstartDay),
              isSelected:false
            }
            nextmonth.push(obj)
           }
        }

        else if(planstartDay <= start ){
           console.log( '跨月账单日到月底' )
            //跨月 账单日到月底
            for(var i=0;i<currentDay-start;i++){
              var obj={
                id:i,
                data:myDate.getFullYear()+'-'+(myDate.getMonth()+1)+"-"+(i+1+start),
                isSelected:false,
              }
              curmonth.push(obj)
            }
        //拼接下一个月月初到还款日
              var especilalYear;
              var especilalMonth;
              for(var i=0;i<end-1;i++){
                especilalMonth=myDate.getMonth()+2;
                especilalYear=myDate.getFullYear()
                if(especilalMonth==13){
                    especilalMonth=1;
                    especilalYear=myDate.getFullYear()+1
                }
                var ac={
                  id:i,
                  data:especilalYear+'-'+especilalMonth+"-"+(i+1),
                  isSelected:false
                }
                nextmonth.push(ac)
              }
        }
        else if (planstartDay>start&&planstartDay>end){
          console.log( '计划日到月底月初到还款日' )
          //计划日到月底 月初到还款日
          for(var i=0;i<currentDay-planstartDay;i++){
            var obj={
              id:i,
              data:myDate.getFullYear()+'-'+(myDate.getMonth()+1)+"-"+(i+1+planstartDay),
              isSelected:false
            }
            curmonth.push(obj)
           }
        //拼接下一个月月初到还款日

           var especilalYear;
           var especilalMonth;
            for(var i=0;i<end-1;i++){
              especilalMonth=myDate.getMonth()+2;
              especilalYear=myDate.getFullYear()
              if(especilalMonth==13){
                  especilalMonth=1;
                  especilalYear=myDate.getFullYear()+1
              }
              var ac={
                id:i,
                data:especilalYear+'-'+especilalMonth+"-"+(i+1),
                isSelected:false
              }
              nextmonth.push(ac)
            }
        }
      }
         //拆分数组
         this.lastArray=curmonth;
         this.nextArray=nextmonth;
         console.log(curmonth )
        console.log(nextmonth)
         //拼接显示年月
         if( this.lastArray.length!==0){
         var lastyear=this.lastArray[0].data.split('-')[0];
         var lastmonth=this.lastArray[0].data.split('-')[1];
           this.curyymm=lastyear+'年'+lastmonth+'月';
         }

         if( this.nextArray.length!==0){
              var nextyear=this.nextArray[0].data.split('-')[0];
              var nextmonth=this.nextArray[0].data.split('-')[1];
              this.nextyymm=nextyear+'年'+nextmonth+'月';
         }

        //  console.log( this.lastArray)
        //  console.log(this.nextArray)
        this.$nextTick(function(){//设置日历的大小
          var w = document.querySelectorAll('td')[0].clientWidth
          document.querySelectorAll('td').forEach(function(v){
              v.style.height=w+'px';
              v.style.lineHeight=w+'px';
          })
        })
        this.isShowdatepicker=true;
    }
 },
 filters: {
    capitalize: function (value) {
      var filterdate =  value.split('-')
      return  filterdate[2]
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

#mp-content>.mint-header {
  background-color: #fff;
  color: #333;
  font-size: 17px;
}

#mp-content .container{
  margin-top: 5px;
  padding: 0 10px 0 10px;
  background-color: #fff;
}

#mp-content .container .itemContent
{
    display: -webkit-flex;
}

#mp-content .container .itemContent label
{
    margin: 10px 0 10px 0;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    color: #333;
}

#mp-content .container .itemContent input
{
    margin: 10px 10px 10px 20px;
    height: 30px;
    line-height: 30px;
    font-size: 15px;
    position: relative;
}

#mp-content .container .itemContent .reduceBtn
{
    position: absolute;
    color: #018ffd;
    background-color: white;
    border: solid 1px #018ffd;
    font-size: 25px;
    border-radius: 50%;
    text-align: center;
    width: 30px;
    height: 30px;
    top: 10px;
    right: 100px;
}

#mp-content .container .itemContent .showAmount
{
    position: absolute;
    color: #333;
    font-size: 22px;
    text-align: center;
    width: 40px;
    height: 30px;
    right: 50px;
}

#mp-content .container .itemContent .plusBtn
{
    position: absolute;
    color: #018ffd;
    background-color: white;
    border: solid 1px #018ffd;
    font-size: 25px;
    border-radius: 50%;
    text-align: center;
    width: 30px;
    height: 30px;
    top: 10px;
    right: 10px;
}

#mp-content .calcBtn
{
    margin: 15px 40px 0 40px;
    width: calc(100% - 80px);
    height: 45px;
    border-radius: 22.5px;
    background-color: #018ffd;
    color: #fff;
    font-size: 16px;
}


#mp-content .showPlan .totalView
{
    background-color: #018ffd;
    margin: 20px 5px 0 5px;
    border-radius: 6px;
    height: 80px;
    padding: 15px;
    display: -webkit-flex;
}

#mp-content .showPlan .totalView .leftView
{
    width: 50%;
    display: inline-block;
}


#mp-content .showPlan .totalView .leftView .leftAlign
{
    text-align: left;
}

#mp-content .showPlan .totalView .rightView
{
    width: 50%;
    display: inline-block;
}

#mp-content .showPlan .totalView .rightView .rightAlign
{
    text-align: right;
}

#mp-content .showPlan .totalView .topText
{
    font-size: 16px;
    color: white;
    display: block;
}

#mp-content .showPlan .totalView .bottomText
{
    font-size: 14px;
    margin-top: 8px;
    color: white;
    display: block;
}

#mp-content .showPlan .averView
{
    background-color: #fff;
    margin: 10px 5px 0 5px;
    border-radius: 5px;
    height: 70px;
    padding: 12px;
    display: -webkit-flex;
}

#mp-content .showPlan .averView .leftTextView
{
    width: 80%;
    height: 100%;
}

#mp-content .showPlan .averView .rightBtnView
{
    width: 20%;
    height: 100%;
    position: relative;
}

#mp-content .showPlan .averView .leftTextView .timeLab
{
    font-size: 16px;
    color: #333;
    display: block;
}

#mp-content .showPlan .averView .leftTextView .amountLab
{
    font-size: 14px;
    color: #999;
    margin-top: 5px;
    display: block;
}

#mp-content .showPlan .averView .rightBtnView button
{
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 15px;
    width: 60%;
    color: blue;
    background-color: white;
    outline: none;

}
#mp-content .showPlan .generatePlan
{
    margin: 20px 40px 20px 40px;
    width: calc(100% - 80px);
    height: 45px;
    border-radius: 22.5px;
    background-color: #018ffd;
    color: #fff;
    font-size: 16px;
}

#mp-content .container .itemContent .datePicker{
   padding: 0;
   width: 75%;
   display: -webkit-flex;
}

#mp-content .container .itemContent .datePicker .form-control{
  width: calc(75% - 35px);
  height: 30px;
  top:10px;
  margin-left: 10px;
  line-height: 30px;
  border: solid 1px #ececec;
  font-size: 14px;
  color: #666;
  position: absolute;
   overflow: hidden;/*超出部分隐藏*/
  white-space: nowrap;/*不换行*/
  text-overflow:ellipsis;/*超出部分文字以...显示*/
}
#mp-content .container .itemContent .datePicker .clearBtn
{
    width: 25px;
    height: 25px;
    position: absolute;
    top: 12.5px;
    right: 0px;;
    display: inline-block;

}

/* mask */
.mask{
  background: rgba(0, 0, 0, 0.3);
  position: fixed; top: 0; right: 0; bottom: 0; left: 0;
}
.modal-frame{
    position: absolute;
    left:0;
    right:0;
    top:20%;
    height: 60%;
    background: #f5f5f5;
    padding: 10px;
    overflow: auto;
}

.modal-frame .closeBtn
{
    position: fixed;
    width: 64px;
    height: 32px;
    top:calc(80% + 10px);
    left: calc(50% - 32px);
}
.modal-frame .content{
    margin: 10px 0px 0  0px;
    height: 50px;
    background-color: white;
    display: -webkit-flex;
    background-color: #018ffd;
    border-radius: 7px 7px 0 0;
}

.modal-frame .content .detail-Tleft
{
    display: inline-block;
    width: 60%;
    color: white;
    font-size: 15px;
    line-height: 50px;
    text-indent: 5px;
}
.modal-frame .content .detail-Tright
{
    display: inline-block;
    margin: 5px 10px 5px 10px;
    width: 40%;
    height: 40px;
    line-height: 40px;
    color: white;
    font-size: 15px;
    text-align: right;
}

.modal-frame .expendDetail
{
    background-color: #fff;
    height: 60px;
}

.modal-frame .expendDetail .top{
    width: 100%;
    padding: 10px 10px 0 10px;
    font-size: 15px;
    color: #333;
}

.modal-frame .expendDetail .bottom{
    width: 100%;
    padding: 5px 10px 0 10px;
    font-size: 14px;
    color: #666;
}

.modal-frame .expendDetail .bottomLine
{
    margin: 7px 5px 0 5px;
    height: 1px;
    background-color: #ececec;
}
bodyScroll{
    height: 100% !important;
    overflow: hidden;
}

/* 选择天数样式 */
td{
  list-style: none;
  float: left;
  width: 14%;
  box-sizing: border-box;
}
.lastmonth{

}
.nextmonth{

}
.isChoose{
  background: #45adfd;
  color: #fff;
}
.table1{
  border-collapse:collapse;
}
.table2 th,.table1 th{
   background: #45adfd;
   color: #fff;
   border-top-left-radius:5px;
   border-top-right-radius:5px;
}
.table1 td{
  border :1px solid #999;
  margin-bottom: 5px;
}
.table2 td{
  border :1px solid #999;
  margin-bottom: 5px;
}
.table2,.table1 {
 width: 100%;
  
}
.table2{
  padding-bottom:10px;
}
.table2 td,.table1 td{
  margin-right:1%;
  margin-left:1%;
}
.table1 td,.table2 td{
 border :1px solid #018ffd;
 text-align: center;
 border-radius: 50% ;
}
.table1 tr{

}
.table2 tr:nth-child(1),.table1 tr:nth-child(1){
  height: 35px;
  line-height: 35px;
}
.datemask{
  position: fixed;
  bottom: 0px;
  width: 100%;
  height: 100%;
  z-index:10 ;
  background: rgba(0,0,0,0.8);
}
article{
  position: fixed;
  bottom: 50%;
  left: 50%;
  -webkit-transform: translate(-50%,50%);
  transform: translate(-50%,50%);
  width: 90%;
  z-index:15 ;
  background: #fff;
  border-radius: 5px;
}
.canelOrSure{
  display: -webkit-flex;
  display: flex;
  height: 35px;
  line-height: 35px;
  color: #fff;

}
.canel{
 flex:auto ;
 background:#45adfd;
 text-align: left;
 padding-left: 15px;
 border-bottom-left-radius:5px;
}
.showResult{
  flex:auto;
  background:#45adfd;
  text-align: right;
  padding-right:15px;
  border-bottom-right-radius:5px;
}

</style>
