<template>
  <div class="page-container user-index h-full">
    <SearchForm v-model="searchParams" :items="searchFieldItems" :loading="searchLoading" @search="onSearch"
      @reset="onReset">
    </SearchForm>
    <TableContainer ref="tableRef" :columns="columns" :request="getList" :showPager="true" showActionColumn :page-size="50"
      :action-column-props="{ width: 220 }">
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">用户列表</span>
      </template>

      <template #toolbar-right>
        <div class="flex gap-2 m-2">
          <a-button type="primary" :icon="h(SyncOutlined)" @click="onSyncData"
            :loading="syncLoading">同步蓝凌职员数据</a-button>
        </div>
      </template>


      <template #action="{ row }">
        <a-button type="link" size="small" @click="onGrant(row)">授权</a-button>
      </template>


    </TableContainer>

    <!-- 角色授权抽屉 -->
    <GrantForm ref="grantFormRef" @success="onFormSuccess" />
  </div>
</template>

<script setup lang="ts">
import { getUserListApi, syncFromEkpApi, type CmtUserVO } from "@/api/cmt/cmt-user";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from '@/components/TableContainer.vue';
import { Input, message, Modal } from 'ant-design-vue';
import { createVNode, h, ref } from 'vue';
import type { VxeGridPropTypes } from 'vxe-table';
import GrantForm from "./components/GrantForm.vue";
import { ExclamationCircleOutlined, SyncOutlined } from "@ant-design/icons-vue";

interface SearchParams {
  username?: string | null;
}
const searchParams = ref<SearchParams>({});
const searchFieldItems: SearchFieldItem[] = [
  { label: "员工姓名", field: "username", component: Input, componentProps: { placeholder: "请输入", allowClear: true } },
];
const syncLoading = ref(false)
const searchLoading = ref(false);
const onSearch = async () => {
  tableRef.value?.reload()
}
const onReset = async () => {
  searchParams.value = {}
  tableRef.value?.reload()
}

const onSyncData = async () => {
  // syncLoading.value = true
  Modal.confirm({
    title: '确认开始同步蓝凌的职员数据?',
    icon: createVNode(ExclamationCircleOutlined),
    okText:'确认',
    cancelText:'取消',
    async onOk() {
      await syncFromEkpApi()
      message.success('同步成功！')
      onReset() 
    }
  });


}

const tableRef = ref<InstanceType<typeof TableContainer>>()
const columns: VxeGridPropTypes.Columns<any> = [
  { field: 'username', title: '姓名', width: 180 },
  { field: 'phone', title: '手机号', width: 180 },
  { field: 'dept', title: '部门' },
  { field: 'weComId', title: '企微唯一标识' }
]
const getList = async (pageQuery: PageQuery) => {
  const resp = await getUserListApi({
    ...searchParams.value,
    ...pageQuery
  })
  return {
    result: resp.data.records,
    total: resp.data.total
  }
}

const grantFormRef = ref<InstanceType<typeof GrantForm>>()

const onGrant = (row: CmtUserVO) => {
  console.log(grantFormRef);

  grantFormRef.value?.show(row)
}


const onFormSuccess = () => {
  tableRef.value?.reload()
}
</script>

<style scoped>
:deep(.ant-image) {
  display: block !important;
}
</style>