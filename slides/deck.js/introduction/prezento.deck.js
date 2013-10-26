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

    .configGetters({

      cursor: function () {
        return $.deck('getSlide').attr('id');
      },

      step: function () {
        return $.deck('getSlide').attr('id');
      },

      notes: function () {
        var notes = document.querySelector('.slides > section.present aside.notes');
        return notes ? notes.innerHTML : '';
      }
    })

    .configListeners({

      goTo: function (cursor) {
        $.deck('go', cursor);
      },
      prev: function () {
        $.deck('prev');
      },
      next: function () {
        $.deck('next');
      },
      first: function () {
        $.deck('go', 0);
      },
      last: function () {
        $.deck('go', $.deck('getSlides').length - 1);
      },
      toggleOverview: function () {
        $.deck('toggleMenu');
      }
    });
