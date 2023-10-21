const db = wx.cloud.database()
const _ = db.command

Page({
    data:[

    ],
    onLoad(){
        this.get_article_list()
    },
    //用户确定删除该文章
    confirm_delete_article(_id){
        wx.showLoading({
            title: '删除中...',
          })
        db.collection("article").doc(_id).remove({
            success: res=> {
                console.log('数据删除成功');
                wx.hideLoading()
                wx.showToast({
                    title: '删除成功',
                })
                this.get_article_list()
            },
            fail: function (err) {
              console.error('数据删除失败', err);
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
                icon:'error'
              })
            }
        });
    },
    //用户点击删除文章按钮
    click_delete_article(e){
        var _id = e.currentTarget.dataset._id
        console.log("要删除的文章id为：",_id)
        wx.showModal({
            title: '确认删除？',
            content: '删除资讯后，无法恢复',
            success: res =>{
              if (res.confirm) {
                console.log('用户点击确定')
                this.confirm_delete_article(_id)
              } else {
                console.log('用户点击取消')
              }
            }
          })
    },
    //阅读该文章
    enter_article(e){
        var url = e.currentTarget.dataset.url
        wx.navigateTo({
            url: '/pages/home/web_view/web_view?url='+encodeURIComponent(url)
          });
    },

    onChange_title(e){
        this.setData({
          title:e.detail
        })
    },
    onChange_url(e){
        this.setData({
          url:e.detail
        })
    },
    //确定上传文章
    upload_article(){
        wx.showLoading({
          title: '上传中...',
        })
        db.collection("article").add({
            data:{
                title:this.data.title,
                url:this.data.url
            },
            success:res=>{
                console.log("上传资讯成功")
                wx.hideLoading()
                wx.showToast({
                  title: '上传成功',
                })
                this.get_article_list()
            },
            fail:res=>{
                console.log("上传资讯失败")
                wx.hideLoading()
                wx.showToast({
                  title: '上传失败',
                  icon:"error"
                })
            }
        })
    },
    get_article_list(){
        db.collection("article").get().then(res=>{
            console.log("获取到了文章列表",res)
            this.setData({
                article_list : res.data.reverse()
            })
        })
    }

})