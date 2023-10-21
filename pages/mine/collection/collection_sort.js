const db = wx.cloud.database()
const _ = db.command
Page({
    data: {
        folder_img_url:'cloud://cloud-6gk5axmmcb35f6bf.636c-cloud-6gk5axmmcb35f6bf-1308548612/folder.png',
        show_panel:true
    },
    onShow(){
        db.collection("users").where({
            _openid:wx.getStorageSync('openid')
        }).get().then(res=>{
            this.setData({
                collection:res.data[0].collection
            })
        })
    },
    enter_collection_folder(e){
        var i = e.currentTarget.dataset.i
        console.log('要进入的收藏夹id为：',i)

        wx.navigateTo({
            url: '/pages/mine/collection/collection?collection_id='+i+'&collection_name='+encodeURIComponent(JSON.stringify(this.data.collection[i].collection_name))
          });
    },
    click_delete_collection_folder(e){
        var i = e.target.dataset.i      //获取用户要删的文件夹id
        wx.showModal({
            title: '确认删除？',
            content: '删除收藏夹后，无法恢复',
            success: res =>{
              if (res.confirm) {
                console.log('用户点击确定')
                this.confirm_delete_collection_folder(i)
              } else {
                console.log('用户点击取消')
              }
            }
          })
    },
    confirm_delete_collection_folder(i){
        console.log('要删除的收藏夹id为：',i)

        db.collection("users").where({
            _openid:wx.getStorageSync('openid')
        }).update({
            data: {
                collection: _.pull({ collection_name: this.data.collection[i].collection_name })
            }
        }).then(res=>{
            var new_collection = this.data.collection.filter((_, index) => index !== i);
            this.setData({collection:new_collection})
            wx.showToast({
              title: '删除成功',
            })
            console.log('删除该收藏夹成功')
        })
    }
  })
  