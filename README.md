# Noam

Noam is a JavaScript library for working with automata and formal grammars for regular and context-free languages.

Noam's name comes from [Noam Chomsky](http://en.wikipedia.org/wiki/Noam_Chomsky) and his [hierarchy of formal languages and grammars](http://en.wikipedia.org/wiki/Chomsky_hierarchy).

## Status

Pre-alpha.
Horrible performance, only functions for working with FSMs implemented.
Stay tuned.
See [TODO list](https://github.com/izuzak/noam/blob/master/TODO.md).

## Web apps

* [Regular Expressions Gym](http://izuzak.github.com/noam/webapps/regex_play.html) - Slim your regexes one step at a time! Source is [here](https://github.com/izuzak/noam/blob/master/webapps/regex_play.html).

## Development

1. Fork and/or clone repo: `git clone https://github.com/izuzak/noam.git`
2. Change dir to noam: `cd noam`
3. Install dependencies:
  * `npm install cli-table benchtable grunt-jasmine-node`
  * `npm install -g jasmine-node grunt`
4. Make changes to noam sources (`./src`), tests (`./test`) or benchmarks (`./benchmarks`)
5. Build using grunt (builds lib, lints, tests and minifies): `grunt` (on linux), `grunt.cmd` (on windows)
6. Fix issues reported in 5)
7. Commit, push and make a pull request, or send a git patch by e-mail
8. E-mail me if you have questions (e-mail address is below)

## Credits

Noam is developed by [Ivan Zuzak](http://ivanzuzak.info) &lt;izuzak@gmail.com&gt; and [Ivan Budiselic](https://github.com/ibudiselic). Contributors: [Vedrana Jankovic](http://vedri.ca/).

Noam is built with many open-source projects:
* [cli-table](https://github.com/LearnBoost/cli-table) - used for drawing ascii tables in the command-line version of noam
* [jQuery](http://jquery.com/) - used for the FSM Web application playgrounds
* [NodeJS](http://nodejs.org/) - used for running the command-line version of noam
* [viz.js](https://github.com/mdaines/viz.js) - used for drawing FSM graphs in Web applications
* [Bootstrap](http://twitter.github.com/bootstrap/) - used for styles in regex simplification webapp
* [jasmine-node](https://github.com/mhevery/jasmine-node) - used for unit testing
* [benchtable](https://github.com/izuzak/benchtable) and [benchmark.js](http://benchmarkjs.com/) - used for performance benchmarking
* [grunt](http://gruntjs.com/) - used as the build tool for the project
* [JSHint](http://www.jshint.com/) - used for linting the noam lib
* [UglifyJS](https://github.com/mishoo/UglifyJS/) - used for minifying the noam lib

## License

Licensed under the [Apache 2.0 License](https://github.com/izuzak/noam/blob/master/LICENSE.md).
