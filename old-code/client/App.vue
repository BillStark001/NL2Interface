<template>
  <div id="app">
    <switch-database-modal title="switchdb"/>
    <router-view />
  </div>
</template>

<script>
import SwitchDatabaseModal from "components/Demo/SwitchDatabaseModal.vue";
export default {
  components: {
    SwitchDatabaseModal
  }
};
</script>

<style lang="scss">
</style>
