const db = wx.cloud.database()
const _ = db.command
const citys = {
  幼儿: ['综合素质','保教知识与能力'],
  小学: ['综合素质','教育教学知识与能力'],
  初中: ['综合素质','教育知识与能力','语文','数学','英语','物理','化学','生物'],
  高中: ['综合素质','教育知识与能力','语文','数学','英语','物理','化学','生物']
}

Page({
    data:{
      isShow:false,
      grade:'幼儿',
      subject:'综合素质',
      db_name:'infant_quality_big_question',
      columns: [
        {
          values: Object.keys(citys),
          className: 'column1',
        },
        {
          values: citys['幼儿'],
          className: 'column2',
        },
      ],
    },
    onLoad(){
    db.collection('article').get().then(res => {
        this.setData({
            article:res.data.reverse()
        })
        console.log('文章获取成功')
        })

    db.collection('questions_and_answers').get().then(res => {
        this.setData({
            questions_and_answers:res.data.reverse()
        })
        console.log('问答获取成功')
        })

    if(!wx.getStorageSync('db_name')){
      wx.setStorageSync('db_name', "infant_quality_big_question")
    }
    else{
      this.setData({
        db_name : wx.getStorageSync('db_name')
      })
    }

    },
    go_to_big_question(){
      wx.navigateTo({
        url: '/pages/home/big_question/big_question?db_name='+this.data.db_name,
      })
    },
    //选择题库功能实现
    confirm_choose(){
      this.setData({
          isShow:false,
      })
      this.get_db_name()
      console.log("数据库名称是",this.data.db_name)
  },
  cancel_choose(){
      this.setData({
          isShow:false
      })
  },
  choose_question_bank(){
      this.setData({
          isShow:true
      })
  },
  onChange_choose(event) {
    console.log(event)
    this.setData({
        grade:event.detail.value[0],
        subject:event.detail.value[1]
    })
    const { picker, value, index } = event.detail;
    picker.setColumnValues(1, citys[value[0]]);
    },

    to_read_article(e){
        var article_url = e.currentTarget.dataset.article_url
        wx.navigateTo({
            url: '/pages/home/web_view/web_view?url='+encodeURIComponent(article_url)
          });
    },

    get_db_name(){
      var grade = this.data.grade
      var subject = this.data.subject
      var db_name = ''
      if(grade=='幼儿'){
          if(subject=='综合素质') db_name='infant_quality_big_question'
          else db_name ='infant_ability_big_question'
      }
      else if(grade=='小学'){
          if(subject=='综合素质') db_name='primary_quality_big_question'
          else db_name='primary_ability_big_question'
      }
      else if(grade=='初中'){
          if(subject=='综合素质') db_name='secondary_quality_big_question'
          else if(subject=='教育知识与能力') db_name='secondary_ability_big_question'
          else if(subject=='语文') db_name='junior_chin_big_question'
          else if(subject=='数学') db_name='junior_math_big_question'
          else if(subject=='英语') db_name='junior_eng_big_question'
          else if(subject=='物理') db_name='junior_phy_big_question'
          else if(subject=='化学') db_name='junior_chem_big_question'
          else db_name='junior_bio_big_question'
      }
      else{
          if(subject=='综合素质') db_name='secondary_quality_big_question'
          else if(subject=='教育知识与能力') db_name='secondary_ability_big_question'
          else if(subject=='语文') db_name='senior_chin_big_question'
          else if(subject=='数学') db_name='senior_math_big_question'
          else if(subject=='英语') db_name='senior_eng_big_question'
          else if(subject=='物理') db_name='senior_phy_big_question'
          else if(subject=='化学') db_name='senior_chem_big_question'
          else db_name='senior_bio_big_question'
      }
      this.setData({db_name:db_name})
      wx.setStorageSync('db_name', db_name)
  },
})