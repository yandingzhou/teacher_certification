const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    question:[],
    question_status:[],
    have_done_total:0,
    current_page_id:0,
    is_show_collection:false,
  },

  //调用chatgpt接口回答问题
  get_AI_answer(){
      if(this.data.question_status[this.data.current_page_id].is_confirm == false){
          wx.showToast({
            title: '请先作答',
            icon:'error'
          })
      }
      else{
          wx.showLoading({
            title: 'AI作答中...',
          })

          const question_to_be_processed = '下面这个问题的正确选项是' + this.data.question[this.data.current_page_id].correct_answer + '，为什么？给出合理解释。' + this.data.question[this.data.current_page_id].title + 'A:' + this.data.question[this.data.current_page_id].A + 'B:' + this.data.question[this.data.current_page_id].B + 'C:' + this.data.question[this.data.current_page_id].C + 'D:' + this.data.question[this.data.current_page_id].D

          const url_token = "https://aip.baidubce.com/oauth/2.0/token?client_id=4GOztFdxxgyUdqNfAGGxHek9&client_secret=NDirgvN0FS66C5CWKhOBUHzog8mBDRTF&grant_type=client_credentials";

          wx.request({
            url: url_token,
            method: "POST",
            header: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            success:res=>{
                const access_token = res.data.access_token
                const url_chat = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=" + access_token
      
                const payload = {
                  "messages": [
                    {
                      "role": "user",
                      "content": question_to_be_processed
                    }
                  ]
                };
                wx.request({
                  url: url_chat,
                  method: "POST",
                  data: payload,
                  header: {
                    'Content-Type': 'application/json'
                  },
                  success: function (res) {
                    wx.hideLoading()
                    wx.showModal({
                        content: res.data.result,
                        showCancel : false,
                    })
                  },
                });
            },
          });
      }
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
            this.setData({
                ["question_status["+this.data.current_page_id+"].is_collect"]:false
            })
        }).catch(err => {
        console.error(err)
      })
  },
  //确认收藏该题目
  confirm_collect(){
      //判断用户是否已经收藏了该题
    if(this.data.question_status[this.data.current_page_id].is_collect==true){
        console.log("用户已收藏该题目")
        wx.showToast({
            title: '已收藏该题',
            icon:'error',
        })
    }
    //判断是否已经选择收藏夹了
    else if(this.data.activate_collection_id>=0){
      db.collection("users").where({
        _openid:wx.getStorageSync('openid')
      }).update({
        data:{
          [`collection.${this.data.activate_collection_id}.question_list`]: _.push(this.data.question[this.data.current_page_id])
        },
        success:res=>{
          console.log("成功加入了收藏夹",res)
          this.setData({
            ["question_status["+this.data.current_page_id+"].is_collect"]:true,
            ["question_status["+this.data.current_page_id+"].collection_id"]:this.data.activate_collection_id,
            is_show_collection:false
          })
          wx.showToast({
            title: '收藏成功',
          })
        },
        fail:res=>{
          console.log("加入收藏夹失败",res)
        }
      })
    }
    else{
      console.log("用户未选择收藏夹")
      wx.showToast({
        title: '请先选择收藏夹',
        icon:'error',
      })
    }
  },

  //选择了该收藏夹，将该收藏夹边缘标绿
  activate_collection(e){
    this.setData({
      activate_collection_id:e.target.dataset.i
    })
    console.log("当前选择的收藏夹序号为：",e.target.dataset.i)
  },

  //确认创建该收藏夹
  create_collection(){
    if(this.data.new_collection_name==''){
      wx.showToast({
        title: '收藏夹名称为空',
        icon:'error'
      })
    }
    else{
        wx.showToast({
          title: '创建中...',
          icon:'none'
        })
        db.collection('users').where({
        _openid:wx.getStorageSync('openid')
      }).update({
        data:{
          collection:_.push({
            collection_name:this.data.new_collection_name,
            question_list:[]
          })
        },
        success:res=>{
          //刷新目前获取的收藏夹数据
          this.click_collect()
          console.log("添加新收藏夹成功")
          wx.hideLoading()
          wx.showToast({
            title: '创建成功',
            duration:800
          })
          this.setData({
            is_show_create_collection: []
          });
        },
        fail:res=>{
          console.log("添加新收藏夹失败")
          wx.hideLoading()
          wx.showToast({
            title: '创建失败',
            icon:'error',
            duration:800
          })
        }
      })
    }
    
  },
  //获取用户要创建的新收藏夹名称
  get_new_collection_name(e){
    this.setData({
      new_collection_name:e.detail
    })
  },

  //是否展开创建收藏夹的界面
  is_show_create_collection(event){
    this.setData({
      is_show_create_collection: event.detail,
    });
  },

  //用户放弃收藏该题目
  quit_collect(){
    this.setData({
      is_show_collection:false
    })
  },

  //用户点击了收藏按钮，popup出收藏夹页面，获取到所有收藏夹
  click_collect(){
    if(!this.data.question_status[this.data.current_page_id].is_confirm)
    {
      wx.showToast({
        title: '请先作答',
        icon:'error'
      })
    }
    else{
      this.setData({
        is_show_collection:true
      })
      db.collection("users").where({
        _openid:wx.getStorageSync('openid')
      }).get({
        success:res=>{
          console.log("获取用户收藏夹成功",res)
          //获取所有收藏夹内容
          this.setData({
            collection:res.data[0]['collection']
          })
        },
        fail:res=>{
          console.log("获取用户收藏夹失败",res)
        }
      })
    }

  },

  //获取当前页面id
  get_current_page_id(e){
      this.setData({
        current_page_id:e.detail.current
      })
      console.log("当前页面id为：",e.detail.current)
  },
  
  onLoad(e){
    this.setData({
        db_name:e.db_name,
        question_sum:wx.getStorageSync('question_sum')
    })
    wx.showLoading({
      title: '题目加载中',
    })
    //先出十个题目
    this.get_question_list()
    //初始化十个题目的信息，即答题情况，存储到question_status中
    this.initialize_question_status()
},

  //确认选择
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
        this.true_sum()
        this.done_sum()
      }
      //如果用户答错，标红用户答案，标绿正确选项
      else{
        this.setData({
          ["question_status["+i+"].options_color.["+user_choice_num+"]"]:'options_item_false',
          ["question_status["+i+"].options_color.["+correct_choice_num+"]"]:'options_item_true',
        })
        this.done_sum()
      }
      //标记该题用户已作答，且答题总数加一
      this.setData({
        ["question_status["+i+"].is_confirm"]:true,
        have_done_total:this.data.have_done_total + 1
      })
      //将该题id加入到用户的已做题目单中
      this.upload_have_done_quetion_id(this.data.question[i]._id)
    }
  },

  //将该题_id传到对应的已做题目的数据库记录中，保证下次不会再出到该题目
  upload_have_done_quetion_id(id){
    db.collection('users').where({
      _openid:wx.getStorageSync('openid')
    }).update({
      data:{
        [this.data.db_name]:_.push(id)
      },
      success:res=>{
        console.log("已成功添加已做题目id至数据库中")
      },
      fail:res=>{
        console.log("添加已做题目id至数据库失败")
      }
    })
  },
  //true_sum++
  true_sum(){
    db.collection('users').where({
      _openid:wx.getStorageSync('openid')
    }).update({
      data:{
        true_sum:_.inc(1)
      },
      success:res=>{
        console.log('true_sum自增成功')
      },
      fail:res=>{
        console.log('true_sum自增失败')
      }
    })
  },

  //done_sum++
  done_sum(){
    db.collection('users').where({
      _openid:wx.getStorageSync('openid')
    }).update({
      data:{
        done_sum:_.inc(1)
      },
      success:res=>{
        console.log('done_sum自增成功')
      },
      fail:res=>{
        console.log('done_sum自增失败')
      }
    })
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
      for(let j=0;j<this.data.question_sum;j++)
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
    var choice = e.target.dataset.choice
    //如果用户没有作答该题
    if(!this.data.question_status[i].is_confirm){
      //找到题目序号，并对相应选项染色，同时清除掉之前选择的选项的颜色
      for(let j=0;j<this.data.question_sum;j++)
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
    for(let i=0;i<this.data.question_sum;i++)
    {
      question_status.push({
        id:i,
        options_color:['options_item','options_item','options_item','options_item'], 
        is_analysis:false,
        is_confirm:false,
        is_collect:false,
        collection_id:Number,
        user_choice:-1
      })
    }
    this.setData({
      question_status:question_status
    })
  },

  //获取题目列表,若获取失败，则退出
  get_question_list(){
    db.collection('users').where({
        _openid : wx.getStorageSync('openid')
      }).get({
          success:res=>{
            db.collection(this.data.db_name)
            .aggregate()
            .match({
              _id:_.nin(res.data[0][this.data.db_name])
            })
            .sample({size:this.data.question_sum})
            .end({
              success:res=>{
                if(res.list.length==0){
                    wx.showToast({
                        title: '题目已做完',
                        icon:'error'
                      }),
                      setTimeout(()=>{
                        wx.switchTab({
                          url: '/pages/study/study/study',
                        })
                      },1000)
                }
                else{
                    console.log("成功获取到题目信息",res)
                    this.setData({
                        question:res.list
                    })
                    wx.hideLoading()
                }
              }
            })
          },
          fail:res=>{
              console.log("题目获取失败")
          }
      })
  },
})