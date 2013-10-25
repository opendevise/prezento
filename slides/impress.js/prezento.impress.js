'use strict';

var impressObj = impress();
impressObj.init();

var shell = prezento

  .createShellProxy({
    title: document.title,
    steps: Array.prototype.slice.call(document.querySelectorAll('.step')).map(function (step) {
      return step.id;
    }),
    features: []
  })

  .setGetterFor('cursor', function () {
    return document.querySelector('.active').id;
  })

  .setGetterFor('step', function () {
    return document.querySelector('.active').id;
  })

  .on('goTo', impressObj.goto)
  .on('prev', impressObj.prev)
  .on('next', impressObj.next)
  .on('first', function () {
    impressObj.goto(document.querySelector('.step').id);
  })
  .on('last', function () {
    impressObj.goto(document.querySelector('.step:last-child').id);
  });
