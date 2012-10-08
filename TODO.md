# TODO list

## Functionality

* conversion from FSM to regex
* regex minimization
* add Moore and Mealy machine support + minimization and Moore<->Mealy transformation functions
* add push-down automata support + transformation to CFG functions

## Refactoring and documentation

* unify printAscii and printHtml tables
* add more structured comments to functions (jsdoc?)
* write API documentation for current code
* write overview/list of implemented functionality
* add package.json

## Performance and testing

* refactor internal code to use more optimized data structures
* add performance testing

## Webapps and examples

* develop playground webapp for working with FSMs and grammars
  * defining languages
  * minimizing/transforming languages
  * composing languages
  * editing + instant refresh capability
  * console-based
* develop webapp for step-by-step simulation of the operation of FSMs and grammars
* develop examples for FSMs, grammars and regular expressions