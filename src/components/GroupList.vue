<template>
  <div id="groupContent">
    <a-card v-for="(group, index) in data" :key="index">
      <template #title>
        <span class="groupTitle">小组{{ index + 1 }}</span>
      </template>
      <transition-group tag="div" name="item" class="group">
        <MyCard
          v-for="item in group"
          :key="item.id"
          :data="item"
          class="groupItem"
        />
      </transition-group>
    </a-card>
  </div>
</template>
<script lang="ts" setup>
import type { Student } from "@/types/types";
import MyCard from "@/components/MyCard.vue";
const { data } = defineProps<{ data: Student[][] }>();
</script>
<script lang="ts">
export default {
  name: "GroupList",
};
</script>
<style lang="css">
#groupContent {
  margin: 24px 48px 24px 48px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 12px;
}
.group {
  display: flex;
  flex-direction: column;
}
.groupItem {
  margin-bottom: 8px;
}
</style>
