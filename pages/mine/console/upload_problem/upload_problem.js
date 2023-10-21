const db = wx.cloud.database()
const citys = {
  幼儿: ['综合素质','保教知识与能力'],
  小学: ['综合素质','教育教学知识与能力'],
  初中: ['综合素质','教育知识与能力','语文','数学','英语','物理','化学','生物'],
  高中: ['综合素质','教育知识与能力','语文','数学','英语','物理','化学','生物']
};
Page({
  data: {
    isShow:false,
    grade:'幼儿',
    subject:'综合素质',
    db_name:'infant_quality',
    progress:1,
    Length_of_problem_set_to_be_compared:'NaN',
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

    //通过打字上传题目
    upload_question(){
        if(this.data.db_name){
        if(!this.data.title){wx.showToast({title: '信息不完整',icon:"error"})}
    else if(!this.data.A){wx.showToast({title: '信息不完整',icon:"error"})}
    else if(!this.data.B){wx.showToast({title: '信息不完整',icon:"error"})}
    else if(!this.data.C){wx.showToast({title: '信息不完整',icon:"error"})}
    else if(!this.data.D){wx.showToast({title: '信息不完整',icon:"error"})}
    else if(!this.data.correct_answer){wx.showToast({title: '信息不完整',icon:"error"})}
    else if(!this.data.analysis){wx.showToast({title: '信息不完整',icon:"error"})}
    else{
        this.post(),
        this.get_progress()
    }
    }
    else{
    wx.showToast({
        title: '请选择题库类型',
        icon:'error',
        duration:500
    })
    }
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
    //获取对应题库对应的数据库名称
    get_db_name(){
        var grade = this.data.grade
        var subject = this.data.subject
        var db_name = ''
        if(grade=='幼儿'){
            if(subject=='综合素质') db_name='infant_quality'
            else db_name ='infant_ability'
        }
        else if(grade=='小学'){
            if(subject=='综合素质') db_name='primary_quality'
            else db_name='primary_ability'
        }
        else if(grade=='初中'){
            if(subject=='综合素质') db_name='secondary_quality'
            else if(subject=='教育知识与能力') db_name='secondary_ability'
            else if(subject=='语文') db_name='junior_chin'
            else if(subject=='数学') db_name='junior_math'
            else if(subject=='英语') db_name='junior_eng'
            else if(subject=='物理') db_name='junior_phy'
            else if(subject=='化学') db_name='junior_chem'
            else db_name='junior_bio'
        }
        else{
            if(subject=='综合素质') db_name='secondary_quality'
            else if(subject=='教育知识与能力') db_name='secondary_ability'
            else if(subject=='语文') db_name='senior_chin'
            else if(subject=='数学') db_name='senior_math'
            else if(subject=='英语') db_name='senior_eng'
            else if(subject=='物理') db_name='senior_phy'
            else if(subject=='化学') db_name='senior_chem'
            else db_name='senior_bio'
        }
        this.setData({db_name:db_name})
    },
      //获取输入题目的信息
      onChange_title(e){
        this.setData({
          title:e.detail
        })
      },
      onChange_A(e){
        this.setData({
          A:e.detail
        })
      },
      onChange_B(e){
        this.setData({
          B:e.detail
        })
      },
      onChange_C(e){
        this.setData({
          C:e.detail
        })
      },
      onChange_D(e){
        this.setData({
          D:e.detail
        })
      },
      onChange_correct_answer(e){
        this.setData({
            correct_answer: e.detail
          });
        console.log(e.detail)
      },
      onChange_analysis(e){
        this.setData({
          analysis:e.detail
        })
      },
    //先成功对后端进行post请求
    post(){
        this.setData({
            problem:{
                'title':this.data.title,
                'A':this.data.A,
                'B':this.data.B,
                'C':this.data.C,
                'D':this.data.D,
                'correct_answer':this.data.correct_answer,
                'analysis':this.data.analysis
            }
        })
        db.collection(this.data.db_name).get().then(res=>{  
            console.log("获取到了题集：",res.data)  
            console.log("problem:",this.data.problem)
            this.setData({
                Length_of_problem_set_to_be_compared:res.data.length
            })
            wx.request({
                url: 'http://localhost:5000/process',
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded' 
                    },
                data: {
                    problem: this.data.problem.title,
                    problem_set: JSON.stringify(res.data)
                },
                success: res1 => {
                    console.log('请求成功：', res1)
                },
                fail: res1 => {
                    console.log('请求失败：', res1)
                }
            })
        })
    },

    //获取目前后端执行进度，若执行结束，则获取相似题目
    get_progress(){
        // 显示加载提示框
        var that = this;
        var timer1 = setInterval(function() {
        wx.showLoading({
            title: '正在执行 ' + that.data.progress + '/' + that.data.Length_of_problem_set_to_be_compared
        });
        
        if (that.data.is_complete== true) {
            clearInterval(timer1);
            wx.hideLoading();
        }
        }, 1000);
        

        // 每隔一秒获取一下进度，即progress
        let timer2 = setInterval(() => {
            wx.request({
            url: 'http://localhost:5000/progress',
            method: 'GET',
            success: res2 => {
                console.log("当前正在执行第" , res2.data,"条")
                this.setData({
                    progress:res2.data
                })
                if(this.data.is_complete == true)
                    clearInterval(timer2);
            },
            fail: res2 => {
                console.log('请求失败：', res2)
            }
            })
        }, 1000)

        //每隔1秒判断后端进程是否已经进行完毕，即is_complete
        var that = this; 
        var timer3 = setInterval(function() {
            wx.request({
            url: 'http://localhost:5000/is_complete',
            method: 'GET',
            success: function(res1) {
                console.log("当前是否已经处理完全部题目:",res1.data);
                if (res1.data == true) {
                that.setData({
                    is_complete: true
                });
                that.get_similar_problem_set()
                clearInterval(timer3);
                }
            },
            fail: function(res1) {
                console.log('判断后端进程是否已经进行完毕的请求出错：', res1);
            }
            });
        }, 1000);            
    },

    //获取相似题目信息
    get_similar_problem_set(){
        //如果后端进程结束，获取到相似度较高的题目信息
        var that = this
        if (this.data.is_complete == true) { 
        wx.request({
            url: 'http://localhost:5000/outcomes',
            method: 'GET',
            success: res2 => {
            if(res2.data.length==0) {
                db.collection(this.data.db_name).add({
                    data:this.data.problem,
                    success:res=>{
                        wx.showToast({
                            title: '上传成功',
                            icon:'success'
                          })
                    }
                })
                }
            else{
                var similar_problem_set = res2.data.replace(/'/g, '"');
                var similar_problem_set = JSON.parse(similar_problem_set)
                that.setData({similar_problem_set:similar_problem_set})
                console.log("相似题目信息为：",similar_problem_set)
                wx.showToast({
                    title: '存在相似题',
                    icon:'error'
                  })
            } 
            
                setTimeout(()=>
                {
                    this.setData({
                        is_complete:false
                    })
                }, 1500)
                
            },
            fail: res2 => {
                wx.showToast({
                  title: '网络连接错误',
                  icon:'error'
                })
            }
        })
        }
    }
})