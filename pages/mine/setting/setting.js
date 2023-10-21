Page({

  data: {
    activeNames: ['1'],
    status:''
  },
  log_out()
  {
    wx.clearStorageSync()
    wx.showToast({
      title: '退出成功',
    }),
    setTimeout(()=>{
      wx.switchTab({
        url: '/pages/mine/mine/mine',
      })
    },1000)
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },

  onLoad(options) {
  if(wx.getStorageSync('openid'))
  {
    this.setData({
    status:'login'
    })
  }
  else{
    this.setData({
      status:'not_login'
      })
  }
  

  },
})