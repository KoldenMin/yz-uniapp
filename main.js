import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
// import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	// 注册全局组件
	// app.component('uni-popup', uniPopup)
	return {
		app
	}
}
// #endif