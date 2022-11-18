<template>
  <a-card :hoverable="true">
    <template #title>
      <div class="studentName">{{ data.name }}</div>
    </template>
    <div class="studentId">
      {{ data.id || "没有提供学号" }}
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import type { Student } from "@/types/types";
const { data } = defineProps<{ data: Student }>();
</script>
<script lang="ts">
export default {
  name: "MyCard",
};
</script>
