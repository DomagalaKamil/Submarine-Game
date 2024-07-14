
// This section initializes variables to store references to
//various DOM elements on the webpage, which will be used to
//manipulate them later.
var startButton = document.getElementById("button");
var gameBoard = document.getElementById("field");
var gameCanvas = document.getElementById("gameCanvas");
var gamenRounds = document.getElementById("rounds");
var userScore = document.getElementById("score_user");
var killerScore = document.getElementById("score_computer");
var remainingFuel = document.getElementById("remaining_fuel");
// This section initializes variables to hold the current state of the game.
var killerPosition = []; // 0-9, 0-9
var userPosition = []; // 0-9, 0-9
var currentFuel = 0;
var newUserScore = 0;
var newKillerScore = 0;
var roundCount = 0;
var fuelCount = 0;
var gameMap = new Array(10);

//flag at which the game is at
var gameStage = -2;
//load the first function
window.document.onload = init();

// loads the variables onto the website
function init() {
  startButton.innerHTML = "SETUP";
  gamenRounds.innerHTML = "0";
  userScore.innerHTML = "0";
  killerScore.innerHTML = "0";
  remainingFuel.innerHTML = "0";
  startButton.addEventListener("click", gameStageHandler);
}
//function to allow the user to setup game field
function setupStage(isStarting) {
  // game flag changes to "setup"
  gameStage = -1;

  startButton.innerHTML = "START";

  if (isStarting === undefined) {
    showAlert("Setup first here by clicking!", 2000);
    clearSettings();
  }

  for (var i = 0; i < 10; i++) {
    gameMap[i] = new Array(10);
    gameMap[i].fill(0);
  }
  gameBoard.setAttribute("class", "cursorPointer");
  gameBoard.addEventListener("click", fieldClick);
  gameBoard.addEventListener("mousemove", fieldMouseOver);
}
//function to allow the user to start game
function playStage() {
  // game flag chagnes to "running"
  gameStage = 0;

  if (!verifyObject()) {
    setupStage(true);
    return;
  }
  // update button
  startButton.innerHTML = "END";
  // remove all listeners
  gameBoard.removeAttribute("class");
  gameBoard.removeEventListener("click", fieldClick());
  gameBoard.removeEventListener("mousemove", fieldMouseOver);
  window.removeEventListener("keydown", fieldConfig);
  // remove bordered divs
  removeBorderDiv();
  // update status
  roundCount = 1;
  currentFuel = 10;
  newUserScore = 0;
  newKillerScore = 0;
  updateStatus();

  // reset selectedLeft & selectedTop
  selectedLeft = userPosition[0] * 64;
  selectedTop = userPosition[1] * 64;

  showAlert("Game Starts!", 1500);
  // add listeners for keydown
  window.addEventListener("keydown", controlSubmarine);
}

// check whether the user has placed the submarinem killer and fuel
function verifyObject() {
  if (userPosition.length < 2) {
    //no submarine, show allert
    showAlert("Place your submarine!", 1500);
    return false;
  }
  if (killerPosition.length < 2) {
    //no killer, show allert
    showAlert("Need at least one killer!", 1500);
    return false;
  }
  if (fuelCount == 0) {
    //no fuel, show allert
    showAlert("Need at least one fuel cell!", 1500);
    return false;
  }
  return true;
}

// based on game flag, correct game stage is ran by the code
function gameStageHandler() {
  //setup stage
  if (gameStage < -1) {
    setupStage();
  }
  //run game stage
  else if (gameStage < 0) {
    playStage();
  }
  //end game
  else if (gameStage < 1) {
    endGame();
  }
  //default to go to setup stage
  else {
    setupStage();
  }
}

// Function to handle user submarine key controls
function controlSubmarine(event) {
  // Remove the listener to avoid handling multiple key presses at the same time
  window.removeEventListener("keydown", controlSubmarine);
  // Handle movement based on key input
  switch (event.key) {
    // Move left when "a" is pressed
    case "a":
      updateUserPosition(-1, 0);
      break;
    // Move up when "w" is pressed
    case "w":
      updateUserPosition(0, -1);
      break;
    // Move right when "d" is pressed
    case "d":
      updateUserPosition(1, 0);
      break;
    // Move down when "s" is pressed
    case "s":
      updateUserPosition(0, 1);
      break;
    // Handle incorrect key input by re-adding the listener
    default:
      window.addEventListener("keydown", controlSubmarine);
      break;
  }
}
// object move update
function updateUserPosition(xShiftVal, yShiftVal) {
  var estimatedPosX = userPosition[0] + xShiftVal;
  var estimatedPosY = userPosition[1] + yShiftVal;
  //check if move is out of field range
  if (
    estimatedPosX < 0 ||
    estimatedPosX > 9 ||
    estimatedPosY < 0 ||
    estimatedPosY > 9
  ) {
    //alert user and waits for another input
    showAlert("Out of range! Move fails...", 1500);
    updateKillerPosition();
    window.addEventListener("keydown", controlSubmarine);
  }
  //check if move is made into a obsticle
  else if (gameMap[estimatedPosX][estimatedPosY] == 1000) {
    //alerts user and wait for another input
    showAlert("Come across obstacles! Move fails...", 1500);
    window.addEventListener("keydown", controlSubmarine);
  }
  //runs move function if both if are false
  else {
    //passes which direction player moves
    moveUser(xShiftVal, yShiftVal);
  }
}

// This function clears all the settings and variables related to the game.
function clearSettings() {
  while (gameBoard.firstChild) {
    gameBoard.removeChild(gameBoard.firstChild);
  }
  killerPosition = [];
  userPosition = [];
  currentFuel = 0;
  newUserScore = 0;
  newKillerScore = 0;
  roundCount = 0;
  fuelCount = 0;
  selectedLeft = 0;
  selectedTop = 0;
}

/*
* The following code was writen with help of one user from StackOverFlow
* Link : https://stackoverflow.com/questions/72250771/move-player-using-keyboard-in-javascript?rq=4
* Code was used under User contributions licensed under cc by-sa 3.0
*/

// This function moves the user's submarine based on the given xVal and yVal values.
function moveUser(xVal, yVal) {
  // Get the user's submarine element
  var userDiv = document.getElementById("user");
  // Calculate the steps to move the submarine
  var stepsX = 0;
  var stepsY = 0;
  if (xVal != 0) {
    stepsX = xVal * 1;
  }
  if (yVal != 0) {
    stepsY = yVal * 1;
  }

  // Get the current position of the submarine
  var userX = parseInt(userDiv.style.left.split("px")[0]);
  var userY = parseInt(userDiv.style.top.split("px")[0]);

  // Calculate the target position of the submarine
  var targetX = userPosition[0] + xVal;
  var targetY = userPosition[1] + yVal;

  // Check if the target position has a fuel element
  var fuelDiv = null;
  if (gameMap[targetX][targetY] > 0 && gameMap[targetX][targetY] < 10) {
    fuelDiv = document.getElementById("fuel" + targetX + targetY);
    fuelDiv.style.opacity = 1;
  }

  // Set the opacity of the user's submarine and show an alert about fuel usage
  userDiv.style.opacity = 1;
  showAlert("Fuels - 1", 600);

  // Decrease the current fuel count and update the game status
  currentFuel -= 1;
  updateStatus();

  // Call the movit() function to move the submarine
  movit();

  // This function moves the submarine and updates the game status
  function movit() {
    var offOpa = 0.05;
    if (userX != targetX * 64 || userY != targetY * 64) {
      // Move the submarine
      userX += stepsX;
      userY += stepsY;
      userDiv.style.left = userX + "px";
      userDiv.style.top = userY + "px";

      // If the target position has a fuel element, decrease its opacity
      if (fuelDiv != null && parseFloat(fuelDiv.style.opacity) > 0) {
        fuelDiv.style.opacity = parseFloat(fuelDiv.style.opacity) - offOpa;
      }

      // If the target position has a mine, decrease the submarine's opacity
      if (gameMap[targetX][targetY] == -1 && userDiv.style.opacity > 0.3) {
        userDiv.style.opacity = parseFloat(userDiv.style.opacity) - offOpa;
      }

      // Call the movit() function again after a short delay
      setTimeout(movit, 1);
    } else {
      // Update the grid map and current user position
      gameMap[userPosition[0]][userPosition[1]] = 0;
      userPosition[0] = targetX;
      userPosition[1] = targetY;

      // Update the selected left and top positions
      selectedLeft = userPosition[0] * 64;
      selectedTop = userPosition[1] * 64;

      // Check if the targeted grid has a value of -1 (meaning it is a killer grid) and end the game if so
      if (gameMap[targetX][targetY] == -1) {
        showAlert("Destroyed! Game Over!", 5000);
        return;
      }
      // If the targeted grid has fuel, remove the fuel div and add the fuel to the player's resources
      if (fuelDiv != null) {
        // remove the div
        gameBoard.removeChild(fuelDiv);

        // update the gridmap
        var increaseFuel = gameMap[targetX][targetY];

        showAlert(increaseFuel + " fuel added!", 750);

        currentFuel += parseInt(increaseFuel);
        newUserScore += parseInt(increaseFuel);
        fuelCount -= 1;
        // If there are no more fuels left, end the game and declare the player as the winner
        if (fuelCount == 0) {
          updateStatus();
          showAlert("No fuels left! You Won!", 5000);
          window.removeEventListener("keydown", controlSubmarine);
          gameStage = 1;
          return;
        }
      }
      // Update the targeted grid to -2 (meaning it has been visited by the player)
      gameMap[targetX][targetY] = -2;

      updateStatus();
      // If the player has run out of fuel, end the game and declare the player as the loser
      if (currentFuel == 0) {
        showAlert("Empty fuel tank! You lost!", 5000);
        window.removeEventListener("keydown", controlSubmarine);
        gameStage = 1;
        return;
      }
      // Update the killer position, round number and game status
      updateKillerPosition();
      roundCount += 1;
      updateStatus();
      window.addEventListener("keydown", controlSubmarine);
    }
  }
}
// killer submarine control
// This function updates the position of the killer submarine
/*
* The following function has been significantly improved and debugged with the help of ChatGPT.
*/
function updateKillerPosition() {
  for (var i = 0; i < killerPosition.length / 2; i++) {
    // Get the current position of the killer submarine
    var killerX = killerPosition[2 * i];
    var killerY = killerPosition[2 * i + 1];
    var xPosition = Infinity;
    var yPosition = Infinity;

    // Find any fuels or user nearby, select the maximum fuel or user
    var maxFuel = 0;
    var emptyCount = 0;
    var lastX = Infinity;
    var lastY = Infinity;

    // Loop through the cells around the killer submarine
    for (var j = -1; j <= 1; j++) {
      if (killerX + j < 0 || killerX + j > 9) {
        continue;
      }
      for (var k = -1; k <= 1; k++) {
        if (killerY + k < 0 || killerY + k > 9) {
          continue;
        }
        // If the cell is empty, update emptyCount and lastX/lastY
        if (
          gameMap[killerX + j][killerY + k] >= 0 &&
          gameMap[killerX + j][killerY + k] < 1000
        ) {
          emptyCount += 1;
          lastX = j;
          lastY = k;
        }
        // If the cell contains fuel, update xPosition/yPosition and maxFuel
        if (gameMap[killerX + j][killerY + k] == -2) {
          xPosition = j;
          yPosition = k;
          maxFuel = -1;
          break;
        }
        // If the cell contains more fuel than maxFuel, update xPosition/yPosition and maxFuel
        if (
          gameMap[killerX + j][killerY + k] > maxFuel &&
          gameMap[killerX + j][killerY + k] < 1000
        ) {
          maxFuel = gameMap[killerX + j][killerY + k];
          xPosition = j;
          yPosition = k;
        }
      }
      // If fuel is found, break the loop
      if (maxFuel == -1) {
        break;
      }
    }
    // if there are no empty spaces for this killer to move, skip this iteration of the loop
    if (emptyCount == 0) {
      continue;
    }
    // no fuels found, uniformly pick an empty position
    var randomNum = (Math.round(Math.random() * 100) % emptyCount) + 1;
    var countTo = 0;

    // This code checks if xPosition or yPosition is Infinity.
    if (xPosition == Infinity || yPosition == Infinity) {
      // If so, it enters a loop to iterate over a range of values around a point called 'killerX' and 'killerY'.
      for (var j = -1; j <= 1; j++) {
        // The loop continues only if 'killerX' + 'j' is not less than 0 or greater than 9.
        if (killerX + j < 0 || killerX + j > 9) {
          continue;
        }

        // Within this first loop, another loop checks a range of values around 'killerY'.
        for (var k = -1; k <= 1; k++) {
          // The loop continues only if 'killerY' + 'k' is not less than 0 or greater than 9.
          if (killerY + k < 0 || killerY + k > 9) {
            continue;
          }

          // If the value at the corresponding coordinate in 'gameMap' is 0, increment 'countTo'.
          if (gameMap[killerX + j][killerY + k] == 0) {
            countTo++;
          }

          // If 'countTo' equals 'randomNum', set 'xPosition' to 'j' and 'yPosition' to 'k' and exit the loop.
          if (countTo == randomNum) {
            xPosition = j;
            yPosition = k;
            break;
          }
        }

        // If 'xPosition' and 'yPosition' have been set, exit both loops.
        if (xPosition != Infinity && yPosition != Infinity) {
          break;
        }
      }
    }
    //calls function to move killer based on passed X Y coordinates
    moveKiller(i, killerX, killerY, xPosition, yPosition);
  }
}
/*
* The following function has been significantly improved and debugged with the help of ChatGPT.
*/
// move killer
function moveKiller(index, startX, startY, xPosition, yPosition) {
  var killerDiv = document.getElementById("killer" + startX + startY);
  var stepsX = 0;
  var stepsY = 0;

  // Set the number of steps for X axis to 4 if xPosition is not 0
  if (xPosition != 0) {
    stepsX = xPosition * 1; // set moving steps to 4;
  }

  // Set the number of steps for Y axis to 4 if yPosition is not 0
  if (yPosition != 0) {
    stepsY = yPosition * 1; // set moving steps to 4;
  }

  var userX = parseInt(killerDiv.style.left.split("px")[0]);
  var userY = parseInt(killerDiv.style.top.split("px")[0]);
  var targetX = startX + xPosition;
  var targetY = startY + yPosition;
  var fuelDiv = null;
  var increaseFuel = 0;

  // If the target tile contains fuel, show the fuel on the tile and add its value to increaseFuel
  if (gameMap[targetX][targetY] > 0 && gameMap[targetX][targetY] < 10) {
    fuelDiv = document.getElementById("fuel" + targetX + targetY);
    fuelDiv.style.opacity = 1;
    increaseFuel = gameMap[targetX][targetY];
  }

  var userDiv = null;

  // If the target tile contains the user, make the user visible
  if (gameMap[targetX][targetY] == -2) {
    userDiv = document.getElementById("user");
    userDiv.style.opacity = 1;
  }

  // Update the current position of the killer
  killerPosition[index * 2] = targetX;
  killerPosition[index * 2 + 1] = targetY;
  killerDiv.setAttribute("id", "killer" + targetX + targetY);

  // Update the grid map to reflect the killer's movement
  gameMap[startX][startY] = 0;
  gameMap[targetX][targetY] = -1;

  movit();
  //
  function movit() {
    var offOpa = 0.05;
    // Check if the killer has reached the target position
    if (userX != targetX * 64 || userY != targetY * 64) {
      // Update the position of the killer
      userX += stepsX;
      userY += stepsY;
      killerDiv.style.left = userX + "px";
      killerDiv.style.top = userY + "px";
      // If there is a fuel at the target position, decrease its opacity
      if (fuelDiv != null && parseFloat(fuelDiv.style.opacity) > 0) {
        fuelDiv.style.opacity = parseFloat(fuelDiv.style.opacity) - offOpa;
      }
      // If there is a user at the target position, decrease its opacity
      if (userDiv != null && parseFloat(userDiv.style.opacity) > 0.2) {
        userDiv.style.opacity = parseFloat(userDiv.style.opacity) - offOpa;
      }
      // Use setTimeout to continue moving the killer
      setTimeout(movit, 1);
    }
    // If the killer has reached the target position
    else {
      // If the killer has reached the user, end the game
      if (targetX == userPosition[0] && targetY == userPosition[1]) {
        newKillerScore += 100;
        updateStatus();
        showAlert("Destroyed! Game Over!", 5000);
        return;
      }
      // If there is a fuel at the target position
      if (fuelDiv != null) {
        // Remove the fuel div from the game field
        gameBoard.removeChild(fuelDiv);
        // Update the gridmap and add the fuel score to the computer's score
        showAlert("Killer scores" + increaseFuel, 500);
        newKillerScore += parseInt(increaseFuel);
        // Decrease the fuel count and end the game if there is no fuel left
        fuelCount -= 1;
        if (fuelCount == 0) {
          updateStatus();
          if (newUserScore == newKillerScore) {
            showAlert("No fuels left! Draw!", 5000);
            return;
          } else {
            showAlert("No fuels left! You win!", 5000);
            return;
          }
        }
      }
      // Update the game status
      updateStatus();
    }
  }
}
// Update the user interface with the current game status
function updateStatus() {
  userScore.innerHTML = newUserScore;
  killerScore.innerHTML = newKillerScore;
  gamenRounds.innerHTML = roundCount;
  remainingFuel.innerHTML = currentFuel;
}
// End the game and show a message on the screen
function endGame(argStr) {
  gameStage = 1;
  if (argStr === undefined) {
    argStr = "";
  }
  // Remove the event listener for keyboard control
  window.removeEventListener("keydown", controlSubmarine);
  // Update the text of the button on the screen
  startButton.innerHTML = "SETUP";
  // Show a message to the user
  showAlert("You ended the game!", 2000);
}
// Show an alert message on the screen
function showAlert(msg, duration) {
  // Create a new DIV element with the message text
  var alertDiv = document.createElement("DIV");
  var alertText = document.createTextNode(msg);
  alertDiv.appendChild(alertText);
  alertDiv.setAttribute("class", "alerting");
  alertDiv.setAttribute("id", "alert");

  // Add the new DIV element to the game wrapper
  gameCanvas.appendChild(alertDiv);

  // Remove the DIV element after a specified duration
  setTimeout(function () {
    var alertDiv = document.getElementById("alert");
    gameCanvas.removeChild(alertDiv);
  }, duration);
}
// The function that handles the click event on the game field
function fieldClick() {
  var selectedDiv = document.getElementById("selected");

  selectedLeft = parseInt(selectedDiv.style.left.split("px")[0]);
  selectedTop = parseInt(selectedDiv.style.top.split("px")[0]);

  // Check if the clicked position on the grid has already been set
  if (gameMap[selectedLeft / 64][selectedTop / 64] != 0) {
    showAlert("This place has already been set!", 1500);
    return;
  }
  gameBoard.removeEventListener("mousemove", fieldMouseOver);
  gameBoard.removeEventListener("click", fieldClick);
  selectedDiv.style.borderColor = "red";
  window.addEventListener("keydown", fieldConfig);
}

// The function that handles the configuration of the game field
function fieldConfig(event) {
  var hasProcessed = false;
  // If the key pressed is a number between 1 and 9, place a fuel object on the grid
  if (event.key >= "5" && event.key <= "9") {
    gameMap[selectedLeft / 64][selectedTop / 64] = event.key;
    fuelCount += 1;
    placeObject("fuel-" + event.key);
    hasProcessed = true;
  }
  // If the key pressed is not a number, check which key was pressed and place the corresponding object on the grid
  else {
    switch (event.key) {
      case "Escape":
        hasProcessed = true;
        break;
              // If the key pressed is "k", place a killer object on the grid
      case "k":
        gameMap[selectedLeft / 64][selectedTop / 64] = -1;
        killerPosition.push(selectedLeft / 64);
        killerPosition.push(selectedTop / 64);
        placeObject("killer");
        hasProcessed = true;
        break;
      // If the key pressed is "o", place an obstacle object on the grid
      case "o":
        gameMap[selectedLeft / 64][selectedTop / 64] = 1000;
        placeObject("obstacle");
        hasProcessed = true;
        break;
      // If the key pressed is "u", place a submarine object on the grid
      case "u":
        if (userPosition.length == 0) {
          gameMap[selectedLeft / 64][selectedTop / 64] = -2;
          userPosition.push(selectedLeft / 64);
          userPosition.push(selectedTop / 64);
          placeObject("submarine");
          hasProcessed = true;
        } else {
          showAlert("Your submarine has already been placed!", 1500);
        }
        break;
      // If none of the above keys were pressed, show an alert with instructions
      default:
        showAlert("Please use keys instructed below", 1000);
        break;
    }
  }
  // Has been processed
  if (hasProcessed) {
    // remove hint & selected div
    removeBorderDiv();
    // remove listener
    window.removeEventListener("keydown", fieldConfig);
    // add listeners
    gameBoard.addEventListener("mousemove", fieldMouseOver);
    gameBoard.addEventListener("click", fieldClick);
  }
}
// remove the border and selected divs
function removeBorderDiv() {
  // remove hint div with 1500 duration
  var child = document.getElementById("hint" + 1500);
  if (child != null) {
    gameBoard.removeChild(child);
  }
  // remove hint div with 1500 duration again
  child = document.getElementById("hint" + 1500);
  if (child != null) {
    gameBoard.removeChild(child);
  }
  // remove hint div with 750 duration
  child = document.getElementById("hint" + 750);
  if (child != null) {
    gameBoard.removeChild(child);
  }
  // remove hint div with 1500 duration yet again
  child = document.getElementById("hint" + 1500);
  if (child != null) {
    gameBoard.removeChild(child);
  }
  // remove the selected div
  child = document.getElementById("selected");
  if (child != null) {
    gameBoard.removeChild(child);
  }
}
// place objects in the field grid
function placeObject(obj) {
  // create image element
  var objectImg = document.createElement("IMG");
  objectImg.setAttribute("src", "images/" + obj + ".png");

  // create div for object and set attributes
  var objectDiv = document.createElement("DIV");
  objectDiv.setAttribute("class", "objectdiv");
  // set id attribute for user object
  if (obj == "submarine") {
    objectDiv.setAttribute("id", "user");
  }
  // set id attribute for killer objects
  if (obj == "killer") {
    objectDiv.setAttribute(
      "id",
      "killer" + selectedLeft / 64 + selectedTop / 64
    );
  }
  // set id attribute for fuel object
  if (obj.split("-")[0] == "fuel") {
    objectDiv.setAttribute("id", "fuel" + selectedLeft / 64 + selectedTop / 64);
  }
  // set position attributes for object div
  objectDiv.style.left = selectedLeft + "px";
  objectDiv.style.top = selectedTop + "px";
  // append image to object div
  objectDiv.appendChild(objectImg);

  // append object div to field grid
  gameBoard.appendChild(objectDiv);
}
// track mouse move and select the grid it belongs to
function fieldMouseOver(event) {
  var child = document.getElementById("selected");
  if (child != null) {
    gameBoard.removeChild(child);
  }

  // create a shadowing div
  var rect = gameBoard.getBoundingClientRect();
  var xOffset = Math.floor((event.pageX - rect.left) / 64) * 64;
  var yOffset = Math.floor((event.pageY - rect.top) / 64) * 64;
  var borderDiv = document.createElement("DIV");
  borderDiv.setAttribute("class", "borderdiv");
  borderDiv.setAttribute("id", "selected");
  borderDiv.style.left = xOffset + "px";
  borderDiv.style.top = yOffset + "px";
  gameBoard.appendChild(borderDiv);
}
