# TODO list

## Functionality

* use isEquals from underscore or lodash
* upgrade object equivalence function so that String==String String==string string==string
  * also upgrade hashtable's hash function to support this
* update noam.util.areEquivalent to be foolproof (e.g. use QUnit implementation or similar)
* add noam.re.tree/array/string.areEquivalent, isSubset, intersection, etc etc
* extend HashTable with prototypes:
    * containsAllKeys, containsAnyKey, hasEqualSetOfKeys, containsSetOfKeys, union
    * clone method
    * put, get, remove for multiple keys
* add regex simplification patterns that do not simplify but make the regex more "nice"
  * if sub(alfa, beta*) && sub(beta, alfa) => % + alfa beta* == beta*
  * if sub(beta, alfa*) && sub(alfa, beta) => % + alfa* beta == alfa*
  * ab+ac => a(b+c)
  * a*a -> aa*, (ab)*a -> a(ba)* (push star to the right)
  * (L1L2)* => (L1+L2)* if both L1 and L2 can generate $ (favor choice over concats)
* add functions to compute regex length - alphabetic and reverse polish notation length
* improve hashtable to ignore certain properties of objects (e.g. ignore __startIndex property)
* add Moore and Mealy machine support + minimization and Moore<->Mealy transformation functions
* add push-down automata support + transformation to CFG functions
* grammar-related functions:
  * printHtml
  * isRegular (not possible in general, http://members.fortunecity.com/boroday/Automatatools.html)
  * removeDeadSymbols
  * removeUnreachableSymbols
  * removeUselessSymbols
  * removeEpsilonProductions
  * removeUnitProductions
  * chomskyForm
  * greibachForm
  * tofsm
  * llgToRlg
  * rlgToLlg
  * isAmbiguous (not possible in general)
  * reverse
  * isGenerativeTreeValidForGrammar
  * topda
  * generativeTree for string
  * union
  * concatenation
  * kleene
  * parseBnf
  * parseAbnf
  * parseEbnf

## Refactoring and documentation

* refactor noam submodules (fsm, re) to classes
* refactor regex tests to use re.string as input and output, not re.array (for clarity)
* refactor regex tests to test a single regex simplification pattern, not the whole process (because there are multiple ways to simplify a regex, so errors may not be detected)
* unify printAscii and printHtml tables
* add more structured comments to functions (jsdoc?)
* write API documentation for current code
* write overview/list of implemented functionality
* add similar and related projects list:
  * http://code.google.com/p/fsmjs/
  * https://github.com/jakesgordon/javascript-state-machine/
  * https://github.com/fschaefer/Stately.js
  * https://github.com/mdaines/grammophone
  * http://smlweb.cpsc.ucalgary.ca/

## Performance and testing

* precompute what can be precomputed (e.g. epsilon closure)
* random string generation for FSM is very slow non-trivial FSMs
* in webapps - run noam inside a web worker so that noam doesn't block the UI
* make specific benchmarks e.g. benchmarking the quality of regex simplification by regex length
* make the new HashTable datastructure store the hash of an object into a "hidden" property of the object so that the HT doesn't have to recompute the hash again
  * this will improve the performance of the HT, but will add more possibility of failure since it will be possible that the users of the HT change the object after the hash is computer and stored, as well as to change the value of the stored hash
* add profiling capability
* refactor internal code to use more optimized data structures
* add performance testing

## Webapps and examples

* fsm simulation
  * support zooming and panning for the displayed FSM (similar to google maps)
    * use existing libs:
      * https://code.google.com/p/svgpan/
      * https://github.com/talos/jquery-svgpan
      * http://www.petercollingridge.co.uk/interactive-svg-components/pan-and-zoom-control
      * http://www.petercollingridge.co.uk/book/export/html/437
      * http://polymaps.org/
  * colorize next states or transitions so that it is visible which transitions will be made
  * tell the user if the currently read string is acceptable or not by the fsm
* regex minification
  * improve coloring of regex parts:
    * by making the simplification functions return the substituted strings
    * by "marking" the subtrees that were changed, deleted, added or used for the transformation as a precondition
* develop playground webapp for working with FSMs and grammars
  * defining languages
  * minimizing/transforming languages
  * composing languages
  * editing + instant refresh capability
  * console-based
* playground app
  * stretch UI over whole window (remove fuzzy border)
  * put graph rendering into background worker + re-render only when typing stops for 1-2s
  * image export for graphs
  * develop simple language for defining FSMs
* develop webapp for step-by-step simulation of grammars
* develop examples for FSMs, grammars and regular expressions
