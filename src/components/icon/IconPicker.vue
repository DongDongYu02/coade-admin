<template>
    <div class="flex items-center gap-2">
        <a-input v-model:value="inputValue" allow-clear placeholder="请选择图标">
            <template #prefix>
                <component v-if="CurrentIcon" :is="CurrentIcon" />
            </template>
        </a-input>

        <a-button @click="open = true">选择</a-button>

        <a-modal v-model:open="open" title="选择图标" :width="900" :footer="null" destroy-on-close>
            <div class="flex items-center gap-2 mb-3">
                <a-input v-model:value="keyword" allow-clear placeholder="搜索图标，如 user / setting" />
                <div class="ml-auto flex items-center gap-2">
                    <span class="text-gray-500">已选：</span>
                    <component v-if="CurrentIcon" :is="CurrentIcon" />
                    <span>{{ modelValue || "-" }}</span>
                </div>
            </div>

            <div class="icon-grid">
                <div v-for="item in filtered" :key="item.name" class="icon-item"
                    :class="{ active: item.name === modelValue }" @click="select(item.name)" :title="item.name">
                    <component :is="item.comp" class="text-[18px]" />
                    <div class="icon-name">{{ item.name }}</div>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import * as Icons from "@ant-design/icons-vue";


type IconName = keyof typeof Icons;

const props = defineProps<{ value?: string }>();
const emit = defineEmits<{
    (e: "update:value", v: string): void;
    (e: "change", v: string): void;
}>();

const open = ref(false);
const keyword = ref("");

const modelValue = computed(() => props.value ?? "");

/**
 * 用 a-input 的 allowClear 来清空：
 * - 用户点 X 会触发 v-model:value 变成 ''
 * - 我们在 setter 里把变更同步出去
 */
const inputValue = computed({
    get: () => modelValue.value,
    set: (v: string) => {
        // 只允许“清空”，不允许输入修改（因为 readonly）
        if (v === "") {
            emit("update:value", "");
            emit("change", "");
        }
    },
});

const iconList = computed(() =>
    Object.entries(Icons)
        .filter(([name]) => name.endsWith("Outlined") || name.endsWith("Filled") || name.endsWith("TwoTone"))
        .map(([name, comp]) => ({ name, comp }))
);

const filtered = computed(() => {
    const k = keyword.value.trim().toLowerCase();
    if (!k) return iconList.value;
    return iconList.value.filter((i) => i.name.toLowerCase().includes(k));
});

const CurrentIcon = computed(() => {
    const name = modelValue.value as IconName;
    return (Icons as any)[name] || null;
});


function select(name: string) {
    emit("update:value", name);
    emit("change", name);
    open.value = false;
}
</script>

<style scoped>
.icon-grid {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 10px;
    max-height: 520px;
    overflow: auto;
    padding-right: 4px;
}

.icon-item {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 10px 6px;
    cursor: pointer;
    text-align: center;
    user-select: none;
    transition: all 0.15s;
}

.icon-item:hover {
    border-color: #1677ff;
}

.icon-item.active {
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
}

.icon-name {
    margin-top: 6px;
    font-size: 12px;
    color: #666;
    word-break: break-all;
}
</style>
