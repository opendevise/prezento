/*global jasmine:false, describe:false, beforeEach:false, it:false, expect: false, slideDeck: false */

'use strict';

var vendors = [
  { name: 'dzslides', url: 'http://localhost:8080/slides/dzslides/' },
  { name: 'impress.js', url: 'http://localhost:8080/slides/impress.js/' },
  { name: 'deck.js', url: 'http://localhost:8080/slides/deck.js/introduction/' },
//  { name: 'reveal.js', url: 'http://localhost:8080/slides/reveal.js/' },
//  { name: 'io-2013-slides', url: 'http://localhost:8080/slides/io-2013-slides/template.html' }
];

/* jshint camelcase: false */
function it_should_send_cursor_step_and_notes_events(expectedStep) {

  it('should send "cursor" event', function () {
    expect(slideDeck).toHaveSentEvent('cursor', expectedStep);
  });

  it('should send "step" event', function () {
    expect(slideDeck).toHaveSentEvent('step', expectedStep);
  });

  it('should send "notes" event (if supported)', function () {
    if (slideDeck.hasFeature('notes')) {
      expect(slideDeck).toHaveSentEvent('notes', jasmine.any(String));
    }
  });
}

vendors.forEach(function (vendor) {

  describe(vendor.name, function () {

    beforeEach(function () {
      slideDeck.load(vendor.url);
    });

    describe('receiving "init" action', function () {

      var firstStep;

      beforeEach(function () {
        firstStep = slideDeck.infos.steps[0];
        slideDeck.sendAction('init');
      });

      it('should send "ready" event', function () {
        expect(slideDeck).toHaveSentEvent('ready');
      });

      it_should_send_cursor_step_and_notes_events(firstStep);
    });

    describe('receiving "goTo" action', function () {

      var secondStep;

      beforeEach(function () {
        secondStep = slideDeck.infos.steps[2];
        slideDeck.sendAction('goTo', secondStep);
      });

      it_should_send_cursor_step_and_notes_events(secondStep);
    });

    describe('receiving "prev" action', function () {

      var firstStep,
          secondStep;

      beforeEach(function () {
        firstStep = slideDeck.infos.steps[0];
        secondStep = slideDeck.infos.steps[1];
        slideDeck.sendAction('goTo', secondStep);
        slideDeck.sendAction('prev');
      });

      it_should_send_cursor_step_and_notes_events(firstStep);
    });

    describe('receiving "next" action', function () {

      var firstStep,
          secondStep;

      beforeEach(function () {
        firstStep = slideDeck.infos.steps[0];
        secondStep = slideDeck.infos.steps[1];
        slideDeck.sendAction('goTo', firstStep);
        slideDeck.sendAction('next');
      });

      it_should_send_cursor_step_and_notes_events(secondStep);
    });

    describe('receiving "first" action', function () {

      var firstStep;

      beforeEach(function () {
        firstStep = slideDeck.infos.steps[0];
        slideDeck.sendAction('first');
      });

      it_should_send_cursor_step_and_notes_events(firstStep);
    });

    describe('receiving "last" action', function () {

      var lastStep;

      beforeEach(function () {
        lastStep = slideDeck.infos.steps.slice(-1)[0];
        slideDeck.sendAction('last');
      });

      it_should_send_cursor_step_and_notes_events(lastStep);
    });

    describe('slideDeckInfos argument', function () {

      it('should have a title String property', function () {
        expect(slideDeck.infos.title).toEqual(jasmine.any(String));
      });

      it('should have a metas Object property with 2 mandatory values', function () {
        expect(slideDeck.infos.metas).toEqual(jasmine.any(Object));
        expect(slideDeck.infos.metas['prezento-capable']).toBe('yes');
        expect(slideDeck.infos.metas['prezento-vendor']).toBe(vendor.name);
      });

      it('should have a steps Array property', function () {
        expect(slideDeck.infos.steps).toEqual(jasmine.any(Array));
      });

      it('should have a features Array property', function () {
        expect(slideDeck.infos.features).toEqual(jasmine.any(Array));
      });
    });
  });
});
