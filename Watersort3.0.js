///////////////////////////// The Game
// Parameters
var n = 14; // tubes
// Constants
var blocksPerTube = 4;
var colourRGB = [
  [255, 51, 51],
  [51, 255, 51],
  [51, 153, 255],
  [255, 255, 51],
  [255, 51, 255],
  [51, 255, 255],
  [255, 153, 51],
  [51, 180, 153],
  [153, 51, 255],
  [200, 0, 153],
  [150, 180, 0],
  [255, 153, 153],
  [153, 255, 153],
  [200, 200, 255]
];
var colourRGB = []
for (let i = 0; i < n - 2; i++) {
  colourRGB.push([getRandomInt(255), getRandomInt(255), getRandomInt(255)])
}
// Variables
var originalLayout = [];
var currentLayout = [];
var liftedTube = -1;

//P5 Setup
function setup() {
  rectMode(CENTER);
  createCanvas(800, 400);
  background(200);
  render();
}

function render() {
  //render boxes
  background(200)

  button = createButton('Reset');
  button.position(20, height - 80);
  button.mousePressed(reset);

  button = createButton('AI Next Move');
  button.position(20, height - 60);
  button.mousePressed(aiMove);

  button = createButton('AI Full Solve');
  button.position(20, height - 40);
  button.mousePressed(aiSolve);

  button = createButton('AI Simulation');
  button.position(20, height - 20);
  button.mousePressed(aiSimulate);

  for (let i = 0; i < n; i++) {
    strokeWeight(2)

    if (i == liftedTube) {
      var lift = 20;
    } else {
      var lift = 0;
    }

    for (let j = 0; j < currentLayout[i].length; j++) {
      fill(colourRGB[0])
      fill(colourRGB[currentLayout[i][j]])
      rect((i + 1) * width / (n + 1), height / 8 * (6 - j) - lift, width / (n + 1) * 0.8, height / 8)
    }

    //render tubes
    strokeWeight(4)
    line((i + 0.6) * width / (n + 1), 2 * height / 8 - lift, (i + 0.6) * width / (n + 1), 13 * height / 16 - lift)
    line((i + 0.6) * width / (n + 1), 13 * height / 16 - lift, (i + 1.4) * width / (n + 1), 13 * height / 16 - lift)
    line((i + 1.4) * width / (n + 1), 2 * height / 8 - lift, (i + 1.4) * width / (n + 1), 13 * height / 16 - lift)
  }

  if (checkCompletion()) {
    fill(255)
    rect(width / 2, height / 2, width * 0.8, height * 0.8)
    fill(0)
    textSize(50)
    textAlign(CENTER, CENTER)
    text('Congratulations', width / 2, height / 2)
  }

  return true;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function checkCompletion() {
  for (var i = 0; i < n; i++) {
    if (currentLayout[i].length > 0) {
      var checkColour = currentLayout[i][0]
      for (var j = 0; j < blocksPerTube; j++) {
        if (currentLayout[i][j] != checkColour) {
          return false;
        }
      }
    }
  }
  return true;
}

function getTop(tubeIndex) {
  var tube = currentLayout[tubeIndex];
  var output = [];

  if (tube.length != 0) {
    var x = 1;
    while (tube.length - x > -1 && tube[tube.length - x] == tube[tube.length - 1]) {
      output.push(tube[tube.length - 1]);
      x += 1;
    }
  }
  return output
}

function moveColour(a, b) {
  // Check in bounds for tubes
  if (a < 0 || b < 0 || a > n || b > n || a == b) {
    //console.debug("False move from " + a + " to " + b);
    return false
  }
  var aLength = currentLayout[a].length;
  var bLength = currentLayout[b].length;
  // Check actually moving a block
  if (bLength == blocksPerTube || aLength == 0) {
    //console.debug("False move from " + a + " to " + b);
    return false
  }
  var movedColour = currentLayout[a][aLength - 1];
  // Check not moving onto another colour
  if (movedColour != currentLayout[b][bLength - 1] && bLength != 0) {
    //console.debug("False move from " + a + " to " + b);
    return false
  }
  // Chaining blocks of the same colour
  var movedArr = getTop(a);
  var chainedBlocks = movedArr.length;

  if (chainedBlocks > blocksPerTube - bLength) {
    chainedBlocks = blocksPerTube - bLength;
    movedArr = movedArr.slice(0, blocksPerTube - bLength);
  }
  currentLayout[a] = currentLayout[a].slice(0, aLength - chainedBlocks);
  currentLayout[b] = currentLayout[b].concat(movedArr);
  //console.debug("Valid move from " + a + " to " + b);
  //console.debug("New Layout: ", currentLayout);
  return true;
}

function addNewBlock(colour, fullTubes) {
  var i = getRandomInt(n - 2);
  while (fullTubes.includes(i)) {
    i = (i + 1) % (n - 2)
  }
  if (originalLayout[i].length == blocksPerTube) {
    fullTubes.push(i);
    addNewBlock(colour, fullTubes);
    return "Finished Tube " + i;
  }
  originalLayout[i].push(colour);
}

function startGame() {
  for (var i = 0; i < n; i++) {
    originalLayout.push([]);
  }
  for (var i = 0; i < (n - 2) * blocksPerTube; i++) {
    addNewBlock(i % (n - 2), []);
  }

  currentLayout = JSON.parse(JSON.stringify(originalLayout));
  console.debug("OG Layout: ", currentLayout)
}

function reset() {
  currentLayout = JSON.parse(JSON.stringify(originalLayout));
}

function mousePressed() {
  var selectedTube = -1;
  // Find clicked tube
  for (let i = 0; i < n; i++) {
    if (mouseY < 350) {
      if (mouseX > (i + 0.6) * width / (n + 1) && mouseX < (i + 1.4) * width / (n + 1)) {
        selectedTube = i;
        break;
      }
    }
  }
  // If no tube is already lifted 
  if (liftedTube == -1) {
    liftedTube = selectedTube;
    return render();
  }
  // If selecting the lifted tube again, or clicking away
  if (liftedTube == selectedTube || selectedTube == -1) {
    liftedTube = -1;
    return render();
  }
  // We must have chosen a new tube
  moveColour(liftedTube, selectedTube);
  liftedTube = -1

  render();
  return
}

startGame();

///////////////////////////// The AI



// Random Moves
function aiRandomMove() {
  if (moveColour(getRandomInt(n), getRandomInt(n))) return true;
  aiMove();
}

// Slightly Smarter
var attempts = 0;

function aiMove() {
  attempts = 0;
  var result = tryMove();
  if (result == false) {
    return false;
  }
  return result;
}

function tryMove() {
  while (attempts < 500) {
    attempts += 1;
    for (let i = 0; i < n; i++) {
      if (currentLayout[i].length == 1) {
        for (let j = 0; j < n; j++) {
          if (currentLayout[j].length != 0) {
            if (moveColour(i, j)) {
              return [i, j];
            }
          }
        }
      }
    }

    a = getRandomInt(n)
    b = getRandomInt(n)

    if (getTop(a).length != currentLayout[a].length || currentLayout[b].length != 0) {
      if (a != b) {
        if (getTop(a).length <= (blocksPerTube - currentLayout[b].length)) {
          if (moveColour(a, b)) {
            return [a, b]
          }
        }
      }
    }
  }
  //console.log("Failed after " + attempts + " attemps")
  return false
}

function aiSolve() {
  var history = [];
  while (!checkCompletion()) {
    var result = aiMove();
    if (result == false) {
      return -1;
    }
    history.push(result);
  }
  //console.log("Turns: ", history.length);
  //console.log(history);
  return history;
}

function aiSimulate() {
  var total = 0;
  var runs = 100;
  var failures = 0;
  var successfulRuns = [];
  for (var i = 0; i < runs; i++) {
    var runOutput = aiSolve();
    if (runOutput == -1) {
      failures += 1;
      //console.log('the AI is a melt')
    } else {
      total += runOutput.length;
      successfulRuns.push(['Turns: ' + runOutput.length, runOutput])
    }
    reset();
  }
  var average = total / (runs - failures);
  console.log("Average turns over " + (runs - failures) + " runs = ", average)
  console.log("Number of melts: ", failures)
  console.log(successfulRuns)
}
