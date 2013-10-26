'use strict';

var shell = prezento

    .createShellProxy({
      title: document.title,
      steps: Array.prototype.slice.call(document.querySelectorAll('slide:not([hidden]):not(.backdrop)')).map(function (slide, idx) {
        return String(idx + 1);
      }),
      features: ['overview']
    })

    .configGetters({

      cursor: function () {
        return location.hash.slice(1);
      },

      step: function () {
        return location.hash.slice(1);
      }
    });


setTimeout(function () {

  shell.configListeners({
    goTo: slidedeck.loadSlide.bind(slidedeck),
    prev: slidedeck.prevSlide.bind(slidedeck),
    next: slidedeck.nextSlide.bind(slidedeck),
    first: slidedeck.loadSlide.bind(slidedeck, 1),
    last: slidedeck.loadSlide.bind(slidedeck, slidedeck.slides.length),
    toggleOverview: slidedeck.toggleOverview.bind(slidedeck)
  });

}, 1000);
