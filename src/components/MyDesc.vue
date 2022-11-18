<template>
  <a-descriptions :title="fileObj.filename" :column="1">
    <a-descriptions-item label="文件大小">
      {{ fileObj.filesize }}字节
    </a-descriptions-item>
    <a-descriptions-item label="编辑时间">
      {{ fileObj.modified }}
    </a-descriptions-item>
    <a-descriptions-item label="工作表名">
      {{ fileObj.sheet }}
    </a-descriptions-item>
    <a-descriptions-item label="字段数">
      {{ fileObj.colcount }}
    </a-descriptions-item>
    <a-descriptions-item label="记录条数">
      {{ fileObj.rowcount }}
    </a-descriptions-item>
    <a-descriptions-item label="选中人数">
      {{ selectedCount }}
    </a-descriptions-item>
  </a-descriptions>
</template>
<script lang="ts" setup>
import type { FileObj } from "@/types/types";
const { fileObj, selectedCount } = defineProps<{
  fileObj: FileObj;
  selectedCount: number;
}>();
</script>
<script lang="ts">
export default {
  name: "MyDesc",
};
</script>
