import axios from 'axios'
class KejianBox {
  constructor (options = {}) {
    this.default = options
    this.coursewareData = [] // 课件的总数据
    this.testCount = 0 // 课件的总个数
    this.curTestNum = 0 // 当前的试题索引
    this.curTest = {} // 当前试题的信息
    this.curTime = 0 // 作答时间
    this.curQuestion = {} // 当前题的信息
    this.isShowCurTime = false // 是否显示作答时间
    this.isLoadingSuccess = false // 课件是否加载完成
    this.isShowSubmitBtn = false // 交卷按钮是否显示
    this.source = 1 // 1在现教研 2设计组
    this.answerContent = [] // 答案数组
    this.showAnswerContent = [] // 答案数组
    this.action = null // 当前操作 next：下一个 prev：上一个 submit:主动提交
    this.isForce = false // 是否强制性提交
    this.checkEquipment()
  }
  /**
   * 检查设备
   */
  checkEquipment () {
    let UserAgent = window.navigator.userAgent.toLowerCase()
    this.isPc = UserAgent.match(/xescef/i) ? UserAgent.match(/xescef/i)[0] === 'xescef' : false
    this.isMobile = UserAgent.match(/jzh/i) ? UserAgent.match(/jzh/i)[0] === 'jzh' : 0 ||
    UserAgent.match(/iphone/i) ? UserAgent.match(/iphone/i)[0] === 'iphone' : 0 ||
    UserAgent.match(/android/i) ? UserAgent.match(/android/i)[0] === 'android' : 0 ||
    UserAgent.match(/ipad/i) ? UserAgent.match(/ipad/i)[0] === 'ipad' : 0 ||
    UserAgent.match(/windows phone/i) ? UserAgent.match(/windows phone/i)[0] === 'windows phone' : false
    this.isIOS = !!UserAgent.match(/\(i[^;]+;( U;)? cpu.+mac os x/)
  }
  /**
   * 监测message事件
   */
  _messageListener () {
    window.addEventListener('message', (e) => {
      switch (e.data.type) {
      // 课件给h5发送消息，是否加载完成
      case 'loadComplete':
        console.log('%c1.loadComplete，课件信息加载完成', 'color:green', e.data)
        this.sendLookAnswerStatusToIframe()
        break
      // 页面回填答案结束，进入作答状态
      case 'doStatusComplete':
        console.log('%c3.doStatusComplete，页面回填答案结束，进入作答状态', 'color:green', e.data)
        this.isLoadingSuccess = true
        this.isShowCurTime = true
        break
      // 当前课件中题的信息
      case 'questionStatus':
        console.log('%c4.questionStatus,小题信息', 'color:green', e.data)
        this.curQuestion = e.data.data
        break
      // 老版课件发来了消息
      case 'submitAnswer':
        console.log('%c5.submitAnswer，老版课件发来了消息', 'color:green', e.data)
        break
      case 'answer':
        console.log('%c6.answer，接收到的answer', 'color:green', e.data.data)
        // 更新数据
        // this.updateAnswerToLocal(e.data.data)
        switch (this.action) {
        case 'next':
          this.nextTestAction(e.data.data)
          break
        case 'prev':
          this.prevTestAction(e.data.data)
          break
        case 'submit':
          this.submitAnswerAction(e.data.data)
          break
        case 'forceSubmit':
          this.forceSubmit(e.data.data)
          break

        default:
          console.log('%c本地上传', 'color:red', e.data.data)
          that.localHtmlSubmit(e.data.data)
          break
        }
        break
      default:
        break
      }
    }, false)
  }
  /**
   * 页面初始化
   */
  async init (params) {
    console.log(params)
    if (typeof params !== 'object') console.error('params is not object')
    if (!this.default.requestTestUrl) console.error('requestTestUrl is not defined')
    this.parames = parames
    this._messageListener()
    let res = await axios.post(this.default.requestTestUrl, params)
    if (res.data.stat === 1) {
      this.coursewareData = res.data.data.list
      if (this.coursewareData.length > 0) {
        this.testCount = this.coursewareData.length
        this.curTestNum = 0
        this.curTest = this.coursewareData[0]
        this.curTime = res.data.data.releaseTime
        if (this.default.iframeBox) this.default.iframeBox.src = this.curTest.previewPath
        this.localLoad()
        this.checkSubjectSource()
        this.initAnswerContent(this.source)
      }
    }
    return res
  }
  /**
   * 本地加载 TODO
   */
  localLoad () {

  }

  /**
   * 判断题目来源
   */
  checkSubjectSource () {
    // 判断题目来源
    // 1-在线教研填空
    // 2-在线教研选择
    // 4-在线教研语音测评
    // 5-在线教研roleplay
    // 6-在线教研语文跟读，
    // 7-本地上传普通
    // 8-在线教研语文主观题
    // 9-本地上传课前测
    // 10-本地上传课中测
    // 11-本地上传出门考
    // 12-本地上传游戏
    // 13-本地上传互动题
    // 14-本地上传语音测评
    var totalType = [1, 2, 18, 19]
    if (totalType.includes(this.curTest.testType)) {
      this.source = 1
      if (this.testCount > 1) {
        this.submitBtnShow = false
      } else {
        this.submitBtnShow = true
      }
    } else {
      this.source = 2
      this.isShowSubmitBtn = true
    }
  }
  /**
   * 获取试题之后，初始化答案
   */ 
  initAnswerContent (type) {
    if (type === 1) {
      this.answerContent = []
      this.showAnswerContent = []
      this.coursewareData.forEach(item => {
        let answerObject = {
          choice : [],
          blank : [],
          testId : item.testId
        }
        this.answerContent.push(answerObject)
        this.showAnswerContent.push([{id: '', text: ''}])
      })

      if (this.getLocalStorage('answerContent')) {
        this.answerContent = testLocalData.getData('answerContent')
      }
      if (this.getLocalStorage('showAnswerContent')) {
        this.showAnswerContent = testLocalData.getData('showAnswerContent')
      }
    } else {
      this.removeLocaStorageData()
    }
  }

  // 答案的回显操作
  sendLookAnswerStatusToIframe () {
    let userAnswerContent = []
    if (this.source === 1) {
      const index = this.curPageNumber - 1
      if (this.showAnswerContent[index] && this.showAnswerContent[index][0] && this.showAnswerContent[index][0].id) {
        userAnswerContent = this.showAnswerContent[index]
      }
    }
    let sendToIframeData = {
      type: 'lookAnswerStatus',
      data: {
        'isCanAnswer': 1,
        'userAnswerContent': userAnswerContent // 初始化未作答[],作答过为答案内容
      }
    }
    console.log('%c2.lookAnswerStatus，给课件发送用户作答信息，回显答案', 'color:green', sendToIframeData)
    if (this.default.iframeBox) this.default.iframeBox.contentWindow.postMessage(sendToIframeData, '*')
  }

  /**
   * 点击下一题, 发送给课件消息
   */ 
  nextTopic () {
    if (this.curTestNum === this.testCount - 1) return
    this.action = 'next'
    this.getAnswerFromIframe()
  }

  /**
   * 先保存答案，并切换下一题
   */
  nextTestAction (answer) {
    this.saveAnserContent(answer)
    // 切换下一题
    this.curTestNum++
    this.curTest = this.coursewareData[this.curTestNum]
    if (this.default.iframeBox) this.default.iframeBox.src = this.curTest.previewPath
  }

  /**
   * 上一题
   */ 
  prevTopic () {
    if (this.curTestNum <=0) return
    this.action = 'prev'
    this.getAnswerFromIframe()
  }

  /**
   * 先保存答案，并切换上一题
   */
  prevTestAction (answer) {
    this.saveAnserContent(answer)
    // 切换上一题
    this.curTestNum--
    this.curTest = this.coursewareData[this.curTestNum]
    if (this.default.iframeBox) this.default.iframeBox.src = this.curTest.previewPath
  }

  /**
   * 保存答案
   */
  saveAnserContent (answer) {
    const content = answer && answer[0].userAnswerContent
    const index = this.curPageNumber - 1
    this.showAnswerContent[index] = content
    if (content) {
      var length = content.length
      if ((this.hrefInfo[index].testType === 2 || this.hrefInfo[index].testType === 19) && length > 0) {
        this.answerContent[index].choice = []
        for (let i = 0; i < length; i++) {
          this.answerContent[index].choice.push(content[i].text)
        }
      }
      if ((this.hrefInfo[index].testType === 1 || this.hrefInfo[index].testType === 18) && length > 0) {
        this.answerContent[index].blank = []
        let flag = 0
        for (let m = 0; m < length; m++) {
          if (!content[m].text) {
            flag++
          }
        }
        if (flag !== length) {
          for (let i = 0; i < length; i++) {
            this.answerContent[index].blank.push(content[i].text)
          }
        }
      }
      if (length === 0) {
        if (this.hrefInfo[index].testType === 2 || this.hrefInfo[index].testType === 19) {
          this.answerContent[index].choice = []
        }
        if (this.hrefInfo[index].testType === 1 || this.hrefInfo[index].testType === 18) {
          this.answerContent[index].blank = []
        }
      }
      this.setLocalStorage('answerContent', this.answerContent)
      this.setLocalStorage('showAnswerContent', this.showAnswerContent)
    }
    console.log(this.answerContent, this.showAnswerContent)
  }
  
  /**
   * 获取答题结果
   */ 
  getAnswerFromIframe () {
    let sendToIframeData = {
      type: 'getAnswer',
      data: {}
    }
    if (this.default.iframeBox) this.default.iframeBox.contentWindow.postMessage(sendToIframeData, '*')
  }

  /**
   * 手动提交
   */ 
  autonomySubmit (obj) {
    this.action = 'submit'
    this.getAnswerFromIframe()
  }

  /**
   * 先保存答案，并提交答案
   */
  submitAnswerAction (answer) {
    this.saveAnserContent(answer)
    if (this.hasSubmit) return
    for (let i = 0; i < this.answerContent.length; i++) {
      if ((this.hrefInfo[i].testType === 1 || this.hrefInfo[i].testType === 18) && (!this.answerContent[i].blank.length || this.answerContent[i].blank.indexOf('') !== -1)) {
        this.notFinishShow = true
        if (!this.isPc && !this.isMobile) console.error('设备判断错误')
        break
      }
      if (((this.hrefInfo[i].testType === 2 || this.hrefInfo[i].testType === 19) && !this.answerContent[i].choice.length)) {
        this.notFinishShow = true
        if (!this.isPc && !this.isMobile) console.error('设备判断错误')
        break
      }
    }
    if (!this.notFinishShow) {
      if (this.hasSubmit) {
        this.hasSubmit2 = true
      } else {
        this.hasSubmit = true
        this.hasSubmit2 = false
      }
      this.submitAjax()
    }
    console.log(this.answerContent)
  }

  /**
   * 提交答案到php
   */ 
  submitAjax () {
    this.parames.answers = JSON.stringify(this.answerContent)
    this.parames.isForce = this.isForce

    console.log(`%c7.提交答案到php，是否是强制性提交hasSubmit2`, 'color:red;', this.hasSubmit, obj)
    axios.post(this.default.submitTestUrl, params)
      .then((res) => {
        console.log(res.data)
      })
      .catch((error) => {
        console.log('%cerror', 'color:red', error)
      })
  }

  /**
   * 清除所有的locastorage
   */ 
  removeLocaStorageData () {
    if (window.localStorage) {
      window.localStorage.clear()
    }
  }
  /**
   * 获取locaStorage中的内容
   */ 
  getLocalStorage (key) {
    if (window.localStorage) {
			return JSON.parse(localStorage.getItem(key))
		}
  }
  /**
   * 往locaStorage中存储数据
   */ 
  setLocalStorage (key, value) {
    var val = JSON.stringify(value)
		if (window.localStorage) {
			localStorage.setItem(key, val)
		}
  }
}
export default KejianBox