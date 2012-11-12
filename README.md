# Noam

Noam is a JavaScript library for working with automata and formal grammars for regular and context-free languages.

Noam's name comes from [Noam Chomsky](http://en.wikipedia.org/wiki/Noam_Chomsky) and his [hierarchy of formal languages and grammars](http://en.wikipedia.org/wiki/Chomsky_hierarchy).

## Status

Pre-alpha. 
Horrible performance, only functions for working with FSMs implemented.
Stay tuned.
See [TODO list](https://github.com/izuzak/noam/blob/master/TODO.md).

## Web apps

* [Regular Expressions Gym](https://github.com/izuzak/noam/blob/master/webapps/regex_play.html) - Slim your regexes one step at a time!

## Development

1. Clone repo: `git clone https://github.com/izuzak/noam.git`
2. Change dir to noam: `cd noam`
3. Install dependencies: 
  * `npm install cli-table benchtable grunt-jasmine-node`
  * `npm install -g jasmine-node grunt`
4. Make changes to noam sources (`./src`), tests (`./test`) or benchmarks (`./benchmarks)
5. Build using grunt (builds lib, lints, tests and minifies): `grunt` (on linux), `grunt.cmd` (on windows)
6. Fix issues reported in 5)
7. Commit and make pull request

## Credits

Noam is developed by [Ivan Zuzak](http://ivanzuzak.info) and [Ivan Budiselic](https://github.com/ibudiselic). Contributors: [Vedrana Jankovic](http://vedri.ca/).

Noam is built with many open-source projects:
* [cli-table](https://github.com/LearnBoost/cli-table) - used for drawing ascii tables in the command-line version of noam
* [jQuery](http://jquery.com/) - used for the FSM Web application playgrounds
* [NodeJS](http://nodejs.org/) - used for running the command-line version of noam
* [viz.js](https://github.com/mdaines/viz.js) - used for drawing FSM graphs in Web applications
* [jasmine-node](https://github.com/mhevery/jasmine-node) - used for unit testing

## License

Licensed under the [Apache 2.0 License](https://github.com/izuzak/noam/blob/master/LICENSE.md).