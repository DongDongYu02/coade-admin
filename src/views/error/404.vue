<template>
  <div class="not-found-container">
    <div class="content">
      <div class="error-code">
        <span class="digit">4</span>
        <span class="digit zero">0</span>
        <span class="digit">4</span>
      </div>
      <h2 class="title">页面不存在</h2>
      <p class="description">抱歉，您访问的页面不存在或已被移除</p>
      <div class="actions">
        <a-button type="primary" size="large" @click="goHome">
          <template #icon><HomeOutlined /></template>
          返回首页
        </a-button>
        <a-button size="large" @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
          返回上页
        </a-button>
      </div>
    </div>
    <div class="decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  position: relative;
  overflow: hidden;
}

.content {
  text-align: center;
  z-index: 10;
  animation: fadeInUp 0.6s ease-out;
}

.error-code {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.digit {
  font-size: 120px;
  font-weight: 800;
  color: #1677ff;
  line-height: 1;
  text-shadow: 4px 4px 0 rgba(22, 119, 255, 0.1);
  animation: bounce 0.6s ease-out;
}

.digit:nth-child(1) { animation-delay: 0.1s; }
.digit:nth-child(2) { animation-delay: 0.2s; }
.digit:nth-child(3) { animation-delay: 0.3s; }

.digit.zero {
  color: #ff4d4f;
  text-shadow: 4px 4px 0 rgba(255, 77, 79, 0.1);
  animation: pulse 2s ease-in-out infinite;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 12px 0;
}

.description {
  font-size: 16px;
  color: #8c8c8c;
  margin: 0 0 32px 0;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 装饰圆圈 */
.decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: #1677ff;
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: #ff4d4f;
  bottom: -80px;
  left: -80px;
  animation: float 6s ease-in-out infinite reverse;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: #52c41a;
  top: 50%;
  left: 10%;
  animation: float 10s ease-in-out infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
}
</style>