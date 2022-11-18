<template>
  <transition-group tag="div" name="item" id="listContent">
    <MyCard v-for="item in data" :key="item.id" :data="item" class="sortItem" />
  </transition-group>
</template>
<script lang="ts" setup>
import type { Student } from "@/types/types";
import MyCard from "@/components/MyCard.vue";
const { data } = defineProps<{ data: Student[] }>();
</script>
<script lang="ts">
export default {
  name: "SortList",
};
</script>
<style lang="css">
#listContent {
  margin: 24px 48px 24px 48px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-gap: 12px;
}
.item-move {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
.item-enter-active,
.item-leave-active {
  transition: all 0.2s ease-out;
}
.item-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.item-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>
