<!-- src/pages/register/index.vue -->
<template>
  <view class="register-container">
    <view class="register-card">
      <view class="register-title">用户注册</view>
      <uni-forms
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="100px"
      >
        <uni-forms-item label="用户名" name="username">
          <uni-easyinput v-model="registerForm.username" placeholder="请输入用户名"/>
        </uni-forms-item>

        <uni-forms-item label="密码" name="password">
          <uni-easyinput
              type="password"
              v-model="registerForm.password"
              placeholder="请输入密码"
          />
        </uni-forms-item>

        <uni-forms-item label="确认密码" name="confirmPassword">
          <uni-easyinput
              type="password"
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
          />
        </uni-forms-item>

        <uni-forms-item label="姓名" name="realName">
          <uni-easyinput v-model="registerForm.realName" placeholder="请输入姓名"/>
        </uni-forms-item>

        <uni-forms-item label="性别" name="gender">
          <uni-data-checkbox
              v-model="registerForm.gender"
              :localdata="genderOptions"
          />
        </uni-forms-item>

        <uni-forms-item label="年龄" name="age">
          <uni-number-box
              v-model="registerForm.age"
              :min="18"
              :max="100"
          />
        </uni-forms-item>

        <uni-forms-item label="电话" name="phone">
          <uni-easyinput v-model="registerForm.phone" placeholder="请输入手机号码"/>
        </uni-forms-item>

        <uni-forms-item label="当前住址" name="currentAddress">
          <uni-easyinput v-model="registerForm.currentAddress" placeholder="请输入当前住址"/>
        </uni-forms-item>

        <uni-forms-item label="入职时间" name="entryTime">
          <uni-datetime-picker
              v-model="registerForm.entryTime"
              type="date"
              return-type="string"
              format="yyyy-MM-dd"
          />
        </uni-forms-item>

        <uni-forms-item label="职能描述" name="jobDescription">
          <uni-easyinput
              v-model="registerForm.jobDescription"
              type="textarea"
              placeholder="请输入职能描述"
          />
        </uni-forms-item>

        <uni-section title="教育背景信息" type="line"></uni-section>

        <view v-for="(edu, index) in registerForm.educationList" :key="index" class="education-item">
          <view class="education-header">
            <text class="education-title">教育背景 #{{ index + 1 }}</text>
            <button
                v-if="registerForm.educationList.length > 1"
                type="warn"
                size="mini"
                class="remove-btn"
                @click="removeEducation(index)"
            >
              删除
            </button>
          </view>

          <uni-forms-item
              :label="'学校'"
              :name="`educationList[${index}].school`"
          >
            <uni-easyinput v-model="edu.school" placeholder="请输入学校名称"/>
          </uni-forms-item>

          <uni-forms-item
              :label="'专业'"
              :name="`educationList[${index}].major`"
          >
            <uni-easyinput v-model="edu.major" placeholder="请输入专业"/>
          </uni-forms-item>

          <uni-forms-item
              :label="'学位'"
              :name="`educationList[${index}].degree`"
          >
            <uni-data-select
                v-model="edu.degree"
                :localdata="degreeOptions"
                placeholder="请选择学位"
            />
          </uni-forms-item>

          <uni-forms-item
              :label="'开始日期'"
              :name="`educationList[${index}].startDate`"
          >
            <uni-datetime-picker
                v-model="edu.startDate"
                type="date"
                return-type="string"
                format="yyyy-MM-dd"
            />
          </uni-forms-item>

          <uni-forms-item
              :label="'结束日期'"
              :name="`educationList[${index}].endDate`"
          >
            <uni-datetime-picker
                v-model="edu.endDate"
                type="date"
                return-type="string"
                format="yyyy-MM-dd"
            />
          </uni-forms-item>

          <uni-forms-item
              :label="'描述'"
              :name="`educationList[${index}].description`"
          >
            <uni-easyinput
                v-model="edu.description"
                type="textarea"
                placeholder="请输入教育经历描述"
            />
          </uni-forms-item>

          <view class="divider" v-if="index < registerForm.educationList.length - 1"></view>
        </view>

        <view class="btn-group">
          <button
              type="primary"
              size="mini"
              @click="addEducation"
              class="add-edu-btn"
          >
            添加教育背景
          </button>
        </view>

        <view class="btn-group submit-group">
          <button type="primary" :disabled="loading" @click="handleRegister" class="btn-primary">立即注册</button>
          <button @click="goToLogin" class="btn-default">返回登录</button>
        </view>
      </uni-forms>
    </view>
  </view>
</template>

<script setup>
import {ref, reactive} from 'vue';
import {register} from "../../api/user";

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  gender: 1,
  age: 18,
  phone: '',
  currentAddress: '',
  entryTime: '',
  jobDescription: '',
  educationList: [
    {
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  ]
});

const genderOptions = [
  {value: 1, text: '男'},
  {value: 0, text: '女'}
];

const degreeOptions = [
  {value: '学士', text: '学士'},
  {value: '硕士', text: '硕士'},
  {value: '博士', text: '博士'},
  {value: '其他', text: '其他'}
];

// uni-app表单校验规则
const registerRules = {
  username: {
    rules: [
      {required: true, errorMessage: '请输入用户名'},
      {minLength: 2, maxLength: 20, errorMessage: '长度在2到20个字符'}
    ]
  },
  password: {
    rules: [
      {required: true, errorMessage: '请输入密码'},
      {minLength: 2, errorMessage: '密码长度不能小于2位'},
      {
        validateFunction: (rule, value, data, callback) => {
          if (data.confirmPassword && value !== data.confirmPassword) {
            callback('两次输入密码不一致');
          }
          return true;
        }
      }
    ]
  },
  confirmPassword: {
    rules: [
      {required: true, errorMessage: '请再次输入密码'},
      {
        validateFunction: (rule, value, data, callback) => {
          if (value !== data.password) {
            callback('两次输入密码不一致');
          }
          return true;
        }
      }
    ]
  },
  realName: {
    rules: [
      {required: true, errorMessage: '请输入姓名'}
    ]
  },
  gender: {
    rules: [
      {required: true, errorMessage: '请选择性别'}
    ]
  },
  age: {
    rules: [
      {required: true, errorMessage: '请输入年龄'},
      {
        validateFunction: (rule, value, data, callback) => {
          if (value < 18 || value > 100) {
            callback('年龄必须在18到100之间');
          }
          return true;
        }
      }
    ]
  },
  phone: {
    rules: [
      {required: true, errorMessage: '请输入手机号码'},
      {
        validateFunction: (rule, value, data, callback) => {
          const phoneReg = /^1[3-9]\d{9}$/;
          if (value && !phoneReg.test(value)) {
            callback('请输入正确的手机号码');
          }
          return true;
        }
      }
    ]
  }
};

const registerFormRef = ref(null);
const loading = ref(false);

const addEducation = () => {
  registerForm.educationList.push({
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: '',
    description: ''
  });
};

const removeEducation = (index) => {
  registerForm.educationList.splice(index, 1);
};

const handleRegister = () => {
  registerFormRef.value.validate().then(valid => {
    if (!valid) {
      return false;
    }

    loading.value = true;

    // 处理提交数据
    const formData = {
      username: registerForm.username,
      password: registerForm.password,
      realName: registerForm.realName,
      gender: registerForm.gender,
      age: registerForm.age,
      phone: registerForm.phone,
      currentAddress: registerForm.currentAddress,
      entryTime: registerForm.entryTime,
      jobDescription: registerForm.jobDescription,
      educationList: registerForm.educationList
    };

    register(formData)
        .then(() => {
          uni.showToast({
            title: '注册成功，请登录',
            icon: 'success',
            duration: 2000
          });

          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);
        })
        .catch(() => {
          // 错误处理由全局拦截器完成
        })
        .finally(() => {
          loading.value = false;
        });
  });
};

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  });
};

</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.register-card {
  width: 90%;
  max-width: 600px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #fff;
  margin-bottom: 30px;
}

.register-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.education-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #f8f8f8;
  margin-bottom: 20px;
}

.education-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.education-title {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

.remove-btn {
  font-size: 12px;
  padding: 2px 8px;
}

.divider {
  height: 1px;
  background-color: #dcdfe6;
  margin: 10px 0;
}

.btn-group {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.add-edu-btn {
  font-size: 14px;
  padding: 5px 15px;
}

.submit-group {
  justify-content: space-between;
  margin-top: 30px;
}

.submit-group button {
  flex: 1;
  margin: 0 10px;
  height: 40px;
  line-height: 40px;
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