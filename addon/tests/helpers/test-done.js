import Ember from "ember";
import QUnit from "qunit";

var fauxjax = Ember.$.fauxjax;

var TestDone = Ember.Object.extend({
    testDoneCallback: function() {
        this._findAndLogIncorrectAndUnfired();
        this._findAndLogUnhandled();
    },
    _findAndLogIncorrectAndUnfired: function() {
        var self = this;
        fauxjax.unfired().forEach(function(unfired){
            var found = fauxjax.unhandled().filter(function(unhandled){
                return unfired.url === unhandled.url &&
                    unfired.type === unhandled.type;
            });
            if(found.length === 0) {
                self._logUnfiredRequests(unfired);
            } else {
                self._logIncorrectRequests({
                    unfired: unfired,
                    unhandled: found[0]
                });
            }
        });
    },
    _findAndLogUnhandled: function() {
        var self = this;
        fauxjax.unhandled().forEach(function(unhandled){
            var found = fauxjax.unfired().filter(function(unfired){
                return unfired.url === unhandled.url &&
                    unfired.type === unhandled.type;
            });
            if(found.length === 0) {
                self._logUnhandledRequests(unhandled);
            }
        });
    },
    _logUnfiredRequests: function(request) {
        this._createMessage(request, "FIRED");
        QUnit.assert.ok(false, "Overmocked requests for %@.".fmt(this.get("name")));
    },
    _logUnhandledRequests: function(request) {
        this._createMessage(request, "MOCKED");
        QUnit.assert.ok(false, "Unmocked requests for %@.".fmt(this.get("name")));
    },
    _logIncorrectRequests: function(request) {
        this._incorrectMessage(request.unfired, request.unhandled);
        QUnit.assert.ok(false, "Incorrectly mocked requests for %@.".fmt(this.get("name")));
    },
    _incorrectMessage: function(unfired, unhandled) {
        this._createMessage(unfired, "CORRECT");
        if(unfired.data && !unhandled.data || _.some(_.compact([unfired.data, unhandled.data])) && !_.isEqual(unhandled.data, unfired.data)) {
            this._logObjectData("Mocked data:", unfired.data);
            this._logObjectData("Real Request data:", unhandled.data);
        }
        if((unfired.contentType || unhandled.contentType) && !_.isEqual(unfired.contentType, unhandled.contentType)) {
            console.warn("Mocked Content Type: " + unfired.contentType);
            console.warn("Real Request Content Type: " + unhandled.contentType);
        }
        if(!_.isEqual(unfired.headers, unhandled.headers)) {
            this._logObjectData("Mocked headers:", unfired.headers);
            this._logObjectData("Real Request headers:", unhandled.headers);
        }
    },
    _logObjectData: function(name, data) {
        console.warn(name);
        if(typeof data === "string") {
            data = JSON.parse(data);
        }
        if(!data || Object.keys(data).length === 0) {
            console.warn("no data");
        }
        for(var key in data) {
            if(data.hasOwnProperty(key)) {
                console.warn(key + ": " + data[key]);
            }
        }
    },
    _createMessage: function(request, verb) {
        var testNameMessage = [
            this.get("name"),
            "in",
            this.get("module")
        ];
        console.warn(testNameMessage.join(" "));
        var message = [
            "Request:",
            request.type,
            "to",
            request.url,
            "not %@".fmt(verb)
        ];
        console.warn(message.join(" "));
    }
});

export default TestDone;
