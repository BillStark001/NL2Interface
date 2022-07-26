<template>
  <div>
    <Header/>
    <Slider/>
    <!--<About/>
    <ServiceOne/>
    <Challange/>
    <Subscribe/>
    <Project/>
    <Testimonials/>
    <Blog/> -->
    <Footer/>
  </div>
</template>

<script>
import Header from "components/Home/Header.vue";
import Slider from "components/Home/Slider.vue";
// import About from "~/components/Home/About.vue";
// import ServiceOne from "~/components/Home/ServiceOne.vue";
// import Challange from "~/components/Home/Challange.vue";
// import Subscribe from "~/components/Home/Subscribe.vue";
// import Project from "~/components/Home/Project.vue";
// import Testimonials from "~/components/Home/Testimonials.vue";
// import Blog from "~/components/Home/Blog.vue";
import Footer from "components/Home/Footer.vue";

export default {
  components: {
    Footer,
    // Blog,
    // Testimonials,
    // Project,
    // Subscribe,
    // Challange,
    // ServiceOne,
    // About,
    Slider,
    Header

  }
}
</script>

<style>

</style>
