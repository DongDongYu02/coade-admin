<template>
    <div class="page-container h-full">
        <SearchForm v-model="searchParams" :items="searchFieldItems" :loading="searchLoading" @search="onSearch"
            @reset="onReset" />

        <TableContainer ref="tableRef" :columns="columns" :request="getList" :showPager="true" :page-size="10">
            <template #toolbar-left>
                <span class="mr-1 pl-1 text-[15px] font-bold">打扫记录列表</span>
            </template>

            <template #principal="{ row }">
                <a-tag color="blue">{{ row.principalUserName || "-" }}</a-tag>
            </template>

            <template #attachments="{ row }">
                <div v-if="getAttachmentImages(row).length" class="record-images">
                    <a-image v-for="(image, index) in getAttachmentImages(row)"
                        :key="image.id || image.path || image.url || index" :src="resolveImageUrl(image)" :width="56"
                        :height="56" class="record-image" />
                </div>
                <span v-else>-</span>
            </template>
        </TableContainer>
    </div>
</template>

<script lang="ts" setup>
import {
    getCleaningAreaListApi,
    getCleaningRecordListApi,
    type CmtCleaningAreaVO,
    type CmtCleaningAttachmentVO,
    type CmtCleaningRecordQuery,
    type CmtCleaningRecordVO
} from "@/api/cmt/cmt-cleaning";
import { getUserSelectionApi, type CmtUserSelectionVO } from "@/api/cmt/cmt-user";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from "@/components/TableContainer.vue";
import { Select } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";
import type { VxeGridPropTypes } from "vxe-table";

const FILE_ACCESS_URL = window.location.origin + import.meta.env.VITE_FILE_ACCESS_PATH_PREFIX;

const searchParams = ref<CmtCleaningRecordQuery>({});
const searchLoading = ref(false);
const tableRef = ref<InstanceType<typeof TableContainer>>();
const areaOptions = ref<CmtCleaningAreaVO[]>([]);
const userOptions = ref<CmtUserSelectionVO[]>([]);

const searchFieldItems = computed<SearchFieldItem[]>(() => [
    {
        label: "区域",
        field: "areaId",
        component: Select,
        componentProps: {
            placeholder: "请选择",
            allowClear: true,
            showSearch: true,
            optionFilterProp: "label",
            options: areaOptions.value.map((item) => ({
                label: item.name || item.areaName || item.id,
                value: item.id
            }))
        }
    },
    {
        label: "负责人",
        field: "principalUserId",
        component: Select,
        componentProps: {
            placeholder: "请选择",
            allowClear: true,
            showSearch: true,
            optionFilterProp: "label",
            options: userOptions.value.map((item) => ({
                label: item.name || item.ekpId || item.id,
                value: item.id
            }))
        }
    }
]);

const columns: VxeGridPropTypes.Columns<CmtCleaningRecordVO> = [
    { field: "areaName", title: "区域名称", width: 220 },
    { field: "principalUserName", title: "负责人", width: 160, slots: { default: "principal" } },
    { field: "attachments", title: "结果图片", slots: { default: "attachments" } },
    { field: "createTime", title: "上传时间", width: 180 }
];

const loadAreaOptions = async () => {
    const resp = await getCleaningAreaListApi({
        pageNo: 1,
        pageSize: 1000
    });
    areaOptions.value = resp.data.records || [];
};

const loadUserOptions = async () => {
    const resp = await getUserSelectionApi();
    userOptions.value = resp.data || [];
};

const resolveImageUrl = (file: CmtCleaningAttachmentVO) => {
    const url = file.url || file.path || "";
    if (!url) return "";
    return /^https?:\/\//.test(url) ? url : FILE_ACCESS_URL + url;
};

const getAttachmentImages = (row: CmtCleaningRecordVO) =>
    (row.attachments || []).filter((item) => Boolean(resolveImageUrl(item)));

const onSearch = async () => {
    tableRef.value?.resetPager();
    tableRef.value?.reload();
};

const onReset = async () => {
    searchParams.value = {};
    tableRef.value?.resetPager();
    tableRef.value?.reload();
};

const getList = async (pageQuery: PageQuery) => {
    const resp = await getCleaningRecordListApi({
        ...searchParams.value,
        ...pageQuery
    });

    return {
        result: resp.data.records,
        total: resp.data.total
    };
};

onMounted(async () => {
    await Promise.allSettled([loadAreaOptions(), loadUserOptions()]);
});
</script>

<style scoped>
.record-images {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
}

.record-image :deep(.ant-image-img) {
    object-fit: cover;
    border-radius: 6px;
}
</style>
