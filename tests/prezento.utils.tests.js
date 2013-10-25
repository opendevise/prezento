/*global jasmine:false, describe:false, it:false, expect: false, prezento: false */

'use strict';

describe('Prezento utils :', function () {
  var utils = prezento._utils;

  describe('parseMsg()', function () {

    it('should return null and log error if msgEvent.data is not an array', function () {
      // given
      var msgEvent = {
          data: 'foobar'
        },
        msg;

      window.console = {
        error: jasmine.createSpy('console.error')
      };

      // when
      msg = utils.parseMsg(msgEvent);

      // then
      expect(msg).toBe(null);
      expect(window.console.error).toHaveBeenCalled();
    });

    it('should return null and log error if msgEvent.data array length is not at least 1', function () {
      // given
      var msgEvent = {
          data: []
        },
        msg;

      window.console = {
        error: jasmine.createSpy('console.error')
      };

      // when
      msg = utils.parseMsg(msgEvent);

      // then
      expect(msg).toBe(null);
      expect(window.console.error).toHaveBeenCalled();
    });

    it('should return null and log error if msgEvent.data array first element is not an action or an event', function () {
      // given
      var msgEvent = {
          data: ['foobar']
        },
        msg;

      window.console = {
        error: jasmine.createSpy('console.error')
      };

      // when
      msg = utils.parseMsg(msgEvent);

      // then
      expect(msg).toBe(null);
      expect(window.console.error).toHaveBeenCalled();
    });

    it('should identify msgEvent.data array first element as an action or event', function () {
      // given
      var msgEvent = {
          data: ['ready']
        },
        msg;

      // when
      msg = utils.parseMsg(msgEvent);

      // then
      expect(msg.actionOrEvent).toBe('ready');
    });

    it('should identify msgEvent.data other elements with no args', function () {
      // given
      var msgEvent = {
          data: ['ready']
        },
        msg;

      // when
      msg = utils.parseMsg(msgEvent);

      // then
      expect(msg.args).toEqual([]);
    });

    it('should identify msgEvent.data other elements with one arg', function () {
      // given
      var msgEvent = {
          data: ['goTo', '4.2']
        },
        msg;

      // when
      msg = utils.parseMsg(msgEvent);

      // then
      expect(msg.args).toEqual(['4.2']);
    });

    it('should identify msgEvent.data other elements with more than one arg', function () {
      // given
      var msgEvent = {
          data: ['goTo', '4.2', 'fakeArg1', 'fakeArg2']
        },
        msg;

      // when
      msg = utils.parseMsg(msgEvent);

      // then
      expect(msg.args).toEqual(['4.2', 'fakeArg1', 'fakeArg2']);
    });
  });

  describe('ucfirst()', function () {

    it('should uppercase first letter of lowercase strings', function () {
      // given
      var str = 'foobar';

      // when
      str = utils.ucfirst(str);

      // then
      expect(str).toBe('Foobar');
    });

    it('should let first letter already uppercased as is', function () {
      // given
      var str = 'Foobar';

      // when
      str = utils.ucfirst(str);

      // then
      expect(str).toBe('Foobar');
    });

    it('should not modify case of other letters', function () {
      // given
      var str = 'fooBar';

      // when
      str = utils.ucfirst(str);

      // then
      expect(str).toBe('FooBar');
    });
  });

  describe('postMsg()', function () {

    it('should call postMessage on target', function () {
      // given
      var target = {
          postMessage: jasmine.createSpy('postMessage')
        },
        actionOrEvent = 'goTo',
        args = (function () {
          return arguments;
        })('4.2');

      // when
      utils.postMsg(target, actionOrEvent, args);

      // then
      expect(target.postMessage).toHaveBeenCalled();
    });

    it('should transform action or event name with no args to an array', function () {
      // given
      var target = {
          postMessage: jasmine.createSpy('postMessage')
        },
        actionOrEvent = 'goTo',
        args = (function () {
          return arguments;
        })();

      // when
      utils.postMsg(target, actionOrEvent, args);

      // then
      expect(target.postMessage).toHaveBeenCalledWith(['goTo'], '*');
    });

    it('should transform action or event name with one arg to an array', function () {
      // given
      var target = {
          postMessage: jasmine.createSpy('postMessage')
        },
        actionOrEvent = 'goTo',
        args = (function () {
          return arguments;
        })('4.2');

      // when
      utils.postMsg(target, actionOrEvent, args);

      // then
      expect(target.postMessage).toHaveBeenCalledWith(['goTo', '4.2'], '*');
    });

    it('should transform action or event name with more than one arg to an array', function () {
      // given
      var target = {
          postMessage: jasmine.createSpy('postMessage')
        },
        actionOrEvent = 'goTo',
        args = (function () {
          return arguments;
        })('4.2', 'foo', 'bar');

      // when
      utils.postMsg(target, actionOrEvent, args);

      // then
      expect(target.postMessage).toHaveBeenCalledWith(['goTo', '4.2', 'foo', 'bar'], '*');
    });
  });

  describe('getMetas()', function () {

    it('should get meta from DOM', function () {

      // given
      var author = 'Hakim El Hattab',
        description = 'A framework for easily creating beautiful presentations using HTML',
        metasMarkup = '<meta name="description" content="' + description + '"><meta name="author" content="' + author + '">';

      document.body.innerHTML += metasMarkup;

      // when
      var metas = utils.getMetas();

      // then
      expect(metas.description).toBe(description);
      expect(metas.author).toBe(author);
    });
  });
});
