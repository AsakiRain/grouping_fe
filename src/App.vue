<template>
  <Layout />
</template>
<script setup lang="ts">
import Layout from "./Layout.vue";
</script>
<style>
* {
  box-sizing: border-box;
}
body,
#app {
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
#app {
  display: flex;
  flex-direction: column;
}
</style>
