<template>
  <view class="login-container">
    <view class="login-card">
      <view class="login-title">用户管理系统</view>
      <uni-forms
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
      >
        <uni-forms-item label="用户名" name="username">
          <uni-easyinput v-model="loginForm.username" placeholder="请输入用户名"/>
        </uni-forms-item>

        <uni-forms-item label="密码" name="password">
          <uni-easyinput
              type="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              @confirm="handleLogin"
          />
        </uni-forms-item>

        <uni-forms-item label="验证码" name="captcha">
          <view class="captcha-container">
            <uni-easyinput
                style="width: 150px;"
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                @confirm="handleLogin"
            />
            <verify-code ref="verifyCodeRef" @update:code="captchaCode = $event"/>
          </view>
        </uni-forms-item>

        <uni-forms-item>
          <view class="btn-group">
            <button type="primary" :disabled="loading" @click="handleLogin" class="btn-primary">登录</button>
            <button @click="goToRegister" class="btn-default">注册</button>
          </view>
        </uni-forms-item>
      </uni-forms>
    </view>
  </view>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import {useUserStore} from "../../store/userStore";
import VerifyCode from "../../components/VerifyCode.vue";

const userStore = useUserStore();

const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
});

const loginRules = {
  username: {
    rules: [
      {required: true, errorMessage: '请输入用户名'}
    ]
  },
  password: {
    rules: [
      {required: true, errorMessage: '请输入密码'}
    ]
  },
  captcha: {
    rules: [
      {required: true, errorMessage: '请输入验证码'}
    ]
  }
};

const loginFormRef = ref(null);
const verifyCodeRef = ref(null);
const loading = ref(false);
const captchaCode = ref('');

const handleLogin = () => {
  loginFormRef.value.validate().then(valid => {
    if (!valid) {
      return false;
    }

    // 验证码校验
    if (loginForm.captcha.toLowerCase() !== captchaCode.value) {
      uni.showToast({
        title: '验证码错误',
        icon: 'none',
        duration: 2000
      });
      verifyCodeRef.value.refreshCode();
      return false;
    }

    loading.value = true;

    // 使用pinia
    userStore.loginAction(loginForm)
        .then(() => {
          uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000
          });

          // 延迟导航以显示成功消息
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        })
        .catch(() => {
          verifyCodeRef.value.refreshCode();
        })
        .finally(() => {
          loading.value = false;
        });
  });
};

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  });
};

onMounted(() => {
  // 如果已经登录，跳转到首页
  if (userStore.token) {
    uni.navigateTo({
      url: '/pages/index/index'
    });
  }
});


</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 90%;
  max-width: 400px;
  padding: 30px 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #fff;
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #303133;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-container .uni-easyinput {
  margin-right: 10px;
}

.btn-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-group button {
  flex: 1;
  margin: 0 10px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary {
  background-color: #409eff;
  color: #fff;
}

.btn-default {
  background-color: #f4f4f5;
  color: #606266;
  border: 1px solid #dcdfe6;
}
</style>