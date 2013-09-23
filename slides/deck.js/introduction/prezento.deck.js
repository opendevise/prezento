'use strict';

$.deck('.slide')

prezento

  .createShellProxy({
    title: document.title,
    steps: $.deck('getSlides').map(function (slide) {
      return slide.attr('id');
    }),
    features: ['overview']
  })

  .getter('cursor', function () {
    return $.deck('getSlide').attr('id');
  })

  .getter('step', function () {
    return $.deck('getSlide').attr('id');
  })

  .on('goTo', function (cursor) {
    $.deck('go', cursor);
  })

  .on('prev', function () {
    $.deck('prev');
  })
  .on('next', function () {
    $.deck('next');
  })
  .on('first', function () {
    $.deck('go', 0);
  })
  .on('last', function () {
    $.deck('go', $.deck('getSlides').length - 1);
  })
  .on('toggleOverview', function () {
    $.deck('toggleMenu');
  });
