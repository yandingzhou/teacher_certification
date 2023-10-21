const db = wx.cloud.database()
Page({
  data: {
    userInfo: {},
  },

  onLoad(options) {

  },

 onShow() {
    var user = wx.getStorageSync('userInfo')
    if(user)//如果缓存数据存在
    {
      this.setData
      ({
        userInfo:user,
        status:'login',//已登录
        is_administrator:wx.getStorageSync('is_administrator')
      }) 
      }
      else//缓存数据不存在
      {
        this.setData({
          status:'not_login',//未登录
        })
      }
 },

 judge_1(){
  if(this.data.status=='login'){
    wx.navigateTo({
      url: '/pages/mine/ranking/ranking',
    })
  }
  else{
    wx.showToast({
      title: '请登录',
      icon:'error'
    })
  }
},

judge_2(){
  if(this.data.status=='login'){
    wx.navigateTo({
      url: '/pages/mine/collection/collection_sort',
    })
  }
  else{
    wx.showToast({
      title: '请登录',
      icon:'error'
    })
  }
},

contact_us(){
  wx.showModal({
    title: '联系我们',
    confirmText:'复制邮箱',
    content: '我们十分关心您的体验和想法，请把您遇到的问题或您的反馈，发送邮件到yandingzhou0@gmail.com，我们将会积极处理您的来信。\r\n更多功能正在开发完善中。',
    success (res) {
      if (res.confirm) {
        //复制地址到剪贴板
        wx.setClipboardData({
          data:'yandingzhou0@gmail.com',
          success (res) {
            wx.showToast({
              title: '复制成功',
              duration:800
            })
          }
       })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
},

login(){
  new Promise((resolve,reject)=>{
      wx.getUserProfile({
        desc: '用于完善会员资料', 
        success: (res) => {
          console.log(res)
          this.setData({
            ['userInfo.avatarUrl']:res.userInfo.avatarUrl,
            ['userInfo.nickName']:res.userInfo.nickName,
            status:'login'
          }) 
          resolve()
          console.log("用户注册成功，信息已赋值到本地data数组中")
        },
     })
  }).then(res=>{
    wx.setStorageSync('userInfo',this.data.userInfo)
    console.log("用户信息已缓存至本地")
  }).then(res=>{
 //判断该用户是否已经注册，首先获取用户openid
 new Promise((resolve,reject)=>{
  wx.cloud.callFunction({
    name: "judge_user_exist",
    success:res=>{
      this.setData({
        openid:res.result.openid
      })
      wx.setStorageSync('openid', res.result.openid)
      console.log("获取用户openid成功")
      resolve()
    } ,
    fail:res=>{
      console.log("获取用户openid失败")
      reject()
    }
  })
}).then(res=>{
  // 判断数据库中是否已经存在该用户
  db.collection('users').where({
    _openid:this.data.openid
  }).get().then(res=>{
    if(res.data.length==0){
      //没有该用户，添加用户数据
      db.collection('users').add({
        data:{
            userInfo:this.data.userInfo,
            true_sum:0,
            done_sum:0,
            collection:[],
            
            infant_quality:[],infant_ability:[],
            primary_quality:[],primary_ability:[],
            secondary_quality:[],secondary_ability:[],
            junior_chin:[],junior_math:[],junior_eng:[],junior_phy:[],junior_chem:[],junior_bio:[],
            senior_chin:[],senior_math:[],senior_eng:[],senior_phy:[],senior_chem:[],senior_bio:[],

            infant_quality_big_question:[],infant_ability_big_question:[],
            primary_quality_big_question:[],primary_ability_big_question:[],secondary_quality_big_question:[],secondary_ability_big_question:[],
            junior_chin_big_question:[],junior_math_big_question:[],junior_eng_big_question:[],junior_phy_big_question:[],junior_chem_big_question:[],junior_bio_big_question:[],
            senior_chin_big_question:[],senior_math_big_question:[],senior_eng_big_question:[],senior_phy_big_question:[],senior_chem_big_question:[],senior_bio_big_question:[],
        },
        success:res=>{
          console.log("成功添加用户数据至数据库中")
        },
        fail:res=>{
          console.log("添加用户数据至数据库中失败")
        }
      })
    }
    else{
      console.log("用户已经存在")
      //判断该用户是否为管理员
      db.collection('users').where({
          _openid:wx.getStorageSync('openid')
      }).get().then(res=>{
          if(res.data[0].is_administrator==true){
            var is_administrator = res.data[0].is_administrator
            this.setData({is_administrator:is_administrator})
            wx.setStorageSync('is_administrator', is_administrator)
          }
      })
    }
  })
})
})

}
})
