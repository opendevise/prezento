'use strict';

prezento

  .createShellProxy({
    steps: Array.prototype.slice.call(document.querySelectorAll('.reveal .slides > section, .reveal .slides > section.present > section')).map(function (section, idx) {
      return (idx) + '.0';
    }),
    features: ["overview", "notes"]
  })

  .getter('cursor', function () {
    var cursor = Reveal.getIndices();
    return cursor.h + '.' + cursor.v + (cursor.f ? ('.' + cursor.f) : '');
  })

  .getter('step', function () {
    var cursor = Reveal.getIndices();
    return cursor.h + '.0';
  })

  .getter('notes', function () {
    var notes = document.querySelector('.slides > section.present aside.notes');
    return notes ? notes.innerHTML : '';
  })

  .on('init', function () {
    Reveal.configure({controls: false, progress: false});
  })

  .on('goTo', function (cursor) {
    cursor = cursor.split('.');
    Reveal.slide(+cursor[0], +cursor[1], +cursor[2]);
  })

  .on('prev', Reveal.prev)
  .on('next', Reveal.next)
  .on('first', Reveal.slide.bind(Reveal, 0))
  .on('last', Reveal.slide.bind(Reveal, Number.MAX_VALUE))
  .on('toggleOverview', Reveal.toggleOverview);
