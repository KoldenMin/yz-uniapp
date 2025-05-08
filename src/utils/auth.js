// src/utils/auth.js

const TokenKey = 'User-Token';
const UserInfoKey = 'User-Info';

export function getToken() {
    try {
        return uni.getStorageSync(TokenKey);
    } catch (e) {
        console.error('获取Token失败', e);
        return null;
    }
}

export function setToken(token) {
    try {
        uni.setStorageSync(TokenKey, token);
        return true;
    } catch (e) {
        console.error('保存Token失败', e);
        return false;
    }
}

export function removeToken() {
    try {
        uni.removeStorageSync(TokenKey);
        return true;
    } catch (e) {
        console.error('删除Token失败', e);
        return false;
    }
}

export function getUserInfo() {
    try {
        const userInfo = uni.getStorageSync(UserInfoKey);
        return userInfo ? JSON.parse(userInfo) : null;
    } catch (e) {
        console.error('获取用户信息失败', e);
        return null;
    }
}

export function setUserInfo(userInfo) {
    try {
        uni.setStorageSync(UserInfoKey, JSON.stringify(userInfo));
        return true;
    } catch (e) {
        console.error('保存用户信息失败', e);
        return false;
    }
}

export function removeUserInfo() {
    try {
        uni.removeStorageSync(UserInfoKey);
        return true;
    } catch (e) {
        console.error('删除用户信息失败', e);
        return false;
    }
}

export function isAdmin() {
    const userInfo = getUserInfo();
    return userInfo && userInfo.isAdmin === true;
}

export function clearLoginInfo() {
    removeToken();
    removeUserInfo();
}