'use strict';

window.onload();

prezento

    .createShellProxy({
      title: document.title,
      steps: Dz.slides.map(function (slide, idx) {
        return (idx + 1) + '.0';
      }),
      features: ['multimedia', 'overview', 'notes']
    })

    .configGetters({

      cursor: function () {
        return location.hash.slice(1) || '1.0';
      },

      step: function () {
        return (location.hash.slice(1).split('.').shift() || '1') + '.0';
      },

      notes: function () {
        return Dz.getNotes(Dz.idx);
      }
    })

    .configListeners({

      goTo: function (cursor) {
        location.hash = cursor;
      },

      prev: Dz.back.bind(Dz),
      next: Dz.forward.bind(Dz),
      first: Dz.goStart.bind(Dz),
      last: Dz.goEnd.bind(Dz),
      toggleOverview: Dz.toggleView.bind(Dz),
      toggleMultimedia: Dz.toggleContent.bind(Dz)
    });
