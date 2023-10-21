const db=wx.cloud.database()
const _ = db.command
Page({
  data:{

  },

  onLoad(e){
      this.setData({
        collection_id : parseInt(e.collection_id) ,
        collection_name : JSON.parse(decodeURIComponent(e.collection_name))
      })
      wx.setNavigationBarTitle({
        title: this.data.collection_name
      })
  },

  //实时更新题目
  onShow(){
    db.collection('users').where({
        _openid:wx.getStorageSync('openid')
    }).get().then(res=>{
        this.setData({
            question_list:res.data[0].collection[this.data.collection_id]
        })
    })
  },

//取消收藏该题目
click_cancel_collect(e){
    var i = e.target.dataset.i
    db.collection("users").where({
        _openid:wx.getStorageSync('openid')
    }).update({
        data:{
            [`collection.${this.data.collection_id}.question_list`]: _.pull({ _id: this.data.question_list.question_list[i]._id })
        }
        }).then(res => {
            var question_list = this.data.question_list.question_list.filter((_, _id) => _id !== i);
            this.setData({['question_list.question_list']:question_list})

            wx.showToast({
            title: '取消收藏成功',
            })
        }).catch(err => {
        console.error(err)
    })
},

//进入该题目
enter_question(e){
    //获取到要进入题目的序号
    var question_id = e.currentTarget.dataset.i
    //将序号和question_list一起传答题页面
    wx.navigateTo({
        url: '/pages/mine/collection/collection_answer?question_id='+question_id+'&question_list='+encodeURIComponent(JSON.stringify(this.data.question_list))+'&activate_collection_id='+this.data.
        collection_id
      });
}
})