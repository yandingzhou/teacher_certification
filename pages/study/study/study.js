const db = wx.cloud.database()
const _ = db.command

Page({
    data: {
      isPopping: true,
      anim_setting: {},
      anim10: {},
      anim5: {},
      anin20:{},
    },
onShow(){
    //设置默认答题量
    if(!wx.getStorageSync('question_sum')){
        wx.setStorageSync('question_sum', 10)
        this.setData({
            question_sum:10
        })
    }
    else{
        this.setData({
            question_sum:wx.getStorageSync('question_sum')
        })
    }
    },
    change_question_sum(e){
        wx.setStorageSync('question_sum',parseInt(e.currentTarget.dataset.question_sum))
        this.setData({
            question_sum:parseInt(e.currentTarget.dataset.question_sum)
        })
        this.takeback()
    },
    //点击弹出
    setting: function () {
      if (this.data.isPopping) {
        //缩回动画
        this.popp();
        this.setData({
          isPopping: false
        })
      } else{
        //弹出动画
        this.takeback();
        this.setData({
          isPopping: true
        })
      }
    },
    //弹出动画
    popp: function () {
      //setting顺时针旋转
      var animation_setting = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      })
      var animation10 = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      })
      var animation5 = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      })

      var animation20 = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      })
      animation_setting.rotateZ(360).step();
      animation10.translate(-55, -55).rotateZ(360).opacity(1).step();
      animation5.translate(-75, 0).rotateZ(360).opacity(1).step();
      animation20.translate(0, -75).rotateZ(360).opacity(1).step();
      this.setData({
        anim_setting: animation_setting.export(),
        anim10: animation10.export(),
        anim5: animation5.export(),
        anim20: animation20.export(),
      })
    },
    //收回动画
    takeback: function () {
      //setting逆时针旋转
      var animation_setting = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      })
      var animation10 = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      })
      var animation5 = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      })
      var animation20 = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      })
      animation_setting.rotateZ(0).step();
      animation10.translate(0, 0).rotateZ(0).opacity(0).step();
      animation5.translate(0, 0).rotateZ(0).opacity(0).step();
      animation20.translate(0, 0).rotateZ(0).opacity(0).step();
      this.setData({
        anim_setting: animation_setting.export(),
        anim10: animation10.export(),
        anim5: animation5.export(),
        anim20: animation20.export(),
      })
    },
  })
  
  