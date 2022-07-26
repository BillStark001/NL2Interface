<template>
  <div class="py-5 text-center">
    <h2>Talk2Data</h2>
    <ul class="list-group mb-3 button-list">
      <li class="list-group-item d-flex justify-content-between lh-condensed">
        <div>
          <h6 class="my-0"><font-awesome-icon icon="spinner" /> Use Spider database</h6>
        </div>
      </li>
      <li class="list-group-item d-flex justify-content-between lh-condensed disabled">
        <div>
          <h6 class="my-0">Upload database</h6>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: "fetching..."
    };
  },
  mounted: async function() {
  }
};
</script>

<style scoped lang="scss">
h3 {
  font-size: 15px;
  font-weight: 400;
}
</style>
