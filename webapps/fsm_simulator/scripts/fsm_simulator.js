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
  if ($("#startStop").text() === "Stop") {
    $("#startStop").click();
  }

  $("#inputString").val(Math.random() >= 0.5 ?
    noam.fsm.randomStringInLanguage(automaton).join("") :
    noam.fsm.randomStringNotInLanguage(automaton).join(""));
  onInputStringChange();
});

$("#generateRandomAcceptableString").click(function(){
  if ($("#startStop").text() === "Stop") {
    $("#startStop").click();
  }

  var s = noam.fsm.randomStringInLanguage(automaton).join("");
  $("#inputString").val(s);
  onInputStringChange();
});

$("#generateRandomUnacceptableString").click(function(){
  if ($("#startStop").text() === "Stop") {
    $("#startStop").click();
  }

  var s = noam.fsm.randomStringNotInLanguage(automaton).join("");
  $("#inputString").val(s);
  onInputStringChange();
});

$("#startStop").click(function() {
  if ($("#startStop").text() === "Start") {
    var r = $("#inputString").val();
    $("#inputString").parent().html('<div id="inputString" type="text" class="input-div input-block-level monospaceRegex" placeholder="See if this fits"><br></div>');
    $("#inputString").html(r === "" ? '<br>' : r);
    resetAutomaton();
    $("#inputString").removeAttr("contenteditable");
    $("#inputFirst").attr("disabled", false);
    $("#inputNext").attr("disabled", false);
    $("#inputPrevious").attr("disabled", false);
    $("#inputLast").attr("disabled", false);
    $("#startStop").text("Stop");
  } else {
    var r = $("#inputString").text();
    $("#inputString").parent().html('<input id="inputString" type="text" class="input-block-level monospaceRegex" placeholder="See if this fits">');
    $("#inputString").keyup(onInputStringChange);
    $("#inputString").change(onInputStringChange);
    $("#inputString").val(r);
    $("#inputString").attr("contenteditable", "");
    $("#inputFirst").attr("disabled", true);
    $("#inputNext").attr("disabled", true);
    $("#inputPrevious").attr("disabled", true);
    $("#inputLast").attr("disabled", true);
    $("#startStop").text("Start");
    $("#inputString").html(($("#inputString").text()));
    $("#inputString").focus();
  }
});

function onInputStringChange() {
  var chars = $("#inputString").val().split("");
  var isValidInputString = -1;
  for (var i=0; i<chars.length; i++) {
    if (!noam.util.contains(automaton.alphabet, chars[i])) {
      isValidInputString = i;
      break;
    }
  }

  if (isValidInputString === -1) {
    $("#startStop").attr("disabled", false);
    $("#inputString").parent().addClass("success");
    $("#inputString").parent().removeClass("error");
    $("#inputError").hide();
  } else {
    $("#startStop").attr("disabled", true);
    $("#inputString").parent().removeClass("success");
    $("#inputString").parent().addClass("error");
    $("#inputError").show();
    $("#inputError").text("Error: input character at position " + i + " is not in FSM alphabet.");
  }
}

function colorNextSymbol() {
  $("#inputString").html(inputString);

  if ($("#inputString").html() === "") {
    $("#inputString").html("<br>");
  }

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
}

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
var inputIsRegex = true;

$("#regexinput").click(function(){
  inputIsRegex = true;
});

$("#fsminput").click(function(){
  inputIsRegex = false;
});

$("#generateRegex").click(function() {
  regex = noam.re.string.random(5, "abcd", {});
  regex = noam.re.string.simplify(regex);
  $("#regex").val(regex);
  $("#regex").focus();
  onRegexOrAutomatonChange();
});

function generateAutomaton(fsmType) {
  automaton = noam.fsm.createRandomFsm(fsmType, 4, 3, 3);
  $("#fsm").val(noam.fsm.serializeFsmToString(automaton));
  $("#fsm").scrollTop(0);
  $("#fsm").focus();
  onRegexOrAutomatonChange();
}

$("#generateDFA").click(function() {
  generateAutomaton(noam.fsm.dfaType);
});

$("#generateNFA").click(function() {
  generateAutomaton(noam.fsm.nfaType);
});

$("#generateENFA").click(function() {
  generateAutomaton(noam.fsm.enfaType);
});

$("#createAutomaton").click(function() {
  if (inputIsRegex) {
    regex = $("#regex").val();
    automatonType = $("#automatonType").val();
    automaton = noam.re.string.toAutomaton(regex);

    if (automatonType === noam.fsm.nfaType) {
      automaton = noam.fsm.convertEnfaToNfa(automaton);
    }

    if (automatonType === noam.fsm.dfaType) {
      automaton = noam.fsm.convertEnfaToNfa(automaton);
      automaton = noam.fsm.convertNfaToDfa(automaton);
      automaton = noam.fsm.minimize(automaton);
      automaton = noam.fsm.convertStatesToNumbers(automaton);
    }
  } else {
    automaton = noam.fsm.parseFsmFromString($("#fsm").val());
  }

  initialize();
  drawGraph();
  resetAutomaton();

  $("#generateRandomString").attr("disabled", false);
  $("#generateRandomAcceptableString").attr("disabled", false);
  $("#generateRandomUnacceptableString").attr("disabled", false);
  $("#inputString").attr("disabled", false);
});

$("#regex").change(onRegexOrAutomatonChange);
$("#regex").keyup(onRegexOrAutomatonChange);
$("#fsm").change(onRegexOrAutomatonChange);
$("#fsm").keyup(onRegexOrAutomatonChange);

function onRegexOrAutomatonChange() {
  $("#automatonGraph").html("");
  $("#inputString").html("<br>");

  $("#generateRandomString").attr("disabled", true);
  $("#generateRandomAcceptableString").attr("disabled", true);
  $("#generateRandomUnacceptableString").attr("disabled", true);
  $("#createAutomaton").attr("disabled", true);
  $("#startStop").attr("disabled", true);
  $("#inputFirst").attr("disabled", true);
  $("#inputNext").attr("disabled", true);
  $("#inputPrevious").attr("disabled", true);
  $("#inputLast").attr("disabled", true);
  $("#inputString").parent().html('<input id="inputString" type="text" class="input-block-level monospaceRegex" placeholder="See if this fits" disabled>');
  $("#inputString").parent().removeClass("success error");
  $("#inputString").keyup(onInputStringChange);
  $("#inputString").change(onInputStringChange);
  $("#startStop").text("Start");
  $("#inputError").hide();

  if (inputIsRegex) {
    validateRegex();
  } else {
    validateFsm();
  }
}

function validateFsm() {
  var fsm = $("#fsm").val();

  if (fsm.length === 0) {
    $("#fsm").parent().removeClass("success error");
    $("#fsmError").hide();
  } else {
    try {
      noam.fsm.parseFsmFromString(fsm);
      $("#fsm").parent().removeClass("error");
      $("#fsm").parent().addClass("success");
      $("#createAutomaton").attr("disabled", false);
      $("#fsmError").hide();
    } catch (e) {
      $("#fsm").parent().removeClass("success");
      $("#fsm").parent().addClass("error");
      $("#fsmError").text("Error: " + e.message);
      $("#fsmError").show();
    }
  }
}

function validateRegex() {
  var regex = $("#regex").val();

  if (regex.length === 0) {
    $("#regex").parent().removeClass("success error");
    $("#fsmError").hide();
  } else {
    try {
      noam.re.string.toTree(regex);
      $("#regex").parent().removeClass("error");
      $("#regex").parent().addClass("success");
      $("#createAutomaton").attr("disabled", false);
      $("#fsmError").hide();
    } catch (e) {
      $("#regex").parent().removeClass("success");
      $("#regex").parent().addClass("error");
      $("#fsmError").text("Error: " + e.message);
      $("#fsmError").show();
    }
  }
}
