# Noam [![Build Status](https://travis-ci.org/izuzak/noam.png)](https://travis-ci.org/izuzak/noam)

Noam is a JavaScript library for working with automata and formal grammars for regular and context-free languages.

Noam's name comes from [Noam Chomsky](http://en.wikipedia.org/wiki/Noam_Chomsky) and his [hierarchy of formal languages and grammars](http://en.wikipedia.org/wiki/Chomsky_hierarchy).

## Status

Pre-alpha.
Horrible performance, only functions for working with FSMs implemented.
Stay tuned.
See [TODO list](TODO.md).

## Web apps

* [Regular Expressions Gym](http://izuzak.github.com/noam/webapps/regex_simplifier/) - Slim your regexes one step at a time! Source is [here](https://github.com/izuzak/noam/tree/master/webapps/regex_simplifier).
* [FSM Simulator](http://ivanzuzak.info/noam/webapps/fsm_simulator/) - Visually simulate the operation of your DFAs, NFAs and eNFAs one input symbol at a time! Source is [here](https://github.com/izuzak/noam/tree/master/webapps/fsm_simulator).
* [FSM2Regex](http://ivanzuzak.info/noam/webapps/fsm2regex/) - Convert your FSMs to regexes and your regexes to FSMs! Source is [here](https://github.com/izuzak/noam/tree/master/webapps/fsm2regex).

## Install

If you just want to use noam (and not contribute to development), install using npm:

    npm install noam

To use noam in a browser, add a `<script>` link to the browser-based versions found in `lib/browser/`:

    <script src="http://izuzak.github.com/noam/lib/browser/noam.js"></script>

or minified version:

    <script src="http://izuzak.github.com/noam/lib/browser/noam.min.js"></script>

## Development

1. Fork and/or clone repo: `git clone https://github.com/izuzak/noam.git`
2. Change dir to noam: `cd noam`
3. Install dependencies: `npm install`
4. Make changes to noam sources (`./src`), tests (`./test`) or benchmarks (`./benchmarks`)
5. Build using grunt (validate -> lint -> concat -> test -> minify): `grunt` (on linux and osx), `grunt.cmd` (on windows)
6. (bonus points) Run `istanbul cover node_modules/jasmine-node/bin/jasmine-node test` to get code coverage reports in `./coverage`. Add more tests or change existing tests to improve coverage
7. Fix issues reported by tests and coverage reports, and then repeat 5) and 6)
8. Commit, push and make a pull request, or send a git patch by e-mail
9. E-mail me if you have questions (e-mail address is below)

## Credits

Noam is developed by [Ivan Zuzak](http://ivanzuzak.info) &lt;izuzak@gmail.com&gt; and [Ivan Budiselic](https://github.com/ibudiselic). Contributors: [Vedrana Jankovic](http://vedri.ca/).

Noam is built with many awesome open-source projects:
* [structure.js](https://github.com/ibudiselic/structure.js) - used for its JS hashtable implementation
* [cli-table](https://github.com/LearnBoost/cli-table) - used for drawing ascii tables in the command-line version of noam
* [jQuery](http://jquery.com/) - used for the FSM Web application playgrounds
* [NodeJS](http://nodejs.org/) - used for running the command-line version of noam
* [viz.js](https://github.com/mdaines/viz.js) - used for drawing FSM graphs in Web applications
* [Bootstrap](http://twitter.github.com/bootstrap/) - used for styles in regex simplification webapp
* [JsDiff](https://github.com/kpdecker/jsdiff) - used for diffing regexes in regex simplifier webapp
* [jasmine-node](https://github.com/mhevery/jasmine-node) and [grunt-jasmine-node](https://github.com/jasmine-contrib/grunt-jasmine-node) - used for unit testing
* [benchtable](https://github.com/izuzak/benchtable) and [benchmark.js](http://benchmarkjs.com/) - used for performance benchmarking
* [grunt-jsvalidate](https://github.com/ariya/grunt-jsvalidate) - used for JavaScript validation
* [grunt](http://gruntjs.com/) - used as the build tool for the project
* [JSHint](http://www.jshint.com/) - used for linting the noam lib
* [UglifyJS](https://github.com/mishoo/UglifyJS/) - used for minifying the noam lib
* [PhantomJS](http://phantomjs.org/index.html) - used for testing webapps
* [WD.js](https://github.com/admc/wd) - used for testing webapps
* [Istanbul](https://github.com/yahoo/istanbul) - used for code coverage

## License

Licensed under the [Apache 2.0 License](https://github.com/izuzak/noam/blob/master/LICENSE).

[![gaugestracking alpha](https://secure.gaug.es/track.gif?h[site_id]=5162c171613f5d6f68000001&h[resource]=http%3A%2F%2Fgithub.com%2Fizuzak%2Fnoam&h[title]=noam%20%28GitHub%29&h[unique]=1&h[unique_hour]=1&h[unique_day]=1&h[unique_month]=1&h[unique_year]=1 "ivanzuzak.info")](http://ivanzuzak.info/)
