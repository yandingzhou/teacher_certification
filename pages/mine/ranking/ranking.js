const db = wx.cloud.database()
const _ = db.command

Page({
    data:{
        // 假设已加载的数据
        ranking_list_sum: [],
        ranking_list_accuracy:[],
        // 假设每次加载的数据量
        pageSize: 8,
        // 假设当前页数
        currentPage_1: 0,
        currentPage_2: 0,
        // 标记是否正在加载更多数据
        isLoadingMore_1: false,
        isLoadingMore_2: false
    },
    onLoad(){
        this.loadMoreData_1()
        this.loadMoreData_2()
        this.get_my_ranking()
        this.get_my_info()
        this.setData({
            userInfo:wx.getStorageSync('userInfo')
        })
    },
    loadMoreData_1(){
        if (this.data.isLoadingMore_1 || this.data.is_complete_1==true) {
          return;
        }
    
        wx.showLoading({
          title: '加载中...',
        })

        this.setData({
          isLoadingMore_1: true
        });

        var newDataList_1 = [];
        var dataList_1 = []
        db.collection("ranking_list").where({
            _id:"1"
        }).get().then(res=>{
            newDataList_1 = res.data[0].ranking_list_sum.slice(this.data.currentPage_1*this.data.pageSize , (this.data.currentPage_1 + 1)*this.data.pageSize)
            //判断是否已经加载完全部数据
            if(newDataList_1.length == 0){
                this.setData({
                    is_complete_1 : true
                })
                wx.showToast({
                  title: '加载完毕',
                  icon:'error'
                })
            }
        }).then(res=>{
            dataList_1 = this.data.ranking_list_sum.concat(newDataList_1);
        }).then(res=>{
            this.setData({
                ranking_list_sum: dataList_1,
                currentPage_1: this.data.currentPage_1 + 1,
                isLoadingMore_1: false
            });
            wx.hideLoading()
        })
    
      },
    loadMoreData_2(){
    if (this.data.isLoadingMore_2 || this.data.is_complete_2==true) {
        return;
    }

    wx.showLoading({
        title: '加载中...',
    })

    this.setData({
        isLoadingMore_2: true
    });

    var newDataList_2 = [];
    var dataList_2 = []
    db.collection("ranking_list").where({
        _id:"2"
    }).get().then(res=>{
        newDataList_2 = res.data[0].ranking_list_accuracy.slice(this.data.currentPage_2*this.data.pageSize , (this.data.currentPage_2 + 1)*this.data.pageSize)
        //判断是否已经加载完全部数据
        if(newDataList_2.length == 0){
            this.setData({
                is_complete_2 : true
            })
            wx.showToast({
                title: '加载完毕',
                icon:'error'
            })
        }
    }).then(res=>{
        dataList_2 = this.data.ranking_list_accuracy.concat(newDataList_2);
    }).then(res=>{
        this.setData({
            ranking_list_accuracy: dataList_2,
            currentPage_2: this.data.currentPage_2 + 1,
            isLoadingMore_2: false
        });
        wx.hideLoading()
    })

    },
    get_my_ranking(){
        db.collection("ranking_list").get().then(res=>{
            //判断总数排行里是否有自己
            var ranking_list_sum = res.data[0].ranking_list_sum
            for(let i=0;i<ranking_list_sum.length;i++){
                if(ranking_list_sum[i].openid == wx.getStorageSync('openid')){
                    this.setData({
                        ranking_1 : i,
                    })
                    break
                }
            }
            //判断正确率排行里是否有自己
            var ranking_list_accuracy = res.data[1].ranking_list_accuracy
            for(let i=0;i<ranking_list_accuracy.length;i++){
                if(ranking_list_accuracy[i].openid == wx.getStorageSync('openid')){
                    this.setData({
                        ranking_2 : i,
                    })
                    break
                }
            }
            
        })
    },
    get_my_info(){
        db.collection("users").where({
            _openid:wx.getStorageSync('openid')
        }).get().then(res=>{
            let my_done_sum = res.data[0].done_sum
            let my_true_sum = res.data[0].true_sum
            this.setData({
                my_done_sum:my_done_sum,
                my_accuracy:parseFloat((my_true_sum / my_done_sum * 100).toFixed(2))
            })
        })
    }
})