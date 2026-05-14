<template>
  <ModalForm
    ref="modalFormRef"
    v-model:open="open"
    v-model="formData"
    :title="modalTitle"
    :rules="formRules"
    :label-col="{ span: 5 }"
    @submit="handleSubmit"
  >
    <template #default="{ form }">
      <a-form-item label="区域名称" name="name">
        <a-input v-model:value="form.name" placeholder="请输入区域名称" allow-clear />
      </a-form-item>
      <a-form-item label="负责人" name="principalUserId">
        <a-select
          v-model:value="form.principalUserId"
          placeholder="请选择负责人"
          allow-clear
          show-search
          option-filter-prop="label"
          :options="userOptions"
        />
      </a-form-item>
      <a-form-item label="规则" name="rule">
        <a-textarea v-model:value="form.rule" placeholder="请输入规则" :rows="3" allow-clear />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="3" allow-clear />
      </a-form-item>
    </template>
  </ModalForm>
</template>

<script setup lang="ts">
import {
  addCleaningAreaApi,
  updateCleaningAreaApi,
  type CmtCleaningAreaDTO,
  type CmtCleaningAreaVO
} from "@/api/cmt/cmt-cleaning";
import { getUserSelectionApi, type CmtUserSelectionVO } from "@/api/cmt/cmt-user";
import ModalForm from "@/components/ModalForm.vue";
import { message } from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";
import { computed, ref, type ComponentPublicInstance } from "vue";

const emit = defineEmits<{
  (e: "success"): void;
}>();

const modalFormRef = ref<ComponentPublicInstance<{ setLoading: (loading: boolean) => void }> | null>(null);
const open = ref(false);
const isEdit = ref(false);
const userList = ref<CmtUserSelectionVO[]>([]);
const modalTitle = computed(() => (isEdit.value ? "编辑保洁区域" : "新增保洁区域"));

const initFormData = (): CmtCleaningAreaDTO => ({
  name: "",
  principalUserId: "",
  rule: "",
  remark: ""
});

const formData = ref<CmtCleaningAreaDTO>(initFormData());

const formRules: Record<string, Rule[]> = {
  name: [{ required: true, message: "请输入区域名称", trigger: "blur" }],
  principalUserId: [{ required: true, message: "请选择负责人", trigger: "change" }]
};

const userOptions = computed(() =>
  userList.value.map((item) => ({
    label: item.name || item.ekpId || item.id,
    value: item.id
  }))
);

const loadUserOptions = async () => {
  if (userList.value.length) return;
  const resp = await getUserSelectionApi();
  userList.value = resp.data || [];
};

const add = async () => {
  isEdit.value = false;
  formData.value = initFormData();
  await loadUserOptions();
  open.value = true;
};

const edit = async (row: CmtCleaningAreaVO) => {
  isEdit.value = true;
  formData.value = {
    id: row.id,
    name: row.name || "",
    principalUserId: row.principalUserId || "",
    rule: row.rule || "",
    remark: row.remark || ""
  };
  await loadUserOptions();
  open.value = true;
};

const handleSubmit = async (data: CmtCleaningAreaDTO) => {
  try {
    modalFormRef.value?.setLoading(true);
    if (isEdit.value) {
      await updateCleaningAreaApi(data);
      message.success("修改成功");
    } else {
      await addCleaningAreaApi(data);
      message.success("新增成功");
    }
    open.value = false;
    emit("success");
  } finally {
    modalFormRef.value?.setLoading(false);
  }
};

defineExpose({
  add,
  edit
});
</script>
