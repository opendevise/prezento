/*global beforeEach:false, runs: false, expect: false */

'use strict';

beforeEach(function () {
  this.addMatchers({

    toHaveSentEvent: function (expectedEvent, expectedEventArg) {

      var sendEventSpies = this.actual.sendEventSpies;

      runs(function () {
        if (expectedEventArg) {
          expect(sendEventSpies[expectedEvent]).toHaveBeenCalledWith(expectedEventArg);
        } else {
          expect(sendEventSpies[expectedEvent]).toHaveBeenCalled();
        }
      });

      return true;
    }
  });
});
