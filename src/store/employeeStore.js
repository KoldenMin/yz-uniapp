// src/store/employeeStore.js
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {getEmployeeByUserId} from "@/api/employee";
import {useUserStore} from "./userStore";

export const useEmployeeStore = defineStore('employee', () => {
    const employeeInfo = ref(null);
    const loading = ref(false);
    // 计算属性：获取员工ID
    const employeeId = computed(() => employeeInfo.value?.id || null);

    // 计算属性：获取员工姓名
    const employeeName = computed(() => employeeInfo.value?.name || '');

    // 计算属性：判断当前用户是否是员工
    const isEmployee = computed(() => !!employeeInfo.value);

    // 根据用户id获取员工信息
    async function getEmployeeInfoAction() {
        const userStore = useUserStore();
        if (!userStore.userInfo) {
            return Promise.reject(new Error('用户未登录'));
        }
        loading.value = true;

        try {
            const userId = userStore.userInfo.id;
            const response = await getEmployeeByUserId(userId);
            if (response.code === 200 && response.data) {
                employeeInfo.value = response.data;
                return response.data;
            } else {
                employeeInfo.value = null;
                uni.showToast({
                    title: '该用户不是员工或获取员工信息失败',
                    icon: 'none',
                    duration: 2000
                });
                return null;
            }
        } catch (error) {
            uni.showToast({
                title: "获取员工信息失败: " + (error.message || "未知错误"),
                icon: 'none',
                duration: 2000
            });
            return Promise.reject(error);
        } finally {
            loading.value = false;
        }
    }

    async function clearEmployeeInfoAction() {
        employeeInfo.value = null;
    }

    return {
        employeeInfo,
        loading,
        employeeId,
        employeeName,
        isEmployee,
        getEmployeeInfoAction,
        clearEmployeeInfoAction
    }
});