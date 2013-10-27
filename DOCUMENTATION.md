# Prezento Documentation

1. [The protocol](#the-protocol)
  * [Metas](#metas)
  * [Data format](#data-format)
  * [Core and features](#core-and-features)
  * [Initialization](#initialization)
  * [Slide deck informations object](#slide-deck-informations-object)
  * [Cursor and step trigger](#cursor-and-step-trigger)
2. [Reference](#reference)
  * [Actions](#actions)
  * [Events](#events)
  * [Definitions](#definitions)
3. [The library](#the-library)
  * [Implementing prezento on a shell](#implementing-prezento-on-a-shell)
  * [Implementing prezento on a slide deck framework](#implementing-prezento-on-a-slide-deck-framework)

## 1. The protocol

Whatever the use case, it's always a matter of a webpage embedding an HTML5 slide deck in an iframe or opening one in a popup window and trying to interact with it. Prezento defines the concept of a "shell" to refer to the container webpage. The slide deck page is simply refered to as a "slide deck" ;-)

The interactions between both pages are handled by `postMessage`. Messages are either actions or events. The shell sends actions to the slide deck and the slide deck sends events to the shell.

![prezento protocol schema](https://docs.google.com/drawings/d/16h20r1EWOjjxUgRlFYTXXQsIwcZKM9orKqEsCEcqIDc/pub?w=858)

### 1.1 Metas

HTML5 slide deck documents must contain some prezento specific metas. It will be really important for search engines and sharing websites. Just add these two meta tag in the `<head>` :

```html
<meta name="prezento-capable" content="yes">
<meta name="prezento-vendor" content="myvendor">
```

Replace vendor with the HTML5 slide deck name. It should never change!

### 1.2 Data format

The [HTML5 Web Messaging spec](http://www.w3.org/TR/webmessaging/) says `postMessage` can transport any kind of JavaScript value (nested objects, arrays, strings, numbers, dates...). To keep things simple, a valid prezento message must be an array. The first item is always the name of the action or the event. The other items are the different parameters, they are optionnal.

Here is an example of an action sent with no parameters :

```
['init']
```

Here is an example of an event sent with one parameter :

```
['cursor', '4.2']
```

### 1.3 Core and features

HTML5 slide decks don't work the same way. Prezento defines two kinds of messages : core and feature. Core messages must be implemented. Feature messages are optionals. Their implementation depends on which features a given framework offers. Feature messages must be documented in this document in order to unify similar features like notes, overview, multimedia... over the different slide deck frameworks.

### 1.4 Initialization

When using `postMessage` between a webpage and an remote window (iframe or a popup), there's two important things :

* The webpage has to wait for the remote window to load before posting to it.
* The remote window needs to receive a message from the webpage before being able to post back to it.

Prezento defines an initialization process. The shell will use the `init` action and the slide deck will use the `ready` event.

Here's the valid prezento initialization process :

1. The shell loads the slide deck.
2. Once it's loaded, the shell sends the `init` action to the slide deck.
3. The slide deck receives the `init` action from the shell.
4. The slide deck sends the `ready` event to the shell with the `slideDeckInfos` object passed as first parameter.
5. The slide deck sends the `cursor` event to the shell with the first selected cursor.
6. The slide deck sends the `step` event to the shell with the first selected step.
7. The shell receives the `ready` event and use the `slideDeckInfos` object.
8. The shell receives the `cursor` and `step` events and use their values.

*[TODO interaction diagram]*

### 1.5 Slide deck informations object

When the slide deck is ready it must send some informations to the deck as a parameter to the `ready` event. These informations are presented as a key/value object call `slideDeckInfos`.

Here are details about what this object can and must contain :

Key | Type | Description | Mandatory
--- | --- | --- | ---
`title` | String | Title of the presentation.<br>Usually, it is the contents of the `<title>` tag. | Yes
`metas` | Object(String:String) | HTML contents metas with name as key and content as value.<br> It contains the two mandatory prezento metas (`prezento-capable` and `prezento-vendor`) and all other optional metas in the document like `author`, `description` etc... | Yes
`steps` | Array(String) | Contains all the cursors identified as important steps. | Yes
`features` | Array(String) | Contains all the prezento features the current presentation uses. If none, it must be an empty array. | Yes

Here's a full example :

```javascript
{
    title: 'reveal.js - The HTML Presentation Framework',
    metas: {
      'prezento-capable': 'yes',
      'prezento-vendor': 'reveal.js',
      author: 'Hakim El Hattab',
      description: 'A framework for easily creating beautiful presentations using HTML'
    },
    steps: ['0.0', '1.0', '2.0', '3.0', '4.0', '5.0'],
    features: ['overview', 'notes']
}
```

### 1.6 Cursor and step trigger

Once the slide deck is ready, the shell can send actions and the slide deck can send events.

Prezento only defines one mandatory behaviour for action/event exchanges, the cursor and step trigger. When a slide deck receives an action that modifies its current cursor (see definitions) it must send back a `cursor` event with the current cursor as first parameter and the `step` event with the current step as first parameter.

All core actions are concerned with this behaviour : `init`, `goTo`, `prev`, `next`, `first` and `last`.

## 2. Reference

### 2.1 Actions

Here are the details about core and feature actions. Remember that actions are sent by shells and received by slide decks.

Feature | Action | Arg | Description
--- | --- | --- | ---
Core | `init` | | Ask the slide deck to start the initialization process.
Core | `goTo` | `cursor` | Move slide deck to a given cursor.
Core | `prev` |  | Move slide deck to the previous cursor.
Core | `next` |  | Move slide deck to the next cursor.
Core | `first` |  | Move slide deck to the first cursor.
Core | `last` |  | Move slide deck to the last cursor.
Overview | `toggleOverview` |  | Toggle overview mode.<br> Only works with an overview enabled slide deck.
Multimedia | `toggleMultimedia` |  | Toggle multimedia element (audio, video, whatever...) on the current cursor.<br> Only works with a multimedia enabled slide deck.

### 2.2 Events

Here are the details about core and feature events. Remember that events are sent by slide decks and received by shells.

Feature | Event | Arg | Description
--- | --- | --- | ---
Core | `ready` | `slideDeckInfos` | Fired once the slide deck is ready and the `init` event has been received.<br> It provides various informations about the slide deck contents and framework features.
Core | `cursor` | `cursor` | Fired each time the slide deck cursor changes.<br> It provides the current cursor.
Core | `step` | `step` | Fired each time the slide deck step changes.<br> It provides the current step.
Notes | `notes` | `notes` | Fired each time the slide deck cursor changes.<br> It provides the notes for the current cursor.

### 2.3 Definitions

Here are some definitions used in the protocol documentation :

<dl>

<dt>Slide deck
<dd>A slide deck is sequential collections of slides that can be viewed one after another in a defined order.

<dt>Shell
<dd>A shell is a webpage that can embed and control a slide deck using the prezento protocol.

<dt>Message
<dd>A message consists of an action or event name and zero to many parameters. It must be passed via `postMessage` as an array.

<dt>Action
<dd>An action is a message sent from a shell to a slide deck.

<dt>Event
<dd>An event is a message sent from a slide deck to a shell.

<dt>Cursor
<dd>A cursor is a unique identifier for a given slide deck state. A cursor can be composed of a slide number, a fragment (in-slide number), a second dimension slide number... Each framework can have its own way to identify a cursor, it does not prevent the shell to use them. Ex: "42", "4.7", "3.1.2", "my-super-slide"...

<dt>Step
<dd>A step is an important cursor. Steps can be used to know current progress in the presentation (4 of 12 for example). Usually, steps identify slide cursor (as opposed to subslide or fragment cursors).

<dt>Slide
<dd>A slide is composed of visual contents that can appear at once or incrementally (fragments). A combination of ordered slides compose a slide deck that can be used during a presentation.

<dt>Fragment
<dd>A fragment is a division of a slide. In most cases it refers to bullet points that appear one by one.

<dt>Multimedia
<dd>Some slide decks contain multimedia elements. It can be audio, video, animations... Depending on the vendor, these multimedia elements can be auto started or stopped as the slide appears or disappears. They can also be arbitrarily started or stopped.

<dt>Notes
<dd>Notes are additionnal text not displayed on the slide but that can be used by the author during the presentation or by people viewing the slides afterwards.

</dl>

## 3. The library

The `prezento.js` library is provided to help slide deck and shell developers to implement the protocol. Its usage is not mandatory to comply to the protocol but it most cases it will help.

*[TODO diagram of the two page and library usage]*

### 3.1 Implementing prezento on a shell

Let's use the presentation sharing website example. A page contains :

* An iframe pointing to the HTML5 slide deck
* Informations about the slide deck : current step, total number or steps...
* Different buttons to interact with the slide deck : next, previous...

#### 3.1.1 Initialization

To interact with the slide deck the shell needs to create a slide deck proxy using `prezento.createSlideDeckProxy(initArg)`. This creation will automatically send the `init` action once the contents are loaded.

`initArg` can have 3 types :

##### `initArg` is a CSS selector pointing to an iframe DOM element

```javascript
var slideDeckProxy = prezento.createSlideDeckProxy('iframe');
```

##### `initArg` is an iframe DOM element

```javascript
var iframe = document.getElementById('#slide-deck');
var slideDeckProxy = prezento.createSlideDeckProxy(iframe);
```

##### `initArg` is a window object with a `postMessage` function

```javascript
var popup = window.open('http://domain.tld/my-slide-deck');
var slideDeckProxy = prezento.createSlideDeckProxy(popup);
```

#### 3.1.2 Listening for events

Once we have a `slideDeckProxy` object, we must add listeners to the core events `ready`, `cursor` and `step` with the `configListeners` function with a config object. This function returns the `slideDeckProxy` instance so calls can be chained. Parameters are automatically extracted from the message by the library and passed to the listener as function arguments.

```javascript
var slideDeckProxy = prezento.createSlideDeckProxy(...)

  .configListeners({

    ready: function (slideDeckInfos) {
      // use the slideDeckInfos object to update your display...
    },

    cursor: function (cursor) {
      // update current cursor display...
    },

    step: function (step) {
      // update current step display...
    }
  });
```

#### 3.1.3 Sending actions

Sending actions to the slide deck can be done using `slideDeckProxy` object corresponding methods. Parameters can be passed as arguments to theses function when needed. The library automatically formats the message as required by the protocol. We only need to wire them to the shell interface buttons and controls.

All core and feature actions are available as direct methods with the same name :

```javascript
var nextButton = document.querySelector('.next-button'),
    goTo42Button = document.querySelector('.go-to-42');

nextButton.addEventListener('click', function () {
  slideDeckProxy.next();
}, false);

goTo42Button.addEventListener('click', function () {
  slideDeckProxy.goTo(42);
}, false);
```

### 3.2 Implementing prezento on a slide deck framework

#### 3.2.1 Initialization

To interact with the shell the slide deck needs to create a shell proxy using `prezento.createShellProxy(slideDeckInfos)`.

The library does some stuffs automatically :

* complete `slideDeckInfos` object with `title` and `metas` properties
* listen to the `init` action and send `ready` event with appropriate `slideDeckInfos`

Because `title` and `metas` are set by the library, you only have to provide the `steps` and `features` properties :

```javascript
var shellProxy = prezento.createShellProxy({
  steps: ['0.0', '1.0', '2.0', '3.0', '4.0', '5.0'],
  features: ['overview', 'notes']
});
```

#### 3.2.2 Providing event arguments getters

To comply to the protocol, the library automatically sends `cursor` and `step` event on when receiving a core action. In order to send the appropriate informations. It needs a way to get it. That's why you'll need to configure some getters :

```javascript
var shellProxy = prezento.createShellProxy(...)

  .configGetters({

    cursor: function () {
      // return current cursor
    },

    step: function () {
      // return current step
    }
  });
```

If the slide deck framework supports the notes feature. It can also set the getter for notes this way. The library will automatically send the `notes` event when receiving a core action.

#### 3.2.3 Listening for actions

Because a `shellProxy` will receive actions, we must add listeners to modify the slide deck state according to the specification.

```javascript
var slideDeckProxy = prezento.createSlideDeckProxy(...)

  .configListeners({

    init: function () {
      // this listener is not mandatory
    },
    goTo: function (cursor) {
      // ...
    },
    prev: function () {
      // ...
    },
    next: function () {
     // ...
    },
    first: function () {
      // ...
    },
    last: function () {
     // ...
    }
  });
```

#### 3.2.4 Sending events

The library should send all the necessary events automatically but if the slide deck state changes by itself, the shell must be notified.

Sending events to the shell can be done using `shellProxy` object corresponding methods. Parameters can be passed as arguments to theses function when needed. The library automatically formats the message as required by the protocol. We only need to wire them to the slide deck code.

All core and feature events are available as direct methods with the name `notify[EventName]` :

```javascript

// Ignite talks timed example
setTimeout(function () {

  // Slide deck specific code to go to next slide
  // ...

  // Notify shell using shellProxy.notify*() methods :
  shellProxy.notifyCursor(currentCursor);
  shellProxy.notifyStep(currentStep);

}, 15000);
```
