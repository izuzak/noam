var regexCounter = 1;
var currentRegex = null;
var sourceRegex = null;

$("#generateRegex").click(function() {
  $("#originalRegex").val(noam.re.string.random(20, "abc", {}));
  onRegexChange();
});

$("#originalRegex").change(onRegexChange);
$("#originalRegex").keyup(onRegexChange);

function onRegexChange() {
  currentRegex = $("#originalRegex").val();
  regexCounter = 1;
  $("#simplificationHistory").html("");
  validateRegex();
}

function validateRegex() {
  var regex = $("#originalRegex").val();

  if (regex.length === 0) {
    $("#originalRegex").parent().removeClass("success error");
    $("#simplifyRegex").attr("disabled", true);
    $("#simplifyRegexStep").attr("disabled", true);
    $("#inputError").hide();
  } else {
    try {
      noam.re.string.toTree(regex);
      $("#originalRegex").parent().removeClass("error");
      $("#originalRegex").parent().addClass("success");
      $("#simplifyRegex").attr("disabled", false);
      $("#simplifyRegexStep").attr("disabled", false);
      $("#inputError").hide();
    } catch (e) {
      $("#originalRegex").parent().removeClass("success");
      $("#originalRegex").parent().addClass("error");
      $("#simplifyRegex").attr("disabled", true);
      $("#simplifyRegexStep").attr("disabled", true);
      $("#inputError").text("Error: " + e.message);
      $("#inputError").show();
    }
  }
}

$("#simplifyRegex").click(simplifyAll);

function simplifyAll() {
  $("#simplifyRegexStep").attr("disabled", true);
  $("#simplifyRegex").attr("disabled", true);

  var loop = function() {
    var isDone = simplifyStep();

    if (isDone === false) {
      setTimeout(loop, 0);
    }
  };

  setTimeout(loop, 0);
}

function colorize(source, result) {
  var sourceText = source.text();
  var resultText = result.text();

  var diff = JsDiff.diffChars(sourceText, resultText);

  colorDiv(source, diff, "removed", "deletedRegexPart");
  colorDiv(result, diff, "added", "addedRegexPart");
}

function createRegexLabel(regNum) {
  return "R<sub>" + regNum.toString() + "</sub>";
}

function createSimplifyStepDiv(isInitial, regex) {
  var outerDiv = $("<div />", { "class": "simplifyStep" });

  var stepLabel = $("<label />", { "class": "regexStep span1" });
  var stepDiv = $("<div />", { "class": "input-block-level monospaceRegex appliedRule", type : "text"});

  var regexLabel = $("<label />", { "class": "regexCounter span1" });
  var regexDiv = $("<div />", { "class": "input-block-level monospaceRegex regexString", type : "text"});

  var reglab = createRegexLabel(regexCounter);
  regexCounter += 1;
  regexLabel.html(reglab);
  regexDiv.html(regex);

  var steplab = "Rule";
  stepLabel.html(steplab);

  if (!isInitial) {
    outerDiv.append(stepLabel);
    outerDiv.append(stepDiv);
  }

  outerDiv.append(regexLabel);
  outerDiv.append(regexDiv);

  return outerDiv;
}

function simplifyStep() {
  if (regexCounter === 1) {
    var div = createSimplifyStepDiv(true, currentRegex);
    $("#simplificationHistory").append(div);
  }

  var stepResult = simplify_(currentRegex);
  var result = stepResult[0];
  var appliedPatterns = stepResult[1];

  var isDone = result === currentRegex;
  if (isDone) {
    $("#simplifyRegexStep").attr("disabled", true);
    $("#simplifyRegex").attr("disabled", true);
  } else {
    var previousDiv = $(".simplifyStep").slice(-1)[0];
    var currentDiv = createSimplifyStepDiv(false, currentRegex);
    $("#simplificationHistory").append(currentDiv);
    $(currentDiv).find(".appliedRule").html(appliedPatterns[appliedPatterns.length - 1]);
    $(currentDiv).find(".regexString").html(result);
    colorize($(previousDiv).find(".regexString"), $(currentDiv).find(".regexString"));

    sourceRegex = currentRegex;
    currentRegex = result;
  }

  return isDone;
}

$("#simplifyRegexStep").click(simplifyStep);

function colorDiv(div, parts, type, cssClass) {
  var out = "";
  var shouldBeTrueOrUndefined = type;
  var mustBeUndefined = type === "added" ? "removed" : "added";

  for (var i=0; i<parts.length; i++) {
    if (parts[i][mustBeUndefined] === undefined) {
      if (parts[i][shouldBeTrueOrUndefined] === undefined){
        out += parts[i].value;
      } else {
        out += '<font class="' + cssClass + '">' + parts[i].value + '</font>';
      }
    }
  }

  div.html(out);
}

function simplify_(regex) {
  var config = {numIterations : 1, appliedPatterns : []};
  var result = noam.re.string.simplify(regex, config);
  var numOfLastStepPatterns = config.appliedPatterns.length;
  while (result === regex) {
    config.numIterations += 1;
    config.appliedPatterns = [];
    result = noam.re.string.simplify(regex, config);
    if (config.appliedPatterns.length === 0 ||
        config.appliedPatterns.length === numOfLastStepPatterns)
      break;
    numOfLastStepPatterns = config.appliedPatterns.length;
  }
  return [result, config.appliedPatterns];
}
