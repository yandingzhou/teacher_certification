const db=wx.cloud.database()
const _ = db.command

Page({
    data:{
        current_page_id:0,
    },

onLoad(e){
    this.setData({
        current_page_id:e.question_id,
        question : JSON.parse(decodeURIComponent(e.question_list)).question_list,
        activate_collection_id:e.activate_collection_id
    })
    this.initialize_question_status()
},

  //获取当前页面id
  get_current_page_id(e){
    this.setData({
      current_page_id:e.detail.current
    })
    console.log("当前页面id为：",e.detail.current)
},

  //取消收藏该题目
  click_cancel_collect(){
    db.collection("users").where({
        _openid:wx.getStorageSync('openid')
    }).update({
        data:{
            [`collection.${this.data.activate_collection_id}.question_list`]: _.pull({ _id: this.data.question[this.data.current_page_id]._id })
        }
      }).then(res => {
          wx.showToast({
            title: '取消收藏成功',
          })
      })

    //修改question数组
    var  new_question=this.data.question
    new_question.splice(this.data.current_page_id, 1)
    this.setData({
        question : new_question
    })

    //修改question_status数组
    var new_question_status = this.data.question_status
    new_question_status.splice(this.data.current_page_id, 1); 
    for (let i = this.data.current_page_id; i < new_question_status.length; i++) {
        new_question_status[i].id -= 1;
    }
    this.setData({
        question_status:new_question_status
    })
},

confirm_choose(e){
    var i = e.target.dataset.i
    //如果用户未作答
    if(this.data.question_status[i].user_choice==-1){
      wx.showToast({
        title: '请先作答',
        icon:'error'
      })
    }
    else if(this.data.question_status[i].is_confirm==true){
      wx.showToast({
        title: '请勿重复提交',
        icon:'error'
      })
    }
    else{
      //获取第i题的正确选项
      var correct_choice_num = this.letter_to_num(this.data.question[i].correct_answer) 
      //获取用户的选项
      var user_choice_num = this.data.question_status[i].user_choice
      //判断用户是否回答正确，如果用户回答正确，标绿用户答案即可
      if(correct_choice_num == user_choice_num){
        this.setData({
          ["question_status["+i+"].options_color.["+user_choice_num+"]"]:'options_item_true',
        })

      }
      //如果用户答错，标红用户答案，标绿正确选项
      else{
        this.setData({
          ["question_status["+i+"].options_color.["+user_choice_num+"]"]:'options_item_false',
          ["question_status["+i+"].options_color.["+correct_choice_num+"]"]:'options_item_true',
        })
      }
      //标记该题用户已作答，且答题总数加一
      this.setData({
        ["question_status["+i+"].is_confirm"]:true,
      })
    }
  },

//将用户的选项数字转为字母
num_to_letter(e){
    if(e==0) return "A"
    else if(e==1) return "B"
    else if(e==2) return "C"
    else if(e==3) return "D"
    },
    
//将字母转为数字
letter_to_num(e){
if(e=='A') return 0
else if(e=='B') return 1
else if(e=='C') return 2
else if(e=='D') return 3
},

  //查看解析
  get_analysis(e){
    var i = e.target.dataset.i
    //如果用户未提交答案，则无法查看解析
    if(!this.data.question_status[i].is_confirm)
    {
      wx.showToast({
        title: '请先作答',
        icon:'error'
      })
    }
    else{
      //找到题目序号，并展开当前题目的解析
      for(let j=0;j<this.data.question.length;j++)
      {
        if(i==j){
          this.setData({
            //对相应选项染色
            ["question_status["+i+"].is_analysis"]:true
          })
        }
      }
    }
  },

  //用户点击了选项
  choose(e){
    var i = e.target.dataset.i
    console.log(i)
    var choice = e.target.dataset.choice
    //如果用户没有作答该题
    if(!this.data.question_status[i].is_confirm){
      //找到题目序号，并对相应选项染色，同时清除掉之前选择的选项的颜色
      for(let j=0;j<this.data.question.length;j++)
      {
        if(i==j){
          this.setData({
            //清除所有选项颜色
            ["question_status["+i+"].options_color"]:['options_item','options_item','options_item','options_item'],
            //对相应选项染色
            ["question_status["+i+"].options_color.["+choice+"]"]:'options_item_chosen',
            //将用户的选择传入question_status中
            ["question_status["+i+"].user_choice"]:choice
          })
        }
      }
    }
  },
  //初始化题目的状态
  initialize_question_status(){
    var question_status = []
    for(let i=0;i<this.data.question.length;i++)
    {
      question_status.push({
        id:i,
        options_color:['options_item','options_item','options_item','options_item'], 
        is_analysis:false,
        is_confirm:false,
        is_collect:true,
        collection_id:Number,
        user_choice:-1
      })
    }
    this.setData({
      question_status:question_status
    })
  },
})
