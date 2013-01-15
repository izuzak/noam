// taken from http://rosettacode.org/wiki/Longest_common_subsequence#JavaScript
function lcs(x, y) {
  var s, i, j, m, n, lcs = [], row = [], c = [], left, diag, latch;
  //make sure shorter string is the column string
  if(m<n){s=x;x=y;y=s;}
  m = x.length;
  n = y.length;
  //build the c-table
  for(j=0;j<n;row[j++]=0);
  for(i=0;i<m;i++){
    c[i] = row = row.slice();
    for(diag=0,j=0;j<n;j++,diag=latch){
      latch=row[j];
      if(x[i] == y[j]){row[j] = diag+1;}
      else{
        left = row[j-1]||0;
        if(left>row[j]){row[j] = left;}
      }
    }
  }
  i--,j--;
  //row[j] now contains the length of the lcs
  //recover the lcs from the table
  while(i>-1&&j>-1){
    switch(c[i][j]){
      default: j--;
        lcs.unshift(x[i]);
      case (i&&c[i-1][j]): i--;
        continue;
      case (j&&c[i][j-1]): j--;
    }
  }
  return lcs.join('');
}

function lcs_intervals(str1, str2) {
  var intervals = [];

  var start = 0;
  var end = 0;

  var i=0;

  while (i < str2.length) {
    if (str2[i] !== str1[end]) {
      end += 1
    } else {
      if (start !== end) {
        intervals.push([start, end]);
      }

      start = end;
      i += 1;
      end += 1;
      start += 1;
    }
  }

  if (end < str1.length) {
    intervals.push([end, str1.length]);
  }

  return intervals;
}

var regexCounter = 1;
var currentRegex = null;
var sourceRegex = null;

$("#generateRegex").click(function() {
  $("#originalRegex").val(noam.re.string.random(20, "abc", {}));
  currentRegex = $("#originalRegex").val();
  onRegexChange();
});

$("#originalRegex").change(function() {
  currentRegex = $("#originalRegex").val();
  onRegexChange();
});

function onRegexChange() {
  regexCounter = 1;
  $("#simplifyRegex").attr("disabled", false);
  $("#simplifyRegexStep").attr("disabled", false);
  $("#simplificationHistory").html("");
}

$("#simplifyRegex").click(simplifyAll);

function simplifyAll() {
  $("#simplifyRegexStep").attr("disabled", true);
  $("#simplifyRegex").attr("disabled", true);

  var loop = function() {
    var isDone = simplifyStep();

    if (isDone === false) {
      setTimeout(loop, 0);
    } else {
      ;
    }
  };

  setTimeout(loop, 0);
}

function colorize(source, result) {
  var sourceText = source.text();
  var resultText = result.text();
  var lcsText = lcs(sourceText, resultText);

  var deletedIntervals = lcsText.length > sourceText.length ? [] : lcs_intervals(sourceText, lcsText);
  var addedIntervals = resultText.length > lcsText.length ? [] : lcs_intervals(lcsText, resultText);

  colorDiv(source, deletedIntervals, "deletedRegexPart");
  colorDiv(result, addedIntervals, "addedRegexPart");
}

function createRegexLabel(regNum) {
  return "R<sub>" + regNum.toString() + "</sub>";
}

function createSimplifyStepDiv(isInitial, regex) {
  var outerDiv = $("<div />", { class: "simplifyStep" });

  var stepLabel = $("<label />", { class: "regexStep span1" });
  var stepDiv = $("<div />", { class: "input-block-level monospaceRegex appliedRule", type : "text"});

  var regexLabel = $("<label />", { class: "regexCounter span1" });
  var regexDiv = $("<div />", { class: "input-block-level monospaceRegex regexString", type : "text"});

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

  var isDone = result === currentRegex
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

function colorDiv(div, intervals, cssClass) {
  var regex = div.text();

  var start = 0;
  var out = "";

  for (var i=0; i<intervals.length; i++) {
    out += regex.slice(start, intervals[i][0]);
    out += '<font class="' + cssClass + '">' + regex.slice(intervals[i][0], intervals[i][1]) + '</font>';
    start = intervals[i][1];
  }

  out += regex.slice(start);

  div.html(out);
}

function simplify_(regex) {
  var config = {numIterations : 1, appliedPatterns : []};
  var result = noam.re.string.simplify(regex, config);
  var numOfLastStepPatterns = config.appliedPatterns.length;
  while (result === regex) {
    config.numIterations += 1;
    config.appliedPatterns = [];
    var result = noam.re.string.simplify(regex, config);
    if (config.appliedPatterns.length == 0 || config.appliedPatterns.length == numOfLastStepPatterns)
      break;
    numOfLastStepPatterns = config.appliedPatterns.length;
  }
  return [result, config.appliedPatterns];
}


