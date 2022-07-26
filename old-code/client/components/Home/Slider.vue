<template>
  <!-- Start Slider Area -->
  <div class="intro-area intro-home">
    <div class="bg-wrapper">
      <img src="/img/background/bg.jpg" alt="">
    </div>
    <div class="intro-content">
      <div class="slider-content">
        <div class="container">
          <div class="row">
            <div class="col-md-6 col-sm-6 col-xs-12">
              <div class="slide-all-text">
                <!-- layer 1 -->
                <div class="layer-1 wow fadeInUp" data-wow-delay="0.3s">
                  <h2 class="title2">Convert plain text into <span class="color">SQL</span> </h2>
                </div>
                <!-- layer 2 -->
                <div class="layer-2 wow fadeInUp" data-wow-delay="0.5s">
                  <!-- <p>We develop effective plans to move your customers behaviour. customer can be alwayes his profit.</p> -->
                </div>
                <!-- layer 3 -->
                <div class="layer-3 wow fadeInUp" data-wow-delay="0.7s">
                  <router-link to="demo" class="ready-btn" >Try it now</router-link>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-sm-6 hidden-xs">
              <div class="slide-images-inner wow fadeInUp" data-wow-delay="0.5s">
                <div class="slide-images">
                  <!-- <img src="/img/slider/s1.png" alt=""> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- End Slider Area -->
</template>

<script>
    export default {
        name: "Slider"
    }
</script>

<style scoped>

</style>