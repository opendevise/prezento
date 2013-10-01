# Prezento Documentation

## The protocol

Whatever the use case, it's always a matter of a webpage embedding an HTML5 slide deck in an iframe and trying to interact with it. Prezento defines the concept of a "shell" to refer to the container webpage. The slide deck page is simply refered to as a "slide deck" ;-)

The interactions between both pages are handled by `postMessage`. Messages are either actions or events. The shell sends actions to the slide deck and the slide deck sends events to the shell.

![prezento protocol schema](https://docs.google.com/drawings/d/16h20r1EWOjjxUgRlFYTXXQsIwcZKM9orKqEsCEcqIDc/pub?w=858)

### Metas

HTML5 slide deck documents must have two prezento specific metas. They are really important for search engines and various sharing websites :

 * `<meta name="prezento-capable" content="yes">`
 * `<meta name="prezento-vendor" content="myvendor">`

### Data format

The [HTML5 Web Messaging spec](http://www.w3.org/TR/webmessaging/) says `postMessage` can transport any kind of JavaScript value (nested objects, arrays, strings, numbers, dates...). To keep things simple, a valid prezento message must be an array. The first item is always the name of the action or the event. The other items are the different parameters, they are optionnal.

### Core and features

HTML5 slide deck don't work the same way. Prezento defines two kinds of messages : core and feature. Core messages must be implemented. Feature messages implementation depends on which feature a given framework offers. Feature messages must be documented in this document in order to unify similar features (like notes or overview mode).

### Initialization

When using `postMessage` between a webpage and an iframe, there's two important things :

* The webpage has to wait for the iframe to load before posting to it.
* The iframe needs to receive a message from the webpage before being able to post back to it.

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

### Slide deck informations object

[TODO]

### Cursor and step trigger

Once the slide deck is ready, the shell can send actions and the slide deck can send events.

Prezento only defines one mandatory behaviour for action/event exchanges, the cursor trigger. When a slide deck receives an action that modifies its current cursor (see definitions) it must send back a `cursor` event with the current cursor as first parameter.

All core actions except `init` are concerned with this behaviour : `goTo`, `prev`, `next`, `first` and `last`.

### Actions

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

### Events

Here are the details about core and feature events. Remember that events are sent by slide decks and received by shells.

Feature | Event | Arg | Description
--- | --- | --- | ---
Core | `ready` | `slideDeckInfos` | Fired once the slide deck is ready and the `init` event has been received.<br> It provides various informations about the slide deck contents and framework features.
Core | `cursor` | `cursor` | Fired each time the slide deck cursor changes.<br> It provides the current cursor.
Core | `step` | `step` | Fired each time the slide deck step changes.<br> It provides the current step.
Notes | `notes` | `notes` | Fired each time the slide deck cursor changes.<br> It provides the notes for the current cursor.

### Definitions

Here are some definitions used in the protocol documentation :

<dl>

<dt>Slide deck
<dd>A slide deck is sequential collections of slides that can be viewed one after another in a defined order.

<dt>Shell
<dd>A shell is a webpage that can embed and control a slide deck using the prezento protocol or directly the library.

<dt>Message
<dd>It consist of an action or event name and zero to many parameters. It must be passed via `postMessage` as an array.

<dt>Action
<dd>It is a message sent from a shell to a slide deck.

<dt>Event
<dd>It is a message sent from a slide deck to a shell.

<dt>Cursor
<dd>A cursor is a unique identifier for a given slide deck state. A cursor can be composed of a slide number, a fragment (in-slide number), a second dimension slide number... Each framework can have its own way to identify a cursor, it does not prevent the shell to use them. Ex: "42", "4.7", "3.1.2", "my-super-slide"...

<dt>Step
<dd>Cursors represents all the positions in a slide deck and steps only the important ones. Steps allow shell to know about progression inside of a slide deck.<br> In most cases, steps represents only slide cursors (as opposed to fragements cursors and other kind of slide division).

<dt>Fragment
<dd>A fragment is a division of a slide. In most cases it refers to bullet points that appear one by one.

<dt>Multimedia
<dd>Some slide decks contain multimedia elements. It can be audio, video, animations... Depending on the vendor, these multimedia elements can be auto started or stopped as the slide appears or disappears. They can also be arbitrarily started or stopped.

<dt>Notes
<dd>Notes are additionnal text not displayed on the slide but that can be used by the author during the presentation or by people viewing the slides afterwards.

</dl>

## The library

The `prezento.js` is provided to help shell and slide deck developers to implement the protocol. Its usage is not mandatory to comply to the protocol but it most cases it will help.

### Implementing prezento on a shell

Let's use the presentation sharing website example. A slide deck page contains :

* An iframe pointing to the HTML5 slide deck
* Informations about the slide deck : current slide, total number or slides...
* Different buttons to interact with the slide deck : next, previous...

#### Initialization

To interact with the slide deck the shell needs to create a slide deck proxy using `prezento.createSlideDeckProxy(initArg)`. `initArg` can be a CSS selector, an iframe DOM element or an object with the `postMessage` function like a contentWindow. This creation will automatically send the `init` action once the iframe is loaded.

```javascript
var slideDeck = prezento.createSlideDeckProxy('iframe');
```

#### Listening for events

Once we have a `slideDeckProxy` object, we must add listeners to the core events `ready` and `cursor` with the `on` function. Calls can be chained. Parameters are automatically extracted from the message by the library and passed to the listener as function arguments.

```javascript
var slideDeck = prezento.createSlideDeckProxy('iframe')

  .on('ready', function (slideDeckInfos) {
    // use the slideDeckInfos object to update your display...
  })

  .on('cursor', function (cursor) {
    // update current cursor display...
  })

  .on('step', function (step) {
    // update current step display...
  });
```

#### Sending actions

Sending actions to the slide deck is very easy. Direct functions are exposed on the `slideDeckProxy` object. Parameters can be passed as arguments to theses function when needed. The library automatically formats the message as required by the protocol. We only need to wire them to the shell interface buttons and controls.

```javascript
var nextButton = document.querySelector('.next-button'),
    goTo42Button = document.querySelector('.go-to-42');

nextButton.addEventListener('click', function () {
  slideDeck.next();
}, false);

goTo42Button.addEventListener('click', function () {
  slideDeck.goTo(42);
}, false);
```

### Implementing prezento on a slide deck framework

[TODO]
