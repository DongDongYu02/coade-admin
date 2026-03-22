<template>
    <a-drawer title="字典项管理" :width="700" :open="open" @close="handleClose">
        <a-spin :spinning="infoLoading">
            <!-- 字典信息 -->
            <div class="info-section">
                <div class="section-title">
                    <ProfileOutlined />
                    <span>字典信息</span>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">字典名称</span>
                        <span class="info-value">{{ dictInfo?.name }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">字典编码</span>
                        <a-typography-text class="info-value" copyable>{{
                            dictInfo?.code
                            }}</a-typography-text>
                    </div>
                </div>
            </div>

            <!-- 系统信息 -->
            <div class="info-section">
                <div class="section-title">
                    <ProfileOutlined />
                    <span>系统信息</span>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">创建人</span>
                        <span class="info-value">{{ dictInfo?.creator }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">创建时间</span>
                        <span class="info-value">{{ dictInfo?.createTime }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">更新人</span>
                        <span class="info-value">{{ dictInfo?.updater }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">更新时间</span>
                        <span class="info-value">{{ dictInfo?.updateTime }}</span>
                    </div>
                </div>
            </div>
        </a-spin>
        <!-- 字典项列表 -->
        <a-card title="字典项列表" size="small" class="mt-4">
            <template #extra>
                <a-button type="primary" size="small" @click="onAddItem">
                    <PlusOutlined /> 新增
                </a-button>
            </template>

            <a-table :columns="columns" :data-source="itemList" :loading="loading" :pagination="false" row-key="id"
                size="small">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'action'">
                        <div class="flex justify-center gap-2 items-center">
                            <a-button type="link" size="small" @click="onEditItem(record)">编辑</a-button>
                            <a-popconfirm placement="left" title="确定要删除该字典项吗？" @confirm="onDeleteItem(record)"
                                ok-text="是" cancel-text="否">
                                <a-button type="link" danger size="small">删除</a-button>
                            </a-popconfirm>
                        </div>
                    </template>
                </template>
            </a-table>
        </a-card>

        <!-- 新增/编辑字典项弹窗 -->
        <a-modal v-model:open="itemModalVisible" :title="isEditItem ? '编辑字典项' : '新增字典项'"
            :confirm-loading="itemSubmitLoading" @ok="handleItemSubmit" @cancel="handleItemCancel" ok-text="保存"
            cancel-text="取消">
            <a-form ref="itemFormRef" :model="itemForm" :rules="itemRules" :label-col="{ span: 4 }" class="mt-4">
                <a-form-item label="显示文本" name="text">
                    <a-input v-model:value="itemForm.text" placeholder="请输入显示文本" />
                </a-form-item>
                <a-form-item label="字典值" name="value">
                    <a-input v-model:value="itemForm.value" placeholder="请输入字典值" />
                </a-form-item>
                <a-form-item label="排序" name="sort">
                    <a-input-number v-model:value="itemForm.sort" :min="0" placeholder="请输入排序" style="width: 100%" />
                </a-form-item>
            </a-form>
        </a-modal>
    </a-drawer>
</template>

<script setup lang="ts">
import {
    addDataDictItemApi,
    deleteDataDictItemApi,
    getDataDictDetailApi,
    getDataDictItemsApi,
    updateDataDictItemApi,
    type DataDictItemForm,
    type DataDictItemVO,
    type DataDictVO
} from '@/api/data-dict'
import { PlusOutlined, ProfileOutlined } from '@ant-design/icons-vue'
import { message, type FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'

const emit = defineEmits<{
    (e: 'success'): void
}>()

const open = ref(false)
const loading = ref(false)
const infoLoading = ref(false)
const dictInfo = ref<DataDictVO | null>(null)
const itemList = ref<DataDictItemVO[]>([])

// 表格列
const columns = [
    { title: '显示文本', dataIndex: 'text', key: 'text', align: 'center' },
    { title: '字典值', dataIndex: 'value', key: 'value', align: 'center' },
    { title: '排序', dataIndex: 'sort', key: 'sort', align: 'center', width: 80 },
    { title: '操作', key: 'action', width: 100, align: 'center' }
]

// 字典项表单相关
const itemModalVisible = ref(false)
const isEditItem = ref(false)
const itemSubmitLoading = ref(false)
const itemFormRef = ref<FormInstance>()
const itemForm = reactive<DataDictItemForm>({
    dataDictId: '',
    text: '',
    value: '',
    sort: 999
})

const itemRules: Record<string, Rule[]> = {
    text: [{ required: true, message: '请输入显示文本', trigger: 'blur' }],
    value: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
    sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}
// 加载字典详情
const loadDictInfo = async (dictId: string) => {
    try {
        infoLoading.value = true
        const res = await getDataDictDetailApi(dictId)
        dictInfo.value = res.data
    } catch (error) {
        console.error('加载字典信息失败:', error)
    } finally {
        infoLoading.value = false
    }
}
// 加载字典项列表
const loadItems = async () => {
    if (!dictInfo.value?.id) return
    loading.value = true
    try {
        const res = await getDataDictItemsApi(dictInfo.value.id)
        itemList.value = res.data || []
    } catch (error) {
        console.error('加载字典项失败:', error)
    } finally {
        loading.value = false
    }
}

// 打开抽屉
const show = async (dictId: string) => {
    open.value = true
    await loadDictInfo(dictId)
    await loadItems()
}

// 关闭抽屉
const handleClose = () => {
    open.value = false
    dictInfo.value = null
    itemList.value = []
}

// 新增字典项
const onAddItem = () => {
    isEditItem.value = false
    itemForm.id = undefined
    itemForm.dataDictId = dictInfo.value?.id || ''
    itemForm.text = ''
    itemForm.value = ''
    itemForm.sort = 999
    itemModalVisible.value = true
}

// 编辑字典项
const onEditItem = (record: DataDictItemVO) => {
    isEditItem.value = true
    itemForm.id = record.id
    itemForm.dataDictId = record.dataDictId
    itemForm.text = record.text
    itemForm.value = record.value
    itemForm.sort = record.sort
    itemModalVisible.value = true
}

// 删除字典项
const onDeleteItem = async (record: DataDictItemVO) => {
    console.log(record);

    try {
        await deleteDataDictItemApi(record.id)
        message.success('删除成功')
        loadItems()
    } catch (error) {
        console.error('删除失败:', error)
    }
}

// 提交字典项表单
const handleItemSubmit = async () => {
    try {
        await itemFormRef.value?.validate()
        itemSubmitLoading.value = true

        if (isEditItem.value) {
            await updateDataDictItemApi(itemForm)
            message.success('修改成功')
        } else {
            await addDataDictItemApi(itemForm)
            message.success('新增成功')
        }

        itemModalVisible.value = false
        loadDictInfo(dictInfo.value?.id!)
        loadItems()
        emit('success')
    } catch (error: any) {
        if (error?.errorFields) return
        console.error('提交失败:', error)
    } finally {
        itemSubmitLoading.value = false
    }
}

// 取消字典项表单
const handleItemCancel = () => {
    itemFormRef.value?.resetFields()
    itemModalVisible.value = false
}

defineExpose({
    show
})
</script>

<style scoped>

</style>
