import { ElMessage } from 'element-plus'

export const handleError = (error, context = '') => {
  console.error(`${context} Error:`, error)
  
  if (error.response) {
    switch (error.response.status) {
      case 401:
        ElMessage.error('请重新登录')
        // 跳转到登录页
        break
      case 403:
        ElMessage.error('没有权限')
        break
      case 404:
        ElMessage.error('资源不存在')
        break
      case 500:
        ElMessage.error('服务器错误')
        break
      default:
        ElMessage.error(error.message || '未知错误')
    }
  } else {
    ElMessage.error(error.message || '网络错误')
  }
} 