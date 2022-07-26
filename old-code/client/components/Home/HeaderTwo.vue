<template>
  <header class="header-two">
    <!-- Start top bar -->
    <div class="topbar-area fix hidden-xs">
      <div class="container">
        <div class="row">
          <div class=" col-md-9 col-sm-9">
            <div class="topbar-left">
              <ul>
                <li><a href="#"><i class="fa fa-envelope"></i>tao.yu@yale.edu</a></li>
                <!-- <li><a href="#"><i class="fa fa-phone-square"></i> +3234-7665545</a></li>
                <li><a href="#"><i class="fa fa-clock-o"></i> Mon - Fri: 10:00 - 18:00</a></li> -->
              </ul>
            </div>
          </div>
          <div class="col-md-3 col-sm-3">
            <div class="top-social">
              <ul>
                <li><a href="#"><i class="fa fa-skype"></i></a></li>
                <li><a href="#"><i class="fa fa-twitter"></i></a></li>
                <li><a href="#"><i class="fa fa-facebook"></i></a></li>
                <li><a href="#"><i class="fa fa-google"></i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- End top bar -->
    <!-- header-area start -->
    <div id="sticker" class="header-area header-area-2 hidden-xs">
      <div class="container">
        <div class="row">
          <!-- logo start -->
          <div class="col-md-3 col-sm-3">
            <div class="logo">
              <!-- Brand -->
              <a class="navbar-brand white-logo" to="/">
                <img src="/img/logo/logo.png" alt="">
              </a>
              <a class="navbar-brand black-logo" to="/">
                <img src="/img/logo/logo2.png" alt="">
              </a>
            </div>
            <!-- logo end -->
          </div>
          <div class="col-md-9 col-sm-9">
            <div class="header-right-link">
              <!-- search option end -->
              <!-- <a class="s-menu" to="login">Get in Estimate</a> -->
            </div>
            <!-- mainmenu start -->
            <nav class="navbar navbar-default">
            </nav>
            <!-- mainmenu end -->
          </div>
        </div>
      </div>
    </div>
    <!-- header-area end -->
    <!-- mobile-menu-area start -->
    <div class="mobile-menu-area hidden-lg hidden-md hidden-sm">
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div class="mobile-menu">
              <div class="logo">
                <a to="/"><img src="/img/logo/logo2.png" alt="" /></a>
              </div>
              <nav id="dropdown">
                <ul>
                  <li><a class="pagess" to="#">Home</a>
                    <ul class="sub-menu">
                      <li><a to="/">Home 01</a></li>
                      <li><a to="/index-2">Home 02</a></li>
                      <li><a to="/index-3">Home 03</a></li>
                    </ul>
                  </li>
                  <li><a class="pagess" to="#">Pages</a>
                    <ul class="sub-menu">
                      <li><a to="/about">About</a></li>
                      <li><a to="/team">team</a></li>
                      <li><a to="/faq">FAQ</a></li>
                      <li><a to="/review">Review</a></li>
                      <li><a to="/pricing">Pricing</a></li>
                    </ul>
                  </li>
                  <li><a class="pagess" to="#">Services</a>
                    <ul class="sub-menu">
                      <li><a to="/service">All services</a></li>
                      <li><a to="/service-details">Service-details</a></li>
                    </ul>
                  </li>
                  <li><a class="pagess" to="#">Works</a>
                    <ul class="sub-menu">
                      <li><a to="/project">Projects 01</a></li>
                      <li><a to="/project-2">Projects 02</a></li>
                      <li><a to="/project-details">Project details</a></li>
                    </ul>
                  </li>
                  <li><a class="pagess" to="#">Blog</a>
                    <ul class="sub-menu">
                      <li><a to="/blog">Blog grid</a></li>
                      <li><a to="/blog-sidebar">Blog Sidebar</a></li>
                      <li><a to="/blog-details">Blog Details</a></li>
                    </ul>
                  </li>
                  <li><a to="/contact">contacts</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- mobile-menu-area end -->
  </header>
  <!-- header end -->
</template>

<script>
    export default {
        name: "HeaderTwo",
      mounted() {

          /*---------------------
           TOP Menu Stick
          --------------------- */

          var windows = $(window);
          var sticky = $('#sticker');

          windows.on('scroll', function() {
            var scroll = windows.scrollTop();
            if (scroll < 300) {
              sticky.removeClass('stick');
            }else{
              sticky.addClass('stick');
            }
          });




          /*----------------------------
           jQuery MeanMenu
          ------------------------------ */

          var mean_menu = $('nav#dropdown');
          mean_menu.meanmenu();

          /*---------------------
           wow .js
          --------------------- */
          function wowAnimation(){
            new WOW({
              offset: 100,
              mobile: true
            }).init()
          }
          wowAnimation()

          /*--------------------------
           scrollUp
          ---------------------------- */

          $.scrollUp({
            scrollText: '<i class="ti-arrow-up"></i>',
            easingType: 'linear',
            scrollSpeed: 900,
            animation: 'fade'
          });


          /*--------------------------
           collapse
          ---------------------------- */

          var panel_test = $('.panel-heading a');
          panel_test.on('click', function(){
            panel_test.removeClass('active');
            $(this).addClass('active');
          });

      }
    }
</script>

<style scoped>

</style>