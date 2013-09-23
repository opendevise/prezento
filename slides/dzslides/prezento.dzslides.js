'use strict';

window.onload();

prezento

  .createShellProxy({
    title: document.title,
    steps: Dz.slides.map(function (slide, idx) {
      return (idx + 1) + '.0';
    }),
    features: ["multimedia", "overview", "notes"]
  })

  .getter('cursor', function () {
    return location.hash.slice(1) || '1.0';
  })

  .getter('step', function () {
    return (location.hash.slice(1).split('.').shift() || '1') + '.0';
  })

  .getter('notes', function () {
    return Dz.getNotes(Dz.idx);
  })

  .on('goTo', function (cursor) {
    location.hash = cursor;
  })

  .on('prev', Dz.back.bind(Dz))
  .on('next', Dz.forward.bind(Dz))
  .on('first', Dz.goStart.bind(Dz))
  .on('last', Dz.goEnd.bind(Dz))
  .on('toggleOverview', Dz.toggleView.bind(Dz))
  .on('toggleMultimedia', Dz.toggleContent.bind(Dz));
