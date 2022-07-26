<template>
    <div>
      <HeaderTwo/>
      <PageBanner pageTitle="About us"/>
      <DemoView/>
      <!-- <WorkProses/>
      <About/>
      <SubscribeTwo/>
      <Brand/>
      <Team/> -->
      <!-- <Footer/> -->
    </div>
</template>

<script>
    import HeaderTwo from "components/Home/HeaderTwo.vue";
    import Footer from "components/Home/Footer.vue";
    import PageBanner from "components/Page/PageBanner.vue";
    import DemoView from "components/Demo/DemoView.vue";
    // import About from "../components/Home/About";
    // import WorkProses from "../components/Page/WorokProses";
    // import SubscribeTwo from "../components/Page/SubscribeTwo";
    // import Brand from "../components/Page/Brand";
    // import Team from "../components/Page/Team";

    export default {
        name: "about",
      components: {
          // Team,
          // Brand,
          // SubscribeTwo,
          // WorkProses,
          // About,
          DemoView,
          PageBanner,
          Footer,
          HeaderTwo
        },
      head(){
          return{
            title: 'Lopard | About Us'
          }
      }
    }
</script>

<style scoped>

</style>