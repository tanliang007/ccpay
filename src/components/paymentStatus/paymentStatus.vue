<template>
   <section>
      <header class="mint-header border-bottom">
          <div class="mint-header-button is-left">
            <a href="#/" class="router-link-active">
              <i class="mintui mintui-back"></i>
            </a>
          </div>
          <h1 class="mint-header-title">还款计划状态</h1>
        </header>

        <mt-navbar v-model="selected">
          <mt-tab-item id="1"  style="padding:12px 0;">
               <div  @click='topSelect(0)'>
                   执行中
               </div>
          </mt-tab-item>
          <mt-tab-item id="2"  style="padding:12px 0;">
              <div @click='topSelect(2)'>
                    执行中断
              </div>
          </mt-tab-item>
          <mt-tab-item id="3" style="padding:12px 0;">
              <div  @click='topSelect(1)'>
                    执行成功
              </div>
          </mt-tab-item>
          <mt-tab-item id="4" style="padding:12px 0;">
               <div  @click='topSelect(3)'>
                    执行失败
              </div>
          </mt-tab-item>
        </mt-navbar>

<!-- tab-container -->
          <div class='content'>
              <mt-loadmore :bottom-method="getMoreData" :bottom-all-loaded="isEnd" ref="loadmore">
                  <ul>
                    <li v-for="item in plans"  class="li" @click="toRepaydetail(item.id)">
                      <div class="t clearfix">
                        <div class="numbering">
                         编号:{{item.no}}
                        </div>
                        <div class="timing">
                          <span>{{item.createTime}}</span>
                        </div>
                      </div>
                      <div class="m clearfix">
                        <div class="repaymoney">
                          还款金额:￥{{item.actualAmount/100}}
                        </div>
                        <div class="repaynumber">
                          还款笔数:{{item.count}}次
                        </div>
                      </div>
                      <div class="b clearfix">
                        <div class="execution" >
                            {{arr[item.status]}}
                        </div>
                        <div  v-show='item.status == 0 ? true : false' @click.stop="stopPlan(item.id)" class="isinterrupt">
                            {{item.status==0?'计划中断':""}}
                        </div>
                      </div>
                      </li>
                  </ul>
                   <p class='more' v-show="isEnd"> 没有数据了...</p>
      </mt-loadmore>

      </div>



   </section>
</template>
<script>
import { Navbar, TabItem } from 'mint-ui';
import { Loadmore } from 'mint-ui';
import { Toast } from 'mint-ui';
var cardId;

export default {
   data ( ){
     return{
       //tab栏选中id
       selected:"1",
       selectindex:0,
       allLoaded:false,
       arr:['进行中','成功','中断','失败'],
       plans:[],
       currentPage:1,
       isEnd:false
     }
   },
  watch: {
          // 如果路由有变化，会再次执行该方法
      "$route": "fetchDate"
    },
   created(){
     //获取 状态列表
     this.topSelect(0);
     //存储

      // this.$route.params.cardId

   },
   mounted(){

   },
   methods:{
     topSelect(index){
       //上面tab选中状态
       this.selectindex = index;
       //切换tab清空数据
       this.plans = [];
       this.currentPage = 1;
       this.isEnd = false;
       console.log(this.selectindex);
       this.getPlans(this.currentPage)
     },
     getMoreData(){

       if (this.isEnd == true) return;
       this.getPlans(this.currentPage + 1);

     },
     getPlans(page){

        // if (this.isShowLoadMore) return;

        this.$http.get('/ak/api/plan/list',{
        params: { //去本地那check存储的userid
          cardId: this.$route.query.cardId,
          status:this.selectindex,
          page:page,
          pageSize:10
        }}).then( (response)=>{
          console.log(response.data.data.list);
            if(response.data.code == 1){
              //如果不存在会返回一个空数组
              this.currentPage = page;
              if (page === 1) {

                   this.plans = response.data.data.list;
                   this.isEnd = false;

              } else {

                    if (response.data.data.list.length < 10) {
                        this.isEnd = true;

                    } else {

                        this.plans = this.plans.concat(response.data.data.list);
                        this.isEnd = false;
                    }
              }



              // if (response.data.data.list.length < 5) {
              //     this.isShowLoadMore = false;
              //     this.allLoaded = true;
              //     console.log(response.data.data.list)
              //     if (page === 1) {
              //       this.plans = response.data.data.list;
              //       console.log(1111)
              //     }else
              //     {
              //       this.plans.concat(response.data.data.list)
              //     }

              // }else
              // {
              //    this.isShowLoadMore = true;
              //    this.allLoaded = false;
              //     this.plans.concat(response.data.data.list)
              // }

            }
            else{
               Toast({
                    message:res.data.msg,
                    position: 'center',
                    duration: 1000
              })
            }

            this.$refs.loadmore.onBottomLoaded();
          })
          .catch(function (error) {
              console.log(error);
              // this.$refs.loadmore.onBottomLoaded();
          })
     },
     stopPlan(planId){//中断计划的接口
       var  planObj={
           planId: planId
       }
       console.log(planObj)
       this.$http.post('/ak/api/plan/stop',
         this.transformRequest(planObj)
       ).then((res)=>{
          if(res.data.code==1){
             Toast({
              message:'手动中断成功',
              position: 'center',
              duration: 1000
             })
          this.topSelect(0)
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
     toRepaydetail(planid){
       this.$router.push({"path":'/repaymentdetail',query:{planId:planid,cardId:this.$route.query.cardId}})
     }
   },
   component:{
      Navbar,
      Loadmore
   }
}
</script>
<style scoped>
section{
  overflow-y:auto;
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
  margin-bottom: 3px;
}
/* 列表的样式 */
.li{
  padding:0px 14px;
  background: #fff;
  margin-top: 3px;
}
.li .t .numbering{
  font-size: 14px;
  color: #999;
  float: left;
}
.li .t .timing{
  font-size: 14px;
  color: #999;
  float: right;
}
.li .t .timing span:nth-child(2){
  margin-left: 4px;
}
.t{
  height: 50px;
  line-height: 50px;
}
.li .m{
  height: 20px;
  line-height: 20px;
}
.li .m .repaymoney{
 float: left;
 font-size: 14px;
}
.li .m .repaynumber{
  float:right ;
  font-size: 14px;
}
.li .b {
  padding:10px 0;
}
.li .b .execution{
  float: left;
  color:#26a2ff;
  font-size: 15px;
}
.li .b .isinterrupt{
  float:right;
  color:#26a2ff;
  font-size: 15px;
  padding: 5px 8px;
  border:1px solid #26a2ff ;
}
/* 去除默认tab样式 */
.mint-tab-item{
  padding: 0px;
}
.content{
   overflow: scroll;
}
a{
   color:#333;
}
.router-link-active{
   color:#333;
}
.router-link-active:active{
   color:#333;
}
.more{
  margin-top: 5px;
  margin-bottom:30px;
  text-align: center;
  background: #fff;
}
</style>

