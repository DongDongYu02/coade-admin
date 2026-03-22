import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 全局配置
NProgress.configure({
  easing: 'ease',
  speed: 350,
  trickleSpeed: 200,
  showSpinner: false, // 不显示右上角小圈圈
  minimum: 0.1
})

export default NProgress
