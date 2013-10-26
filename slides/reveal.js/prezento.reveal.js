'use strict';

prezento

    .createShellProxy({
      steps: Array.prototype.slice.call(document.querySelectorAll('.reveal .slides > section, .reveal .slides > section.present > section')).map(function (section, idx) {
        return (idx) + '.0';
      }),
      features: ['overview', 'notes']
    })

    .configGetters({

      cursor: function () {
        var cursor = Reveal.getIndices();
        return cursor.h + '.' + cursor.v + (cursor.f ? ('.' + cursor.f) : '');
      },

      step: function () {
        var cursor = Reveal.getIndices();
        return cursor.h + '.0';
      },

      notes: function () {
        var notes = document.querySelector('.slides > section.present aside.notes');
        return notes ? notes.innerHTML : '';
      }
    })

    .configListeners({

      init: function () {
        Reveal.configure({controls: false, progress: false});
      },

      goTo: function (cursor) {
        cursor = cursor.split('.');
        Reveal.slide(+cursor[0], +cursor[1], +cursor[2]);
      },

      prev: Reveal.prev,
      next: Reveal.next,
      first: Reveal.slide.bind(Reveal, 0),
      last: Reveal.slide.bind(Reveal, Number.MAX_VALUE),
      toggleOverview: Reveal.toggleOverview
    });
