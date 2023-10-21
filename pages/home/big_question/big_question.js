const db = wx.cloud.database()
const _ = db.command

Page({
  data:{
    db_name:"infant_quality_big_question",
    is_submit:false,
    is_show_analysis:false,
    show_popup : false
  },

  onLoad(e){
    this.setData({
      db_name : e.db_name
    })
    this.get_question().then(() => {
      this.init_user_answers()
    })
  },

  onClose_popup() {
    this.setData({ show_popup: false });
  },

// 查看解析
get_analysis(){
  if(this.data.is_show_analysis){
    this.setData({
      is_show_analysis : false
    })
  }
  else{
    this.setData({
      is_show_analysis : true
    })    
  }
},

// 下一题
next_quetsion(){
  wx.navigateTo({
    url: '/pages/home/big_question/big_question',
  })
},

// 标记该题目用户已做过
tag_question(){
  const id = this.data.big_question._id
  db.collection('users').where({
    _openid:wx.getStorageSync('openid')
  }).update({
    data:{
      ['this.data.db_name']:_.push(id)
    },
    success:res=>{
      console.log("已成功添加已做题目id至数据库中")
    },
    fail:res=>{
      console.log("添加已做题目id至数据库失败")
    }
  })
},

// 获取得分数组及平均得分
handleSubmit() {
  wx.showLoading({
    title: '提交中...',
  });
  const userAnswers = this.data.user_answers;
  const referenceAnswers = this.data.big_question;

  // 发送评分请求
  wx.request({
    url: 'http://localhost:5000/score',
    method: 'POST',
    data: {
      user_answers: userAnswers,
      reference_answers: referenceAnswers
    },
    success: (res) => {
      console.log('评分结果:', res.data);
      const scores = res.data;

      // 计算总分和平均分
      const sum = scores.reduce((acc, val) => acc + val, 0);
      const average_score = (sum / scores.length).toFixed(2);
      console.log("用户平均分为：",average_score)
      this.setData({
        scores: scores.map(score => score.toFixed(2)),
        average_score: parseFloat(average_score) 
      });

      // 执行第二个函数
      this.revise_database();
    },
    fail: (error) => {
      console.error('评分请求失败:', error);
    },
    complete: () => {
      this.setData({
        show_popup : true,
        is_submit : true
      })
      wx.hideLoading();
    }
  });
},

// 在数据库中对scores数组进行添加
revise_database() {
  const id = this.data.big_question._id;
  const average_score = this.data.average_score;

  db.collection(this.data.db_name).doc(id).update({
    data: {
      score_list: _.push(average_score)
    },
    success: () => {
      console.log('分数字段更新成功');
    },
    fail: (error) => {
      console.error('分数字段更新失败:', error);
    },
    complete:()=>{
      //标记该题用户已做
      this.tag_question()

      const score_list = this.data.big_question.score_list;
      const average_score = this.data.average_score;
      const sortedArray = score_list.sort((a, b) => a - b);
      const targetIndex = sortedArray.findIndex(num => num >= average_score);
      const percentage = ((sortedArray.length - targetIndex) / sortedArray.length * 100).toFixed(2);
      this.setData({
        ranking : percentage
      })
      console.log('超过了百分之', percentage, '的人');    
    }
  });
},

// 获取输入框中的数据
  handleAnswerInput(e){
    var i = e.currentTarget.dataset.i
    var value = e.detail.value
    console.log("第",i+1,"个输入框的值为：",value)
    this.setData({
      ["user_answers[" + i + "]"]: value
    });
  },
// 加载题目
  get_question(){
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '获取中...',
      })
      db.collection('users').where({
          _openid : wx.getStorageSync('openid')
        }).get({
            success:res=>{
              db.collection(this.data.db_name)
              .aggregate()
              .match({
                _id:_.nin(res.data[0][this.data.db_name])
              })
              .sample({size:1})
              .end({
                success:res=>{
                  if(res.list.length==0){
                      wx.showToast({
                          title: '题目已做完',
                          icon:'error'
                        }),
                        setTimeout(()=>{
                          wx.switchTab({
                            url: '/pages/home/home/home',
                          })
                        },1000)
                  }
                  else{
                      console.log("成功获取到题目信息",res)
                      this.setData({
                          big_question:res.list[0]
                      })
                      wx.hideLoading()
                  }
                  resolve()
                }
              })
            },
            fail:res=>{
              reject()
              console.log("题目获取失败")
            }
        })
    })
  },
// 初始化一些重要的数据
  init_user_answers(){
    var len = this.data.big_question.reference.length
    console.log("该题共有",len,"小问")
    var user_answers = []
    for(let i=0 ;i<len;i++){
      user_answers.push("")
    }
    this.setData({
      user_answers : user_answers
    })
  }
  
})