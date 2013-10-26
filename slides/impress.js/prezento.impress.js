'use strict';

var impressObj = impress();
impressObj.init();

prezento

    .createShellProxy({
      title: document.title,
      steps: Array.prototype.slice.call(document.querySelectorAll('.step')).map(function (step) {
        return step.id;
      }),
      features: []
    })

    .configGetters({

      cursor: function () {
        return document.querySelector('.active').id;
      },

      step: function () {
        return document.querySelector('.active').id;
      }
    })

    .configListeners({

      goTo: impressObj.goto,
      prev: impressObj.prev,
      next: impressObj.next,

      first: function () {
        impressObj.goto(document.querySelector('.step').id);
      },
      last: function () {
        impressObj.goto(document.querySelector('.step:last-child').id);
      }
    });
