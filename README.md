# BugWorld

## External dependencies

This project only uses [jasmine](https://jasmine.github.io/index.html) testing framework to have unit and integration tests. Its sources are already included into this project so there is no additional setup needed.

## Development process

### Devtools

We recommend using a live-reload solution to have the webpages automatically updated on every change to the source files. For example, you can use [live-server](https://www.npmjs.com/package/live-server) tool which can be installed via [npm](https://nodejs.org/en/download) package manager.

### Testing

As mentioned above, we use [jasmine](https://jasmine.github.io/index.html) for testing. To see the tests execution results open [tests.html](html/tests.html). If you use the live-reload tool described above, simply visit [127.0.0.1:8080/tests.html](http://127.0.0.1:8080/tests.html).

We prefer writing unit-tests in the same file where the tested entities are defined. We do this for two reasons:
- Firstly, it allows to test implementation details which are not exposed to other modules. 
- Secondly, it emphasizes that tests are a part of documentation.

### File structure

In our project, we view files as modules, which means that related components should be grouped together within a single file. This differs from the approach commonly used in Java projects, where each class is typically defined in a separate file. By organizing code in this way, we can more easily manage dependencies and promote better cohesion within our modules.

For now, our project is split in the following modules:
- [asm.js](src/asm.js): everything related to assembly language.
- [model.js](src/model.js): everything related to the description of the world and its rules: `World`, `Bug`, `Cell`, `Grid` and other classes and enumerations.

## Design choices that diverge from the specification

Besides some minor differences like different method names in some places, there are some more significant changes in design.

### Changes in the [model.js](src/model.js)

First of all, the actual class that carries the data for a particular bug is not `Bug` but [BugData](src/model.js#L352) which is not a part of public API. The actual [Bug](src/model.js#L364) class is rather a projection of the world from the point of view of a single bug. It allows for modifying the world as though these are actions of the bug but maintains all the invariants: a bug cannot carry more than one unit of food, two bugs cannot be in the same cell, a bug cannot suddenly disapper, and so on.

Secondly, publicly exposed [Cell](src/model.js#L77) is just an enumeration of all possible types of which a cell can be. It doesn't allow for modifications, unlike the specification, because this would allow to construct a world in an inconsistent state. Cells that can be modified are defined by [CellMut](src/model.js#L84) class which is not exported but used internally by the [Bug](src/model.js#L364) and [World](src/model.js#L448) classes.

Last but not least, we defined an intermediate class [Grid](src/model.js#L289) to ease the construction of the world and to ensure that the world is always in a consistent state.

See [tests](src/model.js#L580) for the examples of use.

## Changelog

### Sprint 1. Pair 45.
- Implemented all the UI pages for the bug world
- Basic frontend of the application
- Backend functionalities are to be done in the future scripts

### Sprint 2. Pair 5

#### Semen Panenkov:
##### Copied from the previous sprint
- Implemented always everything in [model.js](src/model.js) and partially covered it with tests. Things that are left are marked with a `TODO` comment.
- Set up testing infrastructure.

#### This sprint
- Simple grid drawing using `canvas`.

#### Valerii Ovchinnikov
- Refactoring asm.js 
- Understand previous code
- Checked bug assembler grammar (tickBrains)  
- Change GUI and worked with map presentation (little)
# Bug World
# BugWorld
