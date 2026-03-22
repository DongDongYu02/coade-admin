# Nexus Admin

<p align="center">
  <strong>🚀 简洁 · 通用 · 快速开发的中后台管理框架</strong>
</p>

<p align="center">
  基于 Vue 3 + Vite + TypeScript + Ant Design Vue 构建<br/>
  开箱即用的 RBAC 权限管理系统，让你专注业务开发
</p>

---

## ✨ 特性

- 🎯 **开箱即用** - 完整的 RBAC 权限管理，包含用户、角色、权限、数据字典等核心模块
- 🚀 **技术前沿** - Vue 3 Composition API + TypeScript + Vite 7，享受极速开发体验
- 🎨 **优雅 UI** - Ant Design Vue 4 + Tailwind CSS v4，美观且高效
- 📦 **高效封装** - 通用表格、表单、搜索等组件，CRUD 开发效率翻倍
- 🔐 **动态路由** - 基于后端权限树动态生成路由和菜单，灵活可控
- 💾 **状态持久化** - Pinia + 持久化插件，刷新不丢失状态
- 📱 **多标签页** - 支持页面缓存、右键菜单、最大化等功能

---

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue | 3.5+ |
| 构建工具 | Vite | 7.x |
| 开发语言 | TypeScript | 5.x |
| UI 组件库 | Ant Design Vue | 4.x |
| 表格组件 | VXE Table | 4.x |
| CSS 框架 | Tailwind CSS | 4.x |
| 状态管理 | Pinia | 3.x |
| 路由 | Vue Router | 4.x |
| HTTP 请求 | Axios | 1.x |

---

## 📁 项目结构

```
nexus-admin/
├── public/                 # 静态资源
├── src/
│   ├── api/                # API 接口层
│   │   ├── auth.ts         # 认证相关接口
│   │   ├── user.ts         # 用户管理接口
│   │   ├── role.ts         # 角色管理接口
│   │   ├── permission.ts   # 权限管理接口
│   │   ├── data-dict.ts    # 数据字典接口
│   │   └── setting.ts      # 系统设置接口
│   │
│   ├── assets/             # 静态资源（图片、字体等）
│   │
│   ├── components/         # 通用组件
│   │   ├── DrawerForm.vue  # 抽屉表单组件
│   │   ├── ModalForm.vue   # 弹窗表单组件
│   │   ├── SearchForm.vue  # 搜索表单组件
│   │   ├── TableContainer.vue  # 表格容器组件
│   │   └── DetailDrawer.vue    # 详情抽屉组件
│   │
│   ├── config/             # 全局配置
│   │   ├── global.ts       # 全局常量
│   │   └── axios/          # Axios 配置与封装
│   │
│   ├── layouts/            # 布局组件
│   │   ├── BasicLayout.vue # 基础布局
│   │   └── components/     # 布局子组件
│   │       ├── SideMenu.vue    # 侧边菜单
│   │       ├── AppHeader.vue   # 顶部栏
│   │       ├── TagsView.vue    # 多标签页
│   │       └── AppContent.vue  # 内容区域
│   │
│   ├── plugins/            # 插件
│   │
│   ├── router/             # 路由配置
│   │   ├── index.ts        # 路由入口与守卫
│   │   └── dynamic.ts      # 动态路由生成
│   │
│   ├── stores/             # Pinia 状态管理
│   │   ├── auth.ts         # 认证状态
│   │   ├── app.ts          # 应用状态
│   │   └── tagsView.ts     # 标签页状态
│   │
│   ├── utils/              # 工具函数
│   │
│   ├── views/              # 页面视图
│   │   ├── auth/           # 认证页面
│   │   │   └── Login.vue   # 登录页
│   │   ├── system/         # 系统管理模块
│   │   │   ├── user/       # 用户管理
│   │   │   ├── role/       # 角色管理
│   │   │   ├── permission/ # 权限管理
│   │   │   ├── data-dict/  # 数据字典
│   │   │   └── setting/    # 系统设置
│   │   └── error/          # 错误页面
│   │
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口
│
├── index.html              # HTML 入口
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # Tailwind 配置
└── package.json            # 项目依赖
```

---

## 🎯 核心功能

### 🔐 RBAC 权限管理

| 模块 | 功能说明 |
|------|----------|
| **用户管理** | 用户增删改查、角色分配、密码重置、状态管理 |
| **角色管理** | 角色增删改查、权限分配、数据权限配置 |
| **权限管理** | 菜单/目录/按钮权限配置、图标选择、排序管理 |
| **数据字典** | 字典类型管理、字典项管理，支持业务扩展 |
| **系统设置** | 系统名称、Logo 等基础配置 |

### 📦 通用组件

#### TableContainer - 表格容器
```vue
<TableContainer
  :columns="columns"
  :request="getList"
  @selection-change="onSelectionChange"
>
  <template #toolbar-right>
    <a-button type="primary" @click="handleAdd">新增</a-button>
  </template>
  <template #action="{ row }">
    <a-button type="link" @click="handleEdit(row)">编辑</a-button>
  </template>
</TableContainer>
```

#### DrawerForm - 抽屉表单
```vue
<DrawerForm
  v-model:open="open"
  v-model="formData"
  :rules="formRules"
  @submit="handleSubmit"
>
  <template #default="{ form }">
    <a-form-item label="名称" name="name">
      <a-input v-model:value="form.name" />
    </a-form-item>
  </template>
</DrawerForm>
```

#### SearchForm - 搜索表单
```vue
<SearchForm
  v-model="searchParams"
  :items="searchItems"
  @search="handleSearch"
/>
```

### 🔄 动态路由

基于后端返回的权限树自动生成路由和菜单：

```typescript
// 后端返回的权限节点结构
interface PermissionNode {
  id: string
  name: string           // 菜单名称
  path: string           // 路由路径
  component?: string     // 组件路径
  icon?: string          // 菜单图标
  type: 1 | 2 | 3        // 1-目录 2-菜单 3-按钮
  hidden: 0 | 1          // 是否隐藏
  children?: PermissionNode[]
}
```

### 📑 多标签页

- ✅ 页面缓存 (Keep-Alive)
- ✅ 右键菜单（关闭当前/关闭其他/关闭全部等）
- ✅ 标签页固定
- ✅ 页面最大化
- ✅ 标签页图标显示

---

## 🚀 快速开始

### 环境要求

- Node.js >= 20.18.0
- pnpm >= 10.x（推荐）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/nexus-admin.git

# 进入项目目录
cd nexus-admin

# 安装依赖
pnpm install
```

### 开发运行

```bash
# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173

### 生产构建

```bash
# 类型检查 + 构建
pnpm build

# 预览构建结果
pnpm preview
```

---

## 📝 开发指南

### 新增业务模块

1. **创建 API 文件** - `src/api/your-module.ts`

```typescript
import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

export function getListApi(params: YourQuery): Promise<ApiResult<PageResult<YourVO>>> {
  return request.get("/your-module", params);
}

export function addApi(data: YourForm): Promise<ApiResult<void>> {
  return request.post("/your-module", data);
}
```

2. **创建页面** - `src/views/your-module/Index.vue`

```vue
<template>
  <SearchForm v-model="searchParams" :items="searchItems" @search="onSearch" />
  <TableContainer ref="tableRef" :columns="columns" :request="getList">
    <template #toolbar-right>
      <a-button type="primary" @click="formRef?.open()">新增</a-button>
    </template>
    <template #action="{ row }">
      <a-button type="link" @click="formRef?.open(row)">编辑</a-button>
    </template>
  </TableContainer>
  <YourForm ref="formRef" @success="tableRef?.reload()" />
</template>
```

3. **在后台配置权限菜单**，系统自动生成路由

### API 响应格式

```typescript
// 统一响应结构
interface ApiResult<T> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页响应结构
interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}
```

### 组件命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 列表页 | `Index.vue` | `views/user/Index.vue` |
| 表单组件 | `*Form.vue` | `components/UserForm.vue` |
| 详情组件 | `*Detail.vue` | `components/UserDetail.vue` |
| API 文件 | 模块名.ts | `api/user.ts` |

---

## ⚙️ 配置说明

### 全局配置

编辑 `src/config/global.ts`：

```typescript
// 文件访问 URL
export const FILE_ACCESS_URL = 'http://your-server/';

// AES 加密密钥（用于密码加密传输）
export const AES_KEY = 'your-aes-key';

// 默认系统名称
export const DEFAULT_SYSTEM_NAME = "Nexus Admin";
```

### Vite 代理配置

编辑 `vite.config.ts`：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:9981',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api/, '')
    }
  }
}
```

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

---

## 📄 开源协议

[MIT License](LICENSE)

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design Vue](https://antdv.com/)
- [VXE Table](https://vxetable.cn/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/)

