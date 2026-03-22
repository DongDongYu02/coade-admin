# Nexus Admin - Copilot Instructions

## Tech Stack
- **Vue 3** (Composition API + `<script setup>`) + **TypeScript**
- **Vite 7** with `@` alias → `src/`
- **Ant Design Vue 4** (auto-imported via `unplugin-vue-components`)
- **VXE Table** for data grids (`vxe-grid`, `vxe-pager`)
- **Tailwind CSS v4** (utility classes)
- **Pinia** with `pinia-plugin-persistedstate` for state management

## Commands
```bash
pnpm dev      # Start dev server (proxies /api → localhost:9981)
pnpm build    # Type-check + production build
```

## Architecture Overview

### Routing & Authentication
- **Dynamic routes** built from backend permission tree at runtime (`src/router/dynamic.ts`)
- Routes are flattened and added as children of `Root` layout
- Auth flow: Token in `authStore` → 401 response clears token → redirect to `/login?redirect=...`
- Component names auto-generated from path for `keep-alive` support (e.g., `system/user/Index` → `SystemUserIndex`)

### API Layer (`src/config/axios/`)
```typescript
// Use the request helper from @/config/axios
import { request } from '@/config/axios'
import type { ApiResult, PageResult } from '@/config/axios/config'

// GET with params, POST with body
request.get<ApiResult<T>>('/endpoint', params)
request.post<ApiResult<T>>('/endpoint', data)
request.upload<ApiResult<string>>('/upload', file)
```
- All responses are typed with `ApiResult<T>` wrapper (`{ code, message, data, success }`)
- Paginated responses use `PageResult<T>` (`{ records, total, size, current }`)

### Component Patterns

#### CRUD Page Structure (`src/views/system/*/Index.vue`)
```vue
<SearchForm v-model="searchParams" :items="searchFieldItems" @search="onSearch" />
<TableContainer :columns="columns" :request="getList" @selection-change="...">
  <template #toolbar-right><!-- action buttons --></template>
  <template #action="{ row }"><!-- row actions --></template>
  <template #status="{ row }"><!-- custom cell --></template>
</TableContainer>
<UserForm ref="formRef" @success="tableRef?.reload()" />
```

#### Form Drawers (`src/components/DrawerForm.vue`)
```vue
<DrawerForm v-model:open="open" v-model="formData" :rules="formRules" @submit="handleSubmit">
  <template #default="{ form }">
    <a-form-item label="Name" name="name">
      <a-input v-model:value="form.name" />
    </a-form-item>
  </template>
</DrawerForm>
```
- Uses scoped slot `{ form }` for reactive form binding
- Emits `submit` with validated data

#### Search Forms (`src/components/SearchForm.vue`)
- Accepts `items: SearchFieldItem[]` config array with `{ label, field, component, componentProps }`
- Auto-expands/collapses based on field count

### State Management (`src/stores/`)
- `authStore`: Token, menus, routes loaded flag (persisted: `token`, `indexPath`)
- `tagsViewStore`: Multi-tab navigation with `keep-alive` cache management
- `appStore`: UI state (maximized mode)

### File Organization
```
src/
├── api/          # API functions with TypeScript interfaces
├── components/   # Reusable: DrawerForm, ModalForm, SearchForm, TableContainer
├── layouts/      # BasicLayout with SideMenu, Header, TagsView, AppContent
├── stores/       # Pinia stores
├── views/        # Pages organized by module (system/user/, system/role/)
└── config/       # Axios setup, global constants
```

### Key Conventions
1. **API files**: One file per entity (`user.ts`, `role.ts`) with Query/Form/VO interfaces
2. **Form components**: Named `*Form.vue`, expose `open(record?)` method via `defineExpose`
3. **Detail components**: Named `*Detail.vue`, use `DetailDrawer` wrapper
4. **Icons**: Use `@ant-design/icons-vue` components directly, no prefix
5. **File uploads**: Use `FILE_ACCESS_URL` from `@/config/global` for display URLs
