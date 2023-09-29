const readline = require("readline-sync");
const MESSAGE = require('./tttBonus_messages.json');

const INITIAL_MARKER = ' ';
const HUMAN_MARKER = 'X';
const COMPUTER_MARKER = 'O';
const WINS_NEEDED = 5;
const MIDDLE_SQUARE = '5';
let currentPlayer;

const WINNING_LINES = [
  [1, 2, 3], [4, 5, 6], [7, 8, 9], // rows
  [1, 4, 7], [2, 5, 8], [3, 6, 9], // columns
  [1, 5, 9], [3, 5, 7]             // diagonals
];

function prompt(msg) {
  console.log(`=> ${msg}`);
}

function joinOr(arr, delimiter = ', ', word = 'or') {
  switch (arr.length) {
    case 0:
      return '';
    case 1:
      return `${arr[0]}`;
    case 2:
      return arr.join(` ${word} `);
    default:
      return arr.slice(0,arr.length - 1).join(delimiter) +
             `${delimiter}${word} ${arr[arr.length - 1]}`;
  }
}

function displayBoard(board) {
  console.clear();

  console.log(`You are ${HUMAN_MARKER}. Computer is ${COMPUTER_MARKER}`);

  console.log('');
  console.log('     |     |');
  console.log(`  ${board['1']}  |  ${board['2']}  |  ${board['3']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['4']}  |  ${board['5']}  |  ${board['6']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['7']}  |  ${board['8']}  |  ${board['9']}`);
  console.log('     |     |');
  console.log('');
}

function initializeBoard() {
  let board = {};

  for (let square = 1; square <= 9; square++) {
    board[String(square)] = INITIAL_MARKER;
  }

  return board;
}

function emptySquares(board) {
  return Object.keys(board).filter(key => board[key] === ' ');
}

function playerChoosesSquare(board) {
  let square;

  while (true) {
    prompt(`Choose a square: ${joinOr(emptySquares(board))}`);
    square = readline.question().trim();
    if (emptySquares(board).includes(square)) break;

    prompt(MESSAGE.notValid);
  }

  board[square] = HUMAN_MARKER;
}

function findAtRiskSquare(line, board, marker) {
  let markersInLine = line.map(square => board[square]);

  if (markersInLine.filter(val => val === marker).length === 2) {
    let unusedSquare = line.find(square => board[square] === INITIAL_MARKER);
    if (unusedSquare !== undefined) {
      return unusedSquare;
    }
  }
  return null;
}

function computerChoosesSquare(board) {
  let square;

  for (let index = 0; index < WINNING_LINES.length; index += 1) {
    let line = WINNING_LINES[index];
    square = findAtRiskSquare(line, board, COMPUTER_MARKER);
    if (square) break;
  }

  if (!square) {
    for (let index = 0; index < WINNING_LINES.length; index += 1) {
      let line = WINNING_LINES[index];
      square = findAtRiskSquare(line, board, HUMAN_MARKER);
      if (square) break;
    }
  }

  if (!square && board[MIDDLE_SQUARE] === INITIAL_MARKER) {
    square = MIDDLE_SQUARE;
  }

  if (!square) {
    let randomIndex = Math.floor(Math.random() * emptySquares(board).length);
    square = emptySquares(board)[randomIndex];
  }
  board[square] = COMPUTER_MARKER;
}

function boardFull(board) {
  return emptySquares(board).length === 0;
}

function someoneWon(board) {
  return detectWinner(board);
}

function detectWinner(board) {

  for (let line = 0; line < WINNING_LINES.length; line++) {
    let [ sq1, sq2, sq3 ] = WINNING_LINES[line];

    if (
      board[sq1] === HUMAN_MARKER &&
        board[sq2] === HUMAN_MARKER &&
        board[sq3] === HUMAN_MARKER
    ) {
      return 'Player';
    } else if (
      board[sq1] === COMPUTER_MARKER &&
        board[sq2] === COMPUTER_MARKER &&
        board[sq3] === COMPUTER_MARKER
    ) {
      return 'Computer';
    }
  }

  return null;
}

function chooseSquare(board, currentPlayer) {
  if (currentPlayer === 'Player') {
    return playerChoosesSquare(board);
  } else if (currentPlayer === 'Computer') {
    return computerChoosesSquare(board);
  }
  return null;
}

function alternatePlayer(currentPlayer) {
  if (currentPlayer === 'Player') {
    return 'Computer';
  } else if (currentPlayer === 'Computer') {
    return 'Player';
  }
  return null;
}

while (true) {

  prompt(MESSAGE.first);
  let choice = readline.question().trim();

  while (choice !== 'Player' && choice !== 'Computer') {
    prompt(MESSAGE.invalidFirst);
    choice = readline.question().trim();
  }

  let obj = {
    Player: 0,
    Computer: 0
  };

  while (true) {

    let board = initializeBoard();
    currentPlayer = choice;

    while (true) {
      displayBoard(board);
      console.log(`Player score: ${obj['Player']}. Computer Score: ${obj['Computer']}`);
      chooseSquare(board, currentPlayer);
      currentPlayer = alternatePlayer(currentPlayer);
      if (someoneWon(board) || boardFull(board)) break;
    }

    displayBoard(board);

    if (someoneWon(board)) {
      prompt(`${detectWinner(board)} won!`);
      obj[detectWinner(board)] += 1;
      prompt(`Player score: ${obj['Player']}. Computer Score: ${obj['Computer']}`);
    } else {
      prompt(MESSAGE.tie);
    }

    if (obj[detectWinner(board)] === WINS_NEEDED) {
      prompt(`${detectWinner(board)} is the grand winner!`);
      break;
    }

    prompt(MESSAGE.nextRound);
    let response = readline.question().toLowerCase();
    while (response !== 'y' && response !== 'n') {
      prompt(MESSAGE.invalidNext);
      response = readline.question().toLowerCase();
    }
    if (response === 'n') break;
  }

  prompt(MESSAGE.again);
  let answer = readline.question().toLowerCase();
  while (answer !== 'y' && answer !== 'n') {
    prompt('Invalid answer. Play again (y or n)');
    answer = readline.question().toLowerCase();
  }
  if (answer === 'n') break;
}

prompt(MESSAGE.thanks);