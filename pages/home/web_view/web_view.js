// pages/home/read_article/read_article.js
Page({
    data: {

    },

    onLoad(e) {
        var url = decodeURIComponent(e.url)
        console.log('成功跳转到：',url)
        this.setData({
            url:decodeURIComponent(url)
        })
    }
})