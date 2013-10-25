/*global jasmine:false, describe:false, beforeEach:false, spyOn:false, it:false, expect: false, prezento: false */

'use strict';

describe('Prezento :', function () {
  var fakeIframe,

    fakeElement = {
      foo: 'bar'
    },

    goodSelector = '#foobar',

    goodSlidesInfos = {
      steps: [],
      features: []
    },

    expectValidSlideDeckProxy = function (slideDeckProxy) {
      expect(slideDeckProxy).not.toBeUndefined();

      expect(slideDeckProxy.on).toEqual(jasmine.any(Function));

      expect(slideDeckProxy.init).toEqual(jasmine.any(Function));
      expect(slideDeckProxy.goTo).toEqual(jasmine.any(Function));
      expect(slideDeckProxy.prev).toEqual(jasmine.any(Function));
      expect(slideDeckProxy.next).toEqual(jasmine.any(Function));
      expect(slideDeckProxy.first).toEqual(jasmine.any(Function));
      expect(slideDeckProxy.last).toEqual(jasmine.any(Function));
      expect(slideDeckProxy.toggleMultimedia).toEqual(jasmine.any(Function));
      expect(slideDeckProxy.toggleOverview).toEqual(jasmine.any(Function));
    },

    expectValidShellProxy = function (shellProxy) {
      expect(shellProxy).not.toBeUndefined();

      expect(shellProxy.on).toEqual(jasmine.any(Function));

      expect(shellProxy.notifyReady).toEqual(jasmine.any(Function));
      expect(shellProxy.notifyCursor).toEqual(jasmine.any(Function));
      expect(shellProxy.notifyNotes).toEqual(jasmine.any(Function));
    },

    noop = function () {
    },

    triggerLoadOnFakeContentWindow = function () {
    },

    triggerMessageEvent;

  beforeEach(function () {
    console.error = jasmine.createSpy('console.error');

    fakeIframe = fakeIframe = {
      addEventListener: jasmine.createSpy('contentWindow.addEventListener').andCallFake(function (event, callback) {
        if (event === 'load') {
          triggerLoadOnFakeContentWindow = callback;
        }
      }),
      contentWindow: {
        postMessage: jasmine.createSpy('contentWindow.postMessage'),
        addEventListener: jasmine.createSpy('contentWindow.addEventListener')
      }
    };

    document.querySelector = jasmine.createSpy('querySelector').andCallFake(function (selector) {
      if (selector === goodSelector) {
        return fakeIframe;
      } else {
        return null;
      }
    });

    window.addEventListener = jasmine.createSpy('addEventListener').andCallFake(function (eventType, callback) {
      if (eventType === 'message') {
        triggerMessageEvent = callback;
      }
    });
  });

  describe('createSlideDeckProxy()', function () {

    it('should return a valid slide deck proxy if initialized with a good selector', function () {
      // given
      var slideDeckProxy;

      // when
      slideDeckProxy = prezento.createSlideDeckProxy(goodSelector);

      // then
      expectValidSlideDeckProxy(slideDeckProxy);
    });

    it('should not return a valid slide deck proxy if initialized with a bad selector', function () {
      // given
      var slideDeckProxy;

      // when
      slideDeckProxy = prezento.createSlideDeckProxy('#badSelector');

      // then
      expect(slideDeckProxy).toBeUndefined();
    });

    it('should return a valid slide deck proxy if initialized with an iframe element', function () {
      // given
      var slideDeckProxy;

      // when
      slideDeckProxy = prezento.createSlideDeckProxy(fakeIframe);

      // then
      expectValidSlideDeckProxy(slideDeckProxy);
    });

    it('should return a valid slide deck proxy if initialized with a contentWindow object', function () {
      // given
      var slideDeckProxy;

      // when
      slideDeckProxy = prezento.createSlideDeckProxy(fakeIframe.contentWindow);

      // then
      expectValidSlideDeckProxy(slideDeckProxy);
    });

    it('should not return a valid slide deck proxy if initialized with something that is not an iframe or a contentWindow', function () {
      // given
      var slideDeckProxy;

      // when
      slideDeckProxy = prezento.createSlideDeckProxy(fakeElement);

      // then
      expect(slideDeckProxy).toBeUndefined();
    });

    it('should not return a valid slide deck proxy if initialized with null or undefined', function () {
      // given
      var slideDeckProxy;

      // when
      slideDeckProxy = prezento.createSlideDeckProxy(null);

      // then
      expect(slideDeckProxy).toBeUndefined();

      // and when
      slideDeckProxy = prezento.createSlideDeckProxy();

      // then
      expect(slideDeckProxy).toBeUndefined();
    });
  });

  describe('slide deck proxy', function () {
    var slideDeckProxy;

    beforeEach(function () {
      slideDeckProxy = prezento.createSlideDeckProxy(goodSelector);
    });

    it('should post message when calling actions directly', function () {
      // when
      slideDeckProxy.init();
      slideDeckProxy.goTo('4.2');
      slideDeckProxy.prev();
      slideDeckProxy.next();
      slideDeckProxy.first();
      slideDeckProxy.last();
      slideDeckProxy.toggleMultimedia();
      slideDeckProxy.toggleOverview();

      // then
      expect(fakeIframe.contentWindow.postMessage.callCount).toBe(8);
    });

    it('should call appropriate callback when events are received', function () {
      // given
      var spyReady = jasmine.createSpy('spyReady'),
        spyCursor = jasmine.createSpy('spyCursor'),
        spyNotes = jasmine.createSpy('spyNotes');

      // when
      slideDeckProxy.on('ready', spyReady);
      slideDeckProxy.on('cursor', spyCursor);
      slideDeckProxy.on('notes', spyNotes);
      triggerMessageEvent({data: ['ready', {foo: 'bar'}]});
      triggerMessageEvent({data: ['cursor', '4.2']});
      triggerMessageEvent({data: ['notes', 'Lorem ipsum']});

      // then
      expect(spyReady).toHaveBeenCalled();
      expect(spyCursor).toHaveBeenCalled();
      expect(spyNotes).toHaveBeenCalled();
    });

    it('should call multiple registered callbacks when an event is received', function () {
      // given
      var spyOne = jasmine.createSpy('spyOne'),
        spyTwo = jasmine.createSpy('spyTwo'),
        spyThree = jasmine.createSpy('spyThree');

      // when
      slideDeckProxy.on('ready', spyOne);
      slideDeckProxy.on('ready', spyTwo);
      slideDeckProxy.on('ready', spyThree);
      triggerMessageEvent({data: ['ready', {foo: 'bar'}]});

      // then
      expect(spyOne).toHaveBeenCalled();
      expect(spyTwo).toHaveBeenCalled();
      expect(spyThree).toHaveBeenCalled();
    });

    it('should do nothing when an invalid event is received', function () {
      // given
      var spyReady = jasmine.createSpy('spyReady'),
        spyCursor = jasmine.createSpy('spyCursor'),
        spyNotes = jasmine.createSpy('spyNotes');

      // when
      slideDeckProxy.on('ready', spyReady);
      slideDeckProxy.on('cursor', spyCursor);
      slideDeckProxy.on('notes', spyNotes);
      triggerMessageEvent({data: ['unknownEvent', {foo: 'bar'}]});

      // then
      expect(spyReady).not.toHaveBeenCalled();
      expect(spyCursor).not.toHaveBeenCalled();
      expect(spyNotes).not.toHaveBeenCalled();
    });

    it('should listen to load events on iframe when ready event callback is added', function () {
      // when
      slideDeckProxy.on('ready', function () {
      });

      // then
      expect(fakeIframe.addEventListener).toHaveBeenCalledWith('load', jasmine.any(Function));
    });

    it('should call slideDeckProxy init function when iframe is loaded', function () {
      // given
      slideDeckProxy.init = jasmine.createSpy('slideDeckProxy.init');

      // when
      slideDeckProxy.on('ready', function () {
      });
      triggerLoadOnFakeContentWindow();

      // then
      expect(slideDeckProxy.init).toHaveBeenCalled();
    });

    it('event registrations can be chained', function () {
      // when
      var onReturn = slideDeckProxy.on('ready', function () {
      });

      // then
      expect(onReturn).toBe(slideDeckProxy);
    });
  });

  describe('createShellProxy()', function () {

    it('should return a valid shell proxy if initialized with a good slidesInfos object', function () {
      // given
      var shellProxy;

      // when
      shellProxy = prezento.createShellProxy(goodSlidesInfos);

      // then
      expectValidShellProxy(shellProxy);
    });

    it('should not return a valid shell proxy if initialized with a bad slidesInfos object', function () {
      // given
      var shellProxy;

      // when
      shellProxy = prezento.createShellProxy({title: ''});

      // then
      expect(shellProxy).toBeUndefined();

      // and when
      shellProxy = prezento.createShellProxy({});

      // then
      expect(shellProxy).toBeUndefined();
    });

    it('should not return a valid shell proxy if initialized with null or undefined', function () {
      // given
      var shellProxy;

      // when
      shellProxy = prezento.createShellProxy(null);

      // then
      expect(shellProxy).toBeUndefined();

      // and when
      shellProxy = prezento.createShellProxy();

      // then
      expect(shellProxy).toBeUndefined();
    });
  });

  describe('shell proxy', function () {
    var shellProxy;

    beforeEach(function () {
      shellProxy = prezento.createShellProxy(goodSlidesInfos);

      shellProxy.setGetterFor('cursor', noop);
      shellProxy.setGetterFor('step', noop);

      triggerMessageEvent({
        data: ['init'],
        source: fakeIframe.contentWindow
      });
    });

    it('should post message when notifying events directly', function () {
      // when
      shellProxy.notifyReady({foo: 'bar'});
      shellProxy.notifyCursor('4.2');
      shellProxy.notifyNotes('Lorem ipsum');

      // then
      expect(fakeIframe.contentWindow.postMessage.callCount).toBe(3 + 3);
    });

    it('should call appropriate callback when actions are received', function () {
      // given
      var spyInit = jasmine.createSpy('spyInit'),
        spyGoTo = jasmine.createSpy('spyGoTo'),
        spyPrev = jasmine.createSpy('spyPrev'),
        spyNext = jasmine.createSpy('spyNext'),
        spyFirst = jasmine.createSpy('spyFirst'),
        spyLast = jasmine.createSpy('spyLast'),
        spyToggleMultimedia = jasmine.createSpy('spyToggleMultimedia'),
        spyToggleOverview = jasmine.createSpy('spyToggleOverview');

      // when
      shellProxy.on('init', spyInit);
      shellProxy.on('goTo', spyGoTo);
      shellProxy.on('prev', spyPrev);
      shellProxy.on('next', spyNext);
      shellProxy.on('first', spyFirst);
      shellProxy.on('last', spyLast);
      shellProxy.on('toggleMultimedia', spyToggleMultimedia);
      shellProxy.on('toggleOverview', spyToggleOverview);
      triggerMessageEvent({data: ['init']});
      triggerMessageEvent({data: ['goTo', '4.2']});
      triggerMessageEvent({data: ['prev']});
      triggerMessageEvent({data: ['next']});
      triggerMessageEvent({data: ['first']});
      triggerMessageEvent({data: ['last']});
      triggerMessageEvent({data: ['toggleMultimedia']});
      triggerMessageEvent({data: ['toggleOverview']});

      // then
      expect(spyInit).toHaveBeenCalled();
      expect(spyGoTo).toHaveBeenCalled();
      expect(spyPrev).toHaveBeenCalled();
      expect(spyNext).toHaveBeenCalled();
      expect(spyFirst).toHaveBeenCalled();
      expect(spyLast).toHaveBeenCalled();
      expect(spyToggleMultimedia).toHaveBeenCalled();
      expect(spyToggleOverview).toHaveBeenCalled();
    });

    it('should call multiple registered callbacks when an event is received', function () {
      // given
      var spyOne = jasmine.createSpy('spyOne'),
        spyTwo = jasmine.createSpy('spyTwo'),
        spyThree = jasmine.createSpy('spyThree');

      // when
      shellProxy.on('goTo', spyOne);
      shellProxy.on('goTo', spyTwo);
      shellProxy.on('goTo', spyThree);
      triggerMessageEvent({data: ['goTo', '4.2']});

      // then
      expect(spyOne).toHaveBeenCalled();
      expect(spyTwo).toHaveBeenCalled();
      expect(spyThree).toHaveBeenCalled();
    });

    it('should do nothing when an invalid event is received', function () {
      // given
      var spyInit = jasmine.createSpy('spyInit'),
        spyGoTo = jasmine.createSpy('spyGoTo'),
        spyPrev = jasmine.createSpy('spyPrev'),
        spyNext = jasmine.createSpy('spyNext'),
        spyFirst = jasmine.createSpy('spyFirst'),
        spyLast = jasmine.createSpy('spyLast'),
        spyToggleMultimedia = jasmine.createSpy('spyToggleMultimedia'),
        spyToggleOverview = jasmine.createSpy('spyToggleOverview');

      // when
      shellProxy.on('init', spyInit);
      shellProxy.on('goTo', spyGoTo);
      shellProxy.on('prev', spyPrev);
      shellProxy.on('next', spyNext);
      shellProxy.on('first', spyFirst);
      shellProxy.on('last', spyLast);
      shellProxy.on('toggleMultimedia', spyToggleMultimedia);
      shellProxy.on('toggleOverview', spyToggleOverview);
      triggerMessageEvent({data: ['unknownAction']});

      // then
      expect(spyInit).not.toHaveBeenCalled();
      expect(spyGoTo).not.toHaveBeenCalled();
      expect(spyPrev).not.toHaveBeenCalled();
      expect(spyNext).not.toHaveBeenCalled();
      expect(spyFirst).not.toHaveBeenCalled();
      expect(spyLast).not.toHaveBeenCalled();
      expect(spyToggleMultimedia).not.toHaveBeenCalled();
      expect(spyToggleOverview).not.toHaveBeenCalled();
    });

    it('event registrations can be chained', function () {
      // when
      var onReturn = shellProxy.on('goTo', noop);

      // then
      expect(onReturn).toBe(shellProxy);
    });

    it('getter sets can be chained', function () {
      // when
      var setGetterForReturn = shellProxy.setGetterFor('cursor', noop);

      // then
      expect(setGetterForReturn).toBe(shellProxy);
    });
  });
});
