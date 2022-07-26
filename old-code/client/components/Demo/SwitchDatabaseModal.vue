<template>
  <modal name="switchdb" title="switchdb">
 
    <div slot="top-right">
      <button @click="$modal.hide('switchdb')">
        ❌
      </button>
    </div>
 
    Hello, ☀️!
 
  </modal>
</template>
<script>
export default {
  name: 'SwitchDatabaseModal'
}
</script>