<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');

			// 检查登录状态
			const token = uni.getStorageSync('user_token');
			if (!token) {
				// 未登录状态，跳转至登录页
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
		}
	}
</script>

<style>
	/* 引入全局样式 */
	/* @import './static/styles/global.scss'; */

	/* 全局样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
		color: #333;
		font-size: 14px;
		line-height: 1.5;
		background-color: #f5f5f5;
		width: 100%;
		height: 100%;
	}

	/* 移除按钮默认样式 */
	button {
		position: relative;
		display: block;
		margin-left: 0;
		margin-right: 0;
		padding-left: 0;
		padding-right: 0;
		box-sizing: border-box;
		text-align: center;
		text-decoration: none;
		line-height: 1;
		border-radius: 4px;
		overflow: hidden;
		color: #333;
		background-color: #fff;
		/* 移除按钮阴影 */
		box-shadow: none;
	}

	button::after {
		border: none;
	}

	/* 移除输入框默认样式 */
	input {
		background-color: #fff;
	}

	/* 移除列表样式 */
	ul,
	ol {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/* 辅助类 */
	.text-center {
		text-align: center;
	}

	.text-left {
		text-align: left;
	}

	.text-right {
		text-align: right;
	}

	.flex {
		display: flex;
	}

	.flex-row {
		flex-direction: row;
	}

	.flex-column {
		flex-direction: column;
	}

	.flex-wrap {
		flex-wrap: wrap;
	}

	.justify-start {
		justify-content: flex-start;
	}

	.justify-center {
		justify-content: center;
	}

	.justify-end {
		justify-content: flex-end;
	}

	.justify-between {
		justify-content: space-between;
	}

	.justify-around {
		justify-content: space-around;
	}

	.align-start {
		align-items: flex-start;
	}

	.align-center {
		align-items: center;
	}

	.align-end {
		align-items: flex-end;
	}

	/* 间距类 */
	.mt-10 {
		margin-top: 10px;
	}

	.mb-10 {
		margin-bottom: 10px;
	}

	.ml-10 {
		margin-left: 10px;
	}

	.mr-10 {
		margin-right: 10px;
	}

	.pt-10 {
		padding-top: 10px;
	}

	.pb-10 {
		padding-bottom: 10px;
	}

	.pl-10 {
		padding-left: 10px;
	}

	.pr-10 {
		padding-right: 10px;
	}
</style>