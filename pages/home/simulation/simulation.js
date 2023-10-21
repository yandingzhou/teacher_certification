const db = wx.cloud.database()
const _ = db.command

Page({
    data:{

    },
    onLoad(){
        db.collection("test_papers").where({
            test_papers_type : "simulation_papers"
        }).get().then(res=>{
            this.setData({
                test_paper_info : res.data[0].test_paper_info
            })
        })
    },
    preview_pdf(e){
        var url = e.currentTarget.dataset.test_papers_url
        wx.navigateTo({
            url: '/pages/home/web_view/web_view?url='+encodeURIComponent(url)
          });
    }
})