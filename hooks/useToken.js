// 令牌钩子，用于管理token相关操作
const TOKEN_KEY = 'user_token';

/**
 * 令牌钩子
 * @returns {{getToken: (function(): string), setToken: setToken, removeToken: removeToken}}
 */
export function useToken() {
  /**
   * 设置token
   * @param token 令牌
   */
  const setToken = (token) => {
    uni.setStorageSync(TOKEN_KEY, token);
  };

  /**
   * 获取token
   * @returns {string} 令牌
   */
  const getToken = () => {
    return uni.getStorageSync(TOKEN_KEY) || '';
  };

  /**
   * 移除token
   */
  const removeToken = () => {
    uni.removeStorageSync(TOKEN_KEY);
  };

  return {
    setToken,
    getToken,
    removeToken
  };
}