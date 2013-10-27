# Prezento

Prezento is an open protocol proposition for HTML5 slide deck frameworks so they can be easily embedded and controlled on various webpages.

## Status & Roadmap

This project is still in progress, here's the roadmap and current status :

1. ✔ **Write protocol draft**
1. ✔ **Implement POC on various HTML5 slide deck frameworks**
1. ✔ **Implement POC shell demo**
1. ✔ **Write JavaScript helper library**
1. *(WIP) Request for comments and feedback from slide deck vendors and sharing websites*
1. Improve protocol and library
1. Freeze 1.0 version
1. Call for first implementations (slide deck frameworks and shells)
1. Release official 1.0 version

## Why this project ?

### Sharing websites

A lot of websites like [Speacker Deck](https://speakerdeck.com/), [Slideshare](http://www.slideshare.net) or [Parleys](http://parleys.com) allow people to upload and share slide decks. Because a large majority of people use famous desktop softwares for their slide decks, the common and often only accepted upload format on these websites is PDF.

We see more and more slide decks built with Web technologies, especially in tech conferences. They can have really advanced features like interactive demos, animations, multimedia... Depending on the framework, converting a slide deck to a PDF version can be very difficult. Even with a printable and decent PDF document, the result lacks all the cool interactive stuffs.

The sharing experience should not be truncated. Visitors of such websites should enjoy the contents the way they were presented during the event. If we want these websites to accept HTML5 slide decks uploads, we don't need a unique format, we just need a common language so they can interact with it (get the title, get the current slide, go to slide X...).

### Advanced modes

Sharing is not the only issue. Lots of frameworks provide some kind of advanced modes to interact with the slide deck :

* The presenter mode : A fullscreen display with the current slide, the next one and a clock and/or a stopwatch.
* The multiplexed or remote control mode : Some server synchronizes different devices (speaker and attendees) with the same slide deck.

There's no compatibility, theses modes only work for a given framework. They should become bleeding edge webapps that can interact with any kind of slide deck framework. If we want these webapps, we really need a common language to interact with HTML5 slide decks.

Prezento tries to address these issues by proposing a simple protocol (specified in the documentation below) and a JavaScript helper library to ease protocol implementation.

## Specifications & documentation

[Specs and docs are available here.](./DOCUMENTATION.md)

## Who uses this protocol ?

Since the current project status is very new, current implementations are only demos and POC.

### Shells

* Demo shell (just for reference and testing)

### HTML5 slide deck frameworks

* DZSlides (POC for demo shell) - [demo shell example](http://prezento.github.io/prezento/shells/demo/?url=/prezento/slides/dzslides)
* RevealJS (POC for demo shell) - [demo shell example](http://prezento.github.io/prezento/shells/demo/?url=/prezento/slides/reveal.js)
* Impress.js (POC for demo shell) - [demo shell example](http://prezento.github.io/prezento/shells/demo/?url=/prezento/slides/impress.js)
* Google IO (POC for demo shell, zoom not working) - [demo shell example](http://prezento.github.io/prezento/shells/demo/?url=/prezento/slides/io-2013-slides/template.html)
* Deck.js (POC for demo shell, zoom not working) - [demo shell example](http://prezento.github.io/prezento/shells/demo/?url=/prezento/slides/deck.js/introduction)

## Credits

* Hubert SABLONNIÈRE [@hsablonniere](https://twitter.com/hsablonniere)
