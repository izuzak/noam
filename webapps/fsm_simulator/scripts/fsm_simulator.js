function colorStates(states, cssClass) {
  if (states === undefined || states === null) {
    return;
  }

  states = getElementsOfStates(states);

  for (var i=0; i<states.length; i++) {
    states[i].children("ellipse").each(function() {
      $(this).attr("class", cssClass);
    });
  }
}

function colorDiv(divId, intervals, cssClass) {
  var regex = $("#" + divId).html();

  var start = 0;
  var out = "";

  for (var i=0; i<intervals.length; i++) {
    out += regex.slice(start, intervals[i][0]);
    out += '<font class="' + cssClass + '">' + regex.slice(intervals[i][0], intervals[i][1]) + '</font>';
    start = intervals[i][1];
  }

  out += regex.slice(start);

  $("#" + divId).html(out);
}

function getElementsOfStates(states) {
  var retVal = [];

  for (var i=0; i<states.length; i++) {
    $("title:contains('" + states[i].toString() + "')").each(function(index, element)  {
      if ($(this).text() === states[i].toString()) {
        retVal.push($(this).parent());
      }
    });
  }

  return retVal;
}

function reorderCirclesInAcceptingStates(states) {
  var stateElements = getElementsOfStates(states);

  for (var i=0; i<stateElements.length; i++) {
    var e1 = $(stateElements[i].children("ellipse")[0]);
    var e2 = $(stateElements[i].children("ellipse")[1]);
    e1.insertAfter(e2);
  }
}

function drawGraph() {
  var dotString = noam.fsm.printDotFormat(automaton);
  var gvizXml = Viz(dotString, "svg");
  $("#automatonGraph").html(gvizXml);
  reorderCirclesInAcceptingStates(automaton.acceptingStates);
  $("#automatonGraph svg").width($("#automatonGraph").width());
}

function colorize() {
  colorStates(automaton.states, "inactiveStates");
  colorStates(previousStates, "previousState");
  colorStates(nextStates, "nextState");
  colorStates(currentStates, "currentState");
}

$("#generateRandomString").click(function(){
  $("#inputString").html(Math.random() >= 0.5 ?
    noam.fsm.randomStringInLanguage(automaton) :
    noam.fsm.randomStringNotInLanguage(automaton));
  resetAutomaton();
});

$("#generateRandomAcceptableString").click(function(){
  $("#inputString").html(noam.fsm.randomStringInLanguage(automaton));
  resetAutomaton();
});

$("#generateRandomUnacceptableString").click(function(){
  $("#inputString").html(noam.fsm.randomStringNotInLanguage(automaton));
  resetAutomaton();
});

function colorNextSymbol() {
  $("#inputString").html(inputString);
  if (nextSymbolIndex < inputString.length) {
    colorDiv("inputString", [[nextSymbolIndex, nextSymbolIndex+1]], "nextSymbol");
  }
}

function resetAutomaton() {
  currentStates = noam.fsm.computeEpsilonClosure(automaton, [automaton.initialState]);
  inputString = $("#inputString").text();
  nextSymbolIndex = 0;
  colorize();
  colorNextSymbol();
};

$("#inputFirst").click(function(){
  resetAutomaton();
});

$("#inputPrevious").click(function(){
  if (nextSymbolIndex > 0) {
    currentStates = noam.fsm.readString(automaton, inputString.substring(0, nextSymbolIndex-1).split(""));
    nextSymbolIndex = nextSymbolIndex-1;
    colorize();
    colorNextSymbol();
  }
});

$("#inputNext").click(function(){
  if (nextSymbolIndex < inputString.length) {
    currentStates = noam.fsm.makeTransition(automaton, currentStates, inputString[nextSymbolIndex]);
    nextSymbolIndex += 1;
    colorize();
    colorNextSymbol();
  }
});

$("#inputLast").click(function(){
  while(nextSymbolIndex < inputString.length) {
    currentStates = noam.fsm.makeTransition(automaton, currentStates, inputString[nextSymbolIndex]);
    nextSymbolIndex += 1;
    colorize();
    colorNextSymbol();
  }
});

function initialize() {
  inputStringLeft = null;
  currentStates = null;
  inactiveStates = null;
  previousStates = null;
  nextStates = null;
}

var regex = null;
var automaton = null;
var inputString = null;
var nextSymbolIndex = 0;
var currentStates = null;
var inactiveStates = null;
var previousStates = null;
var nextStates = null;

$("#generateRegex").click(function() {
  regex = noam.re.string.random(5, "abcd", {});
  regex = noam.re.string.simplify(regex);
  $("#regex").val(regex);
});

$("#createAutomaton").click(function() {
  regex = $("#regex").val();
  automaton = noam.re.string.toAutomaton(regex);
  initialize();
  drawGraph();
  resetAutomaton();
});
