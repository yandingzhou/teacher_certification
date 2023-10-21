const db = wx.cloud.database()
const _ = db.command

const citys = {
  模拟试卷:['幼儿','小学','初中','高中'],
  历年真题:['幼儿','小学','初中','高中']
};

Page({
    data:{
        isShow:false,   //试卷上传类型选择
        isShow2:false,  //是否继续上传试卷
        type:'模拟试卷',
        stage:'幼儿',
        columns: [
            {
            values: Object.keys(citys),
            className: 'column1',
            },
            {
            values: citys['模拟试卷'],
            className: 'column2',
            },
        ]
    },
    preview(){
        wx.navigateTo({
            url: '/pages/home/web_view/web_view?url='+encodeURIComponent(this.data.tempFilePath)
          });
    },
    //先选择文件
    choose_file(){
        wx.chooseMessageFile({
            count: 1, // 最多可以选择的文件数量
            type: 'file', // 限制选择文件类型为任意文件
            success: (res) => {
              this.setData({
                  fileName : res.tempFiles[0].name,
                  tempFilePath : res.tempFiles[0].path
                })
              console.log("文件名：",res.tempFiles[0].name)
              console.log("文件临时链接：",res.tempFiles[0].path)
              this.is_uploadFile()
            },
            fail: (error) => {
              console.error(error)
            }
          })
    },
    //修改文件名，实现预览，是否继续上传
    is_uploadFile(){this.setData({ isShow2: true });},
    onClose_is_uploadFile(){this.setData({ isShow2: false });},
    onChange_test_paper_name(e){this.setData({fileName:e.detail})},
    //然后上传文件
    uploadFile(){
        this.setData({isShow2:false})
        wx.showLoading({
            title: '上传中...',
          })
        wx.cloud.uploadFile({
        cloudPath: Date.now() + '-' + Math.floor(Math.random() * 1000) + '.pdf', 
        filePath: this.data.tempFilePath, 
        success: (res) => {
            var fileID = res.fileID
            this.getFileLink(fileID)
        },
        fail: (error) => {
            console.error(error)
        }
        })
    },
    //获取文件链接的函数
    getFileLink(fileID){
        wx.cloud.getTempFileURL({
          fileList: [fileID], 
          success: (res) => {
            var fileList = res.fileList
            if (fileList.length > 0) {
              var fileLink = fileList[0].tempFileURL
              this.setData({fileLink : fileLink})
              console.log('文件云存储链接:', fileLink)
              this.upload_to_db()
            }
          },
          fail: (error) => {
            console.error(error)
          }
        })
    },
    //将文件名和文件上传到数据库中
    upload_to_db(){
        //先获取试卷的分类
        var test_papers_type
        if(this.data.type == '模拟试卷'){
            test_papers_type = 'simulation_papers'
        }
        else{
            test_papers_type = 'past_exam_papers'
        }
        //获取试卷的阶段
        var stage 
        if(this.data.stage == '幼儿'){
            stage = 'infant'
        }
        else if((this.data.stage == '小学')){
            stage = 'primary'
        }
        else if((this.data.stage == '初中')){
            stage = 'junior'
        }
        else{
            stage = 'senior'
        }
        //上传试卷信息到数据库中
        db.collection('test_papers').where({
            test_papers_type : test_papers_type
          }).get().then(res => {
            const data = res.data;
            const currentDate = new Date();
            const uploadTime = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
            
            for (let i = 0; i < data.length; i++) {
              const testPaperInfo = data[i].test_paper_info;
          
              for (let j = 0; j < testPaperInfo.length; j++) {
                if (testPaperInfo[j].stage === stage ) {
                  const docId = data[i]._id;
                  const index = j;
          
                  db.collection('test_papers').doc(docId).update({
                    data: {
                      ['test_paper_info.' + index + '.all_test_papers']: _.push({
                          "test_papers_name" : this.data.fileName,
                          "test_papers_url" : this.data.fileLink,
                          "upload_time": uploadTime,
                      })
                    }
                  }).then(() => {
                      wx.hideLoading()
                      wx.showToast({
                        title: '上传成功',
                      })
                    console.log('Push operation completed successfully.');
                  }).catch(error => {
                    wx.hideLoading()
                    wx.showToast({
                      title: '上传失败',
                      icon:'error'
                    })
                    console.error('Error occurred during push operation:', error);
                  });
          
                  break; 
                }
              }
            }
          }).catch(error => {
            console.error('Error occurred during query:', error);
          });
    },

    choose_type_and_stage(){
        this.setData({
            isShow:true
        })
    },
    confirm_choose(){
        this.setData({
            isShow:false,
        })
    },
    cancel_choose(){
        this.setData({
            isShow:false
        })
    }, 

    onChange_choose(event) {
        this.setData({
            type : event.detail.value[0],
            stage : event.detail.value[1]
        })
        const { picker, value, index } = event.detail;
        picker.setColumnValues(1, citys[value[0]]);
    },

})