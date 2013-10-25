'use strict';

var shell = prezento

  .createShellProxy({
    title: document.title,
    steps: Array.prototype.slice.call(document.querySelectorAll('slide:not([hidden]):not(.backdrop)')).map(function (slide, idx) {
      return String(idx + 1);
    }),
    features: ["overview"]
  })

  .setGetterFor('cursor', function () {
    return location.hash.slice(1);
  })

  .setGetterFor('step', function () {
    return location.hash.slice(1);
  });

setTimeout(function () {

  shell
    .on('goTo', slidedeck.loadSlide.bind(slidedeck))
    .on('prev', slidedeck.prevSlide.bind(slidedeck))
    .on('next', slidedeck.nextSlide.bind(slidedeck))
    .on('first', slidedeck.loadSlide.bind(slidedeck, 1))
    .on('last', slidedeck.loadSlide.bind(slidedeck, slidedeck.slides.length))
    .on('toggleOverview', slidedeck.toggleOverview);

}, 1000);
