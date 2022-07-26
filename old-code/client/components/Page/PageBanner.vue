<template>
  <div class="page-area">
    <div class="breadcumb-overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-md-12 col-sm-12 col-xs-12">
          <div class="breadcrumb breadcrumb-demo text-center">
            <div class="section-headline white-headline text-center">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: "PageBanner",
      props: {
        pageTitle: {
          type: String
        }
      },

    }
</script>

<style scoped>

</style>