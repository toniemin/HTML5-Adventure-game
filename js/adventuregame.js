
/*
 * Program constants.
 * 
 */
const COIN100 = "url('img/coin100.png')";
const COIN500 = "url('img/coin500.png')";
const COIN1000 = "url('img/coin1000.gif')";
const PLAYER_AVATAR_DEFAULT = "url('img/player.png')";
const PLAYER_AVATAR_MLG = "url('img/player_mlg.gif')";

/*
 * Handles for error output, player name output and score output.
 * 
 */
const ERROR_OUT = document.getElementById("output");
const NAME_OUT = document.getElementById("pl-name");
const SCORE_OUT = document.getElementById("pl-score");

/*
 * Class representing a point in the game grid.
 */
class Point
{
  constructor(x, y)
  {
    this.x = (x !== undefined ? x : 0);
    this.y = (y !== undefined ? y : 0);
  }
}

/*
 * Class representing a coin in the game grid.
 * Attributes:
 *    x and y: location in the game grid.
 *    value: value of the coin (100, 500 or 1000)
 *    img: coin image (determined by value).
 */
class Coin
{
  constructor(value, x, y)
  {
    this.value = value;
    this.x = x;
    this.y = y;
    switch (value)
    {
      case 500:
        this.img = COIN500;
        break;
      case 1000:
        this.img = COIN1000;
        break;
      default:
        this.img = COIN100;
    }
  }
}

/*
 * Important variables!
 * 
 */
// These variables are initialized in the init()-function and never changed again.
let grid_size = 3; // Game grid size.
let num_of_coins = grid_size / 2; // Number of coins in the grid.
let coin_move_freq = 30 / grid_size; // How frequently the coins change places.
// These values save information about the player.
let playerImg = PLAYER_AVATAR_DEFAULT; // Player image.
let pl = new Point(1, 1); // Player current location.
let pl_last = new Point(0, 0); // Player previous location.
// These variables keep track of the coins and player's score.
let score = 0; // Player score.
// Map that keeps track of all the coins in the game grid.
// Note: keys are in the format "[x],[y]".
let coins = new Map();
let move_counter = coin_move_freq; // When this reaches zero, changes coin places.

/*
 * Initialize the game!
 */
function init()
{
  //Add event listeners to all the buttons.
  document.getElementById("up-btn").addEventListener('click', movePlayer);
  document.getElementById("right-btn").addEventListener('click', movePlayer);
  document.getElementById("down-btn").addEventListener('click', movePlayer);
  document.getElementById("left-btn").addEventListener('click', movePlayer);
  document.getElementById("name-btn").addEventListener('click', changeName);
  // Also listen to keypresses.
  document.addEventListener('keydown', movePlayer);

  // Ask user for grid size.
  let size = prompt("Enter grid size (2-10):", "3");

  // Set size. If user value is invalid, use default (3).
  if (size !== null && size >= 2 && size <= 10)
  {
    grid_size = size;
  }
  else
  {
    grid_size = 3;
  }

  // Initialize variables that are defined by grid size.
  num_of_coins = Math.floor(grid_size / 2);
  coin_move_freq = Math.floor(30 / grid_size);

  // Generate the game grid.
  generateGrid(grid_size);

  // Insert first coins.
  insertCoins();
  
  // Place player in the middle of the grid.
  pl = new Point( Math.floor(grid_size / 2), Math.floor(grid_size / 2) );
  
  // Make everything display.
  refresh();
}
init();

/*
 * Handler function for the "Change"-button next to the player name.
 * Prompts user for a name-input and replaces the current one if the new name
 * is at least 2 characters long.
 */
function changeName()
{
  let nameStr = prompt("Enter a name:", NAME_OUT.textContent);
  if (nameStr !== null && nameStr.length >= 2)
  {
    NAME_OUT.textContent = nameStr;

    // Easter egg.
    if (nameStr.toLowerCase() === "mlg")
    {
      playerImg = PLAYER_AVATAR_MLG;
      draw(playerImg, new Point(pl.x, pl.y));
    }
  }
}

/*
 * Generates the game area. Size is determined by the variable gridSize.
 * The game area is a grid that consists divs. 
 * The row-divs are given the class "row", while the column-divs are given the
 * classes "col block". Column-divs are given unique ids that are determnined
 * by their place in the grid. (For example: div in the center of a (3x3) grid
 * would have id value "b11").
 */
function generateGrid(gridSize)
{
  let container = document.getElementById("grid");
  
  for (let i = 0; i < gridSize; i++)
  {
    let row = document.createElement("div");
    row.setAttribute("class", "row justify-content-center");
    
    for (let j = 0; j < gridSize; j++)
    {
      let col = document.createElement("div");
      col.setAttribute("class", "col block"); // Set class (for CSS).
      col.setAttribute("id", "b" + i + "" + j); // Set id for functionality.
      row.appendChild(col);
    }
    
    container.appendChild(row);
  }
}

/*
 * Find block with id "b[place.x][place.y]" from the html-document
 * and set its background to img.
 */
function draw(img, place)
{
  let id = "b" + place.x + "" + place.y;
  document.getElementById(id).style.backgroundImage = img;
}

/*
 * Find block with id "b[place.x][place.y]" from the html-document
 * and remove its background.
 */
function erase(place)
{
  let id = "b" + place.x + "" + place.y;
  document.getElementById(id).style.backgroundImage = "none";
}

/*
 * Return a random Point in the game grid that isn't occupied 
 * by a coin or the player.
 */
function randomPlace()
{
  let x = 0;
  let y = 0;
  do
  {
    x = Math.floor(Math.random() * (grid_size));
    y = Math.floor(Math.random() * (grid_size));
  }
  while ((pl.x === x && pl.y === y) || (coins.has(x + "," + y)));

  return (new Point(x, y));
}

/*
 * Draw player on the grid, update score and insert new coins 
 * if all of them have been collected.
 */
function refresh()
{
  draw(playerImg, pl);
  if (! coins.has(pl_last.x + "," + pl_last.y)) // Don't erase coins.
  {
    erase(pl_last);
  }
  
  if (coins.has(pl.x + "," + pl.y))
  {
    // Get coin.
    let key = pl.x + "," + pl.y;
    let coin = coins.get(key);
    // Update score.
    score += coin.value;
    SCORE_OUT.textContent = "" + score;

    // Remove picked coin.
    coins.delete(key);

    // If there are no more coins in the grid, insert more.
    if (coins.size === 0)
    {
      insertCoins();
    }
  }
}

/*
 * Inserts num_of_coins-amount of coins into the grid in random locations.
 */
function insertCoins()
{
  for (let i = 0; i <= num_of_coins; i++)
  {
    // Get coin place.
    let place = randomPlace();
    
    let x = place.x;
    let y = place.y;

    // Get coin value.
    let value = 100; // default
    let chance = Math.random();
    if (chance < 0.1)
    {
      value = 1000;
    }
    else if (chance < 0.4)
    {
      value = 500;
    }

    // Create a coin.
    let coin = new Coin(value, x, y);
    // Save the coin in the map use string "x,y" as key.
    coins.set((x + "," + y), coin);

    // Insert coin in the randomed location.
    draw(coin.img, place);
  }
}

/*
 * Chooses a random coin in the game grid and changes its location.
 */
function moveCoins()
{
  // Get a random coin.
  let index = Math.floor(Math.random() * coins.size);
  let coin;
  let i = 0;
  for (let [key, value] of coins)
  {
    if (i === index)
    {
      coin = value;
      break;
    }
    else
    {
      i++;
    }
  }

  // Get current place and erase it.
  let x = coin.x;
  let y = coin.y;
  erase(new Point(x, y));
  coins.delete(x + "," + y);

  // Random a new place.
  let place = randomPlace();
  x = place.x;
  y = place.y;

  // Insert coin into the new place.
  coin.x = x;
  coin.y = y;
  coins.set((x + "," + y), coin);
  draw(coin.img, place);
}

/*
 * Move player according to the button/key press that created the event.
 * Also move coins into new places and call refresh()-function to draw the player.
 */
function movePlayer(e)
{
  // Determine whether source was a keypress or a button.
  let source = "";
  if (e.target.type === "button")
    source = e.target.id;
  else
  {
    source = e.key;
  }

  // Move according to the user command
  // aka call move-function with different parameters.
  let x = 0, y = 0;
  switch (source)
  {
    case "ArrowUp":
      e.preventDefault();
    case "up-btn":
      x = pl.x - 1;
      y = pl.y;
      break;
    case "ArrowRight":
      e.preventDefault();
    case "right-btn":
      x = pl.x;
      y = pl.y + 1;
      break;
    case "ArrowDown":
      e.preventDefault();
    case "down-btn":
      x = pl.x + 1;
      y = pl.y;
      break;
    case "ArrowLeft":
      e.preventDefault();
    case "left-btn":
      x = pl.x;
      y = pl.y - 1;
      break;
    default:
      // Unknown command, exit function.
      return;
  }
  
  // Change player's location if the move was valid.
  if (x >= 0 && x < grid_size && y >= 0 && y < grid_size)
  {
    // Update previous location.
    pl_last.x = pl.x;
    pl_last.y = pl.y;
    // Set current location.
    pl.x = x;
    pl.y = y;

    // Determine whether to move coins around.
    if (move_counter === 0)
    {
      move_counter = 5;
      if (coins.size > 0)
        moveCoins();
    }
    else
    {
      move_counter--;
    }
  }
  
  refresh();
}

