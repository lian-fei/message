<template>
  <div class="hello">
    <iframe ref="iframebox" src=""></iframe>
		<button @click="prev">上一题</button>
		<button @click="next">下一题</button>
		<button @click="submit">提交</button>
  </div>
</template>

<script>
import KejianBox from './index.js'
export default {
  name: 'test',
  data () {
    return {
			query: this.$route.query,
			KejianBox: ''
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.KejianBox = new KejianBox({
				requestTestUrl: 'http://10.90.71.143:8080/mockjsdata/48/getinfos',
				submitTestUrl: 'http://10.90.71.143:8080/mockjsdata/48/submitTestUrl',
				iframeBox: this.$refs.iframebox
			})
			
			// let obj = {// 端上给
			// 	liveId: this.liveId,
			// 	testIds: this.testIdArr.join(','),
			// 	token: this.token,
			// 	xes_rfh: this.xesrfh
			// }
			
			this.KejianBox.init(this.query)
			.then(res => {
				console.log(res)
				console.log(this.KejianBox)
				console.log('success')
			})
			.catch(err => {
				console.log(err)
				console.log('error')
			})
		},
		prev () {
			this.KejianBox.prevTopic()
		},
		next () {
			this.KejianBox.nextTopic()
		},
		submit () {
			this.KejianBox.submitData(this.query)
			.then(res => {
				console.log(res)
			})
			.catch(err => {
				console.log(err)
			})
		}
  }
}
</script>

<style>
	iframe{
		width:100%;
		height:500px;
	}
</style>
