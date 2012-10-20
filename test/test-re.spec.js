describe("regular expressions", function() {
  var noamRe = require('../src/noam.js').re;
  var noamFsm = require('../src/noam.js').fsm;
  var noamUtil = require('../src/noam.js').util;
  
  describe("tree representation API", function() {

    var literal_a = noamRe.tree.makeLit("a");
    var literal_b = noamRe.tree.makeLit("b");
    var a_or_b = noamRe.tree.makeAlt([literal_a, literal_b]);
    var a_or_b_star = noamRe.tree.makeKStar(a_or_b);
    var a_before_a_or_b_star = noamRe.tree.makeSeq([literal_a, a_or_b_star]);

    describe("makeEps", function() {
      it("returns a tree representing the empty string expression", function() {
        expect(noamRe.tree.makeEps().tag).toEqual(noamRe.tree.tags.EPS);
      });
    });

    describe("makeLit", function() {
      it("returns a tree representing a literal", function() {
        expect(noamRe.tree.makeLit("a").tag).toEqual(noamRe.tree.tags.LIT);
      });
    });

    describe("makeKStar", function() {
      it("returns a tree representing the Kleene star operator around an expression", function() {
        expect(noamRe.tree.makeKStar(literal_a).tag).toEqual(noamRe.tree.tags.KSTAR);
      });
    });

    describe("makeSeq", function() {
      it("returns a tree representing the concatenation of the elements of its parameter", function() {
        expect(noamRe.tree.makeSeq([literal_a, literal_b]).tag).toEqual(noamRe.tree.tags.SEQ);
      });

      it("represents the empty language if passed an empty array", function() {
        var regex = noamRe.tree.makeSeq([]);
        var automaton = noamRe.tree.toAutomaton(regex);
        expect(noamFsm.isLanguageNonEmpty(automaton)).toBeFalsy();
      });
    });

    describe("makeAlt", function() {
      it("returns a tree representing the choice between the elements of its parameter", function() {
        expect(noamRe.tree.makeAlt([literal_a, literal_b]).tag).toEqual(noamRe.tree.tags.ALT);
      });

      it("represents the empty language if passed an empty array", function() {
        var regex = noamRe.tree.makeAlt([]);
        var automaton = noamRe.tree.toAutomaton(regex);
        expect(noamFsm.isLanguageNonEmpty(automaton)).toBeFalsy();
      });
    });


    describe("toAutomaton", function() {
      it("creates and returns an automaton accepting the language of the regular expression", function() {
        var eps = noamRe.tree.makeEps();
        var automaton = noamRe.tree.toAutomaton(eps);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeFalsy();
      });

      it("handles alteration in the regular expression", function() {
        var automaton = noamRe.tree.toAutomaton(a_or_b);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeFalsy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["b"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeFalsy();
      });

      it("handles sequencing in the regular expression", function() {
        var a_before_b = noamRe.tree.makeSeq([literal_a, literal_b]);
        var automaton = noamRe.tree.toAutomaton(a_before_b);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeFalsy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeFalsy();
        expect(noamFsm.isStringInLanguage(automaton, ["b"])).toBeFalsy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeTruthy();
      });

      it("handles the Kleene star operator in the regular expression", function() {
        var aStar = noamRe.tree.makeKStar(literal_a);
        var automaton = noamRe.tree.toAutomaton(aStar);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a", "a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a", "b"])).toBeFalsy();
      });

      it("handles any combination of the above", function() {
        var automaton = noamRe.tree.toAutomaton(a_before_a_or_b_star);
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "a", "b", "a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["b", "a", "b", "a"])).toBeFalsy();
      });
    });

    describe("toArray", function() {
      it("converts from the tree representation to the array representation", function() {
        var arr;
        arr = noamRe.tree.toArray(noamRe.tree.makeEps());
        expect(arr.length === 1);
        expect(arr[0] === noamRe.array.specials.EPS);

        arr = noamRe.tree.toArray(literal_a);
        expect(arr.length === 1);
        expect(arr[0] === "a");

        arr = noamRe.tree.toArray(a_or_b);
        expect(arr.length === 3);
        expect(arr[0] === "a");
        expect(arr[1] === noamRe.array.specials.ALT);
        expect(arr[2] === "b");

        arr = noamRe.tree.toArray(noamRe.tree.makeSeq([literal_a, literal_b]));
        expect(arr.length === 2);
        expect(arr[0] === "a");
        expect(arr[1] === "b");

        arr = noamRe.tree.toArray(noamRe.tree.makeKStar(literal_a));
        expect(arr.length === 2);
        expect(arr[0] === "a");
        expect(arr[1] === noamRe.array.specials.KSTAR);
      });

      it("adds perentheses when necessary", function() {
        var arr;
        // (a+b)*
        arr = noamRe.tree.toArray(a_or_b_star);
        expect(arr.length === 6);
        expect(arr[0] === noamRe.array.specials.LEFT_PAREN);
        expect(arr[1] === "a");
        expect(arr[2] === noamRe.array.specials.ALT);
        expect(arr[3] === "b");
        expect(arr[4] === noamRe.array.specials.RIGHT_PAREN);
        expect(arr[5] === noamRe.array.specials.KSTAR);

        // a(a+b)*
        arr = noamRe.tree.toArray(a_before_a_or_b_star);
        expect(arr.length === 7);
        expect(arr[0] === "a");

        // (a+b)b
        arr = noamRe.tree.toArray(noamRe.tree.makeSeq([a_or_b, literal_b]));
        expect(arr.length == 5);
        expect(arr[0] === noamRe.array.specials.LEFT_PAREN);
        expect(arr[1] === "a");
        expect(arr[2] === noamRe.array.specials.ALT);
        expect(arr[3] === "b");
        expect(arr[4] === noamRe.array.specials.RIGHT_PAREN);
        expect(arr[5] === "b");

        // ab+b
        arr = noamRe.tree.toArray(noamRe.tree.makeAlt([
            noamRe.tree.makeSeq([literal_a, literal_b]),
            literal_b]));
        expect(arr.length == 4);
        expect(arr[0] === "a");
        expect(arr[2] === "b");
        expect(arr[3] === noamRe.array.specials.ALT);
        expect(arr[4] === "b");
      });

      it("preserves parentheses that ignore associativity", function() {
        var arr;
        // (a+b)+b
        arr = noamRe.tree.toArray(noamRe.tree.makeAlt([a_or_b, literal_b]));
        expect(arr.length === 7);
        expect(arr[0] === noamRe.array.specials.LEFT_PAREN);
        expect(arr[1] === "a");
        expect(arr[2] === noamRe.array.specials.ALT);
        expect(arr[3] === "b");
        expect(arr[4] === noamRe.array.specials.RIGHT_PAREN);
        expect(arr[5] === noamRe.array.specials.ALT);
        expect(arr[6] === "b");
      });
    });

  });

  describe("array representation API", function() {
    var specials = noamRe.array.specials; // shortcut

    describe("specials", function() {
      it("holds distinct constants for the alteration operator, the Kleene star," +
         " parentheses and epsilon", function() {
        expect(specials.ALT !== specials.KSTAR).toBeTruthy()
        expect(specials.KSTAR !== specials.LEFT_PAREN).toBeTruthy()
        expect(specials.LEFT_PAREN !== specials.RIGHT_PAREN).toBeTruthy()
        expect(specials.RIGHT_PAREN !== specials.EPS).toBeTruthy()
      });
    });

    describe("toTree", function() {
      it("converts the regex to a tree that can then be manipulated", function() {
        var a_or_b = noamRe.array.toTree(["a", specials.ALT, "b"]);
        var a_or_b_star = noamRe.tree.makeKStar(a_or_b);
        var automaton = noamRe.tree.toAutomaton(a_or_b_star);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b", "b"])).toBeTruthy();
      });
    });

    describe("toString", function() {
      it("converts the regex to a string representation if all the symbols are" +
          " single character strings", function() {
        expect(noamRe.array.toString(["a"]) === "a");
        expect(noamRe.array.toString(["a", "b"]) === "ab");
        expect(noamRe.array.toString(["a", specials.ALT, "b"]) === "a+b");
        expect(noamRe.array.toString(["a", specials.KSTAR]) === "a*");
        expect(noamRe.array.toString([specials.LEFT_PAREN, "a",
            specials.RIGHT_PAREN]) === "(a)");
      });

      it("throws if the array contains other kinds of symbols", function() {
        expect(function() { noamRe.array.toString(["a", "b", "ab"]); }).toThrow();
        expect(function() { noamRe.array.toString(["a", {}, "b"]); }).toThrow();
        expect(function() { noamRe.array.toString(["a", [1, 2], "b"]); }).toThrow();
        expect(function() { noamRe.array.toString(["a", 3]); }).toThrow();
        expect(function() { noamRe.array.toString([1, "b"]); }).toThrow();
      });

      it("escapes operator characters in string notation", function() {
        expect(noamRe.array.toString(["(", "+", "$", ")", "\\"]) === "\\(\\+\\$\\)\\\\");
      });
    });

    describe("toAutomaton", function() {
      // Helper that converts the array representation to the tree representation
      // using toAutomaton and then tests if the @a symbolArray is in the specified
      // language.
      function inRegexLanguage(regexArray, symbolArray) {
        var automaton = noamRe.array.toAutomaton(regexArray);
        return noamFsm.isStringInLanguage(automaton, symbolArray);
      }

      it("works for the empty language", function() {
        var regexTree = noamRe.array.toTree([]);
        var automaton = noamRe.tree.toAutomaton(regexTree);
        expect(noamFsm.isLanguageNonEmpty(automaton)).toBeFalsy();
      });

      it("works for epsilon", function() {
        expect(inRegexLanguage([specials.EPS], [])).toBeTruthy();
      });

      it("works for a single literal", function() {
        var regex = ["a"];
        expect(inRegexLanguage(regex, [])).toBeFalsy();
        expect(inRegexLanguage(regex, ["a"])).toBeTruthy();
      });

      it("works for a Kleene starred literal", function() {
        var regex = ["a", specials.KSTAR];
        expect(inRegexLanguage(regex, [])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a", "a"])).toBeTruthy();
      });

      it("works for concatenation", function() {
        var regex = ["a", "b", "c"];
        expect(inRegexLanguage(regex, [])).toBeFalsy();
        expect(inRegexLanguage(regex, ["a"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["a", "b"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["a", "b", "c"])).toBeTruthy();
      });

      it("assigns operator priority to parentheses > Kleene star > concatenation > alteration", function() {
        var regex = ["a", "b", specials.KSTAR, 
            specials.ALT,
            specials.LEFT_PAREN, "c", "d", specials.RIGHT_PAREN, specials.KSTAR]; // ab* + (cd)*
        expect(inRegexLanguage(regex, [])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a", "b"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a", "b", "b"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a", "b", "a", "b"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["c"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["c", "d"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["c", "d", "d"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["c", "d", "c", "d"])).toBeTruthy();
      });

    });

  });

  describe("string representation API", function() {
    describe("toArray", function() {
      it("throws an Error if there is an illegal escape sequence in the string", function() {
        expect(function() { noamRe.string.toArray("abc\\d"); }).toThrow();
      });

      it("throws an Error if the string ends with a backslash", function() {
        expect(function() { noamRe.string.toArray("abc\\"); }).toThrow();
      });
    });

    describe("toTree", function() {
      it("converts the regex to a tree that can then be manipulated", function() {
        var a_or_b = noamRe.string.toTree("a+b");
        var a_or_b_star = noamRe.tree.makeKStar(a_or_b);
        var automaton = noamRe.tree.toAutomaton(a_or_b_star);
        expect(noamFsm.isStringInLanguage(automaton, [])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b"])).toBeTruthy();
        expect(noamFsm.isStringInLanguage(automaton, ["a", "b", "b"])).toBeTruthy();
      });
    });

    describe("toAutomaton", function() {
      // Helper that converts the string representation to an automaton using
      // toAutomaton and then tests if the @a symbolArray is in the specified
      // language.
      function inRegexLanguage(regexString, symbolArray) {
        var automaton = noamRe.string.toAutomaton(regexString);
        return noamFsm.isStringInLanguage(automaton, symbolArray);
      }

      it("works for the empty language", function() {
        var automaton = noamRe.string.toAutomaton("");
        expect(noamFsm.isLanguageNonEmpty(automaton)).toBeFalsy();
      });

      it("works for epsilon", function() {
        expect(inRegexLanguage("$", [])).toBeTruthy();
      });

      it("works for a single literal", function() {
        expect(inRegexLanguage("a", [])).toBeFalsy();
        expect(inRegexLanguage("a", ["a"])).toBeTruthy();
      });

      it("works for a Kleene starred literal", function() {
        var regex = "a*";
        expect(inRegexLanguage(regex, [])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a", "a"])).toBeTruthy();
      });

      it("works for concatenation", function() {
        var regex = "abc";
        expect(inRegexLanguage(regex, [])).toBeFalsy();
        expect(inRegexLanguage(regex, ["a"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["a", "b"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["a", "b", "c"])).toBeTruthy();
      });

      it("assigns operator priority to parentheses > Kleene star > concatenation > alteration", function() {
        var regex = "ab*+(cd)*";
        expect(inRegexLanguage(regex, [])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a", "b"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a", "b", "b"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["a", "b", "a", "b"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["c"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["c", "d"])).toBeTruthy();
        expect(inRegexLanguage(regex, ["c", "d", "d"])).toBeFalsy();
        expect(inRegexLanguage(regex, ["c", "d", "c", "d"])).toBeTruthy();
      });

      it("handles escaping properly", function() {
        // this next line doesn't work because $ is special
        // TODO: fix
        // expect(inRegexLanguage("\\$", ["$"])).toBeTruthy();
        expect(inRegexLanguage("\\+", ["+"])).toBeTruthy();
        expect(inRegexLanguage("\\*", ["*"])).toBeTruthy();
        expect(inRegexLanguage("\\(", ["("])).toBeTruthy();
        expect(inRegexLanguage("\\)", [")"])).toBeTruthy();
        expect(inRegexLanguage("\\\\", ["\\"])).toBeTruthy();

        expect(inRegexLanguage("(a+b\\+c)\\*", ["a", "*"])).toBeTruthy();
        expect(inRegexLanguage("(a+b\\+c)\\*", ["b", "+", "c", "*"])).toBeTruthy();
      });

    });

  });
  
  describe("regex simplification", function() {
    describe("simplify", function() {
      var specials = noamRe.array.specials;
      // TODO -- add sanity checks using fsm equivalence?
      
      it("handles ((a)) = (a), seq and alt", function() {
        var re1 = noamRe.tree.makeSeq( [noamRe.tree.makeLit ("a")] );
        var re2 = noamRe.tree.makeAlt( [noamRe.tree.makeLit ("a")] );
        
        var re1_s = noamRe.tree.simplify(re1);
        var re2_s = noamRe.tree.simplify(re2);
        
        expect(re1_s.tag === noamRe.tree.tags.LIT).toBeTruthy();
        expect(re2_s.tag === noamRe.tree.tags.LIT).toBeTruthy();
      });
      
      it("handles eps* = eps", function() {
        var re1 = noamRe.array.toTree([ specials.EPS, specials.KSTAR ]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ specials.EPS ])).toBeTruthy();
      });
      
      it("handles (a*)*", function() {
        var re1 = noamRe.array.toTree([ specials.LEFT_PAREN, "a", specials.KSTAR, specials.RIGHT_PAREN, specials.KSTAR ]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ "a", specials.KSTAR ])).toBeTruthy();
      });
      
      it("handles (a+b*)* = (a+b)*", function() {
        var re1 = noamRe.array.toTree([ specials.LEFT_PAREN, "a", specials.ALT, "b", specials.KSTAR, specials.RIGHT_PAREN, specials.KSTAR ]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ specials.LEFT_PAREN, "a", specials.ALT, "b", specials.RIGHT_PAREN, specials.KSTAR ])).toBeTruthy();
      });
      
      it("handles eps+a* = a*", function() {
        var re1 = noamRe.array.toTree([ specials.EPS, specials.ALT, "a", specials.KSTAR ]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ "a", specials.KSTAR ])).toBeTruthy();
      });
      
      it("handles (a*b*c*)* = (a*+b*+c*)*", function() {
        var re1 = noamRe.array.toTree([ specials.LEFT_PAREN, "a", specials.KSTAR, "b", specials.KSTAR, "c", specials.KSTAR, specials.RIGHT_PAREN, specials.KSTAR ]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ specials.LEFT_PAREN, "a", specials.ALT, "b", specials.ALT, "c", specials.RIGHT_PAREN, specials.KSTAR ])).toBeTruthy();
      });
      
      it("handles eps a = a", function() {
        var re1 = noamRe.array.toTree([ specials.EPS, "a" ]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ "a" ])).toBeTruthy();
      });
      
      it("handles (a + (b + c)) = a+b+c", function() {
        var re1 = noamRe.array.toTree([ "a", specials.ALT, specials.LEFT_PAREN, "b", specials.ALT, "c", specials.RIGHT_PAREN]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ "a", specials.ALT, "b", specials.ALT, "c" ])).toBeTruthy();
      });
      
      it("handles a b ( c d ) = a b c d", function() {
        var re1 = noamRe.array.toTree([ "a", "b", specials.LEFT_PAREN, "c", "d", specials.RIGHT_PAREN]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ "a", "b", "c", "d" ])).toBeTruthy();
      });
      
      it("handles  a + b + a = a+b // a* + b + a* = a*+b // a + b + a* = b+a*", function() {
        var specials = noamRe.array.specials;
        var re1 = noamRe.array.toTree([ "a", specials.ALT, "b", specials.ALT, "a"]);
        var re2 = noamRe.array.toTree([ "a", specials.KSTAR, specials.ALT, "b", specials.ALT, "a", specials.KSTAR]);
        var re3 = noamRe.array.toTree([ "a", specials.ALT, "b", specials.ALT, "a", specials.KSTAR]);
        
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        var re2_s = noamRe.tree.toArray(noamRe.tree.simplify(re2));
        var re3_s = noamRe.tree.toArray(noamRe.tree.simplify(re3));
                
        expect(noamUtil.areEquivalent(re1_s, [ "a", specials.ALT, "b" ])).toBeTruthy();
        expect(noamUtil.areEquivalent(re2_s, [ "a", specials.KSTAR, specials.ALT, "b" ])).toBeTruthy();
        expect(noamUtil.areEquivalent(re3_s, [ "b", specials.ALT, "a", specials.KSTAR ])).toBeTruthy();
      });
      
      it("handles a*a* = a*", function() {
        var re1 = noamRe.array.toTree([ "a", specials.KSTAR, "a", specials.KSTAR]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ "a", specials.KSTAR ])).toBeTruthy();
      });
      
      it("handles (aa+b+a)* = (b+a)*", function() {
        var re1 = noamRe.array.toTree([ specials.LEFT_PAREN, "a", "a", specials.ALT, "b", specials.ALT, "a", specials.RIGHT_PAREN, specials.KSTAR]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ specials.LEFT_PAREN, "b", specials.ALT, "a", specials.RIGHT_PAREN, specials.KSTAR])).toBeTruthy();
      });
      
      it("handles (a + $ + b)* = (a + b)*", function() {
        var re1 = noamRe.array.toTree([ specials.LEFT_PAREN, "a", specials.ALT, specials.EPS, specials.ALT, "b", specials.RIGHT_PAREN, specials.KSTAR]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ specials.LEFT_PAREN, "a", specials.ALT, "b", specials.RIGHT_PAREN, specials.KSTAR])).toBeTruthy();
      });
      
      it("handles (ab+ac) = a(b+c)", function() {
        var re1 = noamRe.array.toTree([ "a", "b", specials.ALT, "a", "c"]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ "a", specials.LEFT_PAREN, "b", specials.ALT, "c", specials.RIGHT_PAREN ])).toBeTruthy();
      });
      
      it("handles a* a a* = a a*", function() {
        var re1 = noamRe.array.toTree([ "a", specials.KSTAR, "a", "a", specials.KSTAR]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ "a", "a", specials.KSTAR ])).toBeTruthy();
      });
      
      it("handles (ab+cb) = (a+c)b", function() {
        var re1 = noamRe.array.toTree([ "a", "b", specials.ALT, "c", "b"]);
        var re1_s = noamRe.tree.toArray(noamRe.tree.simplify(re1));
        expect(noamUtil.areEquivalent(re1_s, [ specials.LEFT_PAREN, "a", specials.ALT, "c", specials.RIGHT_PAREN, "b"])).toBeTruthy();
      });
    });
  });
});