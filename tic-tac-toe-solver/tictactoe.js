//------------------------------------------------------------------------
// GLOBAL VARIABLES

    // persistent variables
    //               0  1  2
    let tttBoard = [["","",""],  // 0
                    ["","",""],  // 1
                    ["","",""]]; // 2
    let currentPlayer = "O";
    let computerPlayer = "";      // renamed from yourPlayer
    let firstOMoveDone = false;
    let gameOver = false;

    // variables that get reinstantiated on page load
    let playAsO;
    let playAsX;
    let container;
    let messageBox;
    let newGameButton;

//------------------------------------------------------------------------
// FUNCTIONS

// make move in box
function makeMove(boxNum) {
    if (computerPlayer === "") {
        messageBox.textContent = "⚠️ Please choose to play as X or O first!";
        messageBox.style.color = "yellow";
        return false;
    }

    if (gameOver) return false;

    const rowIndex = Math.floor((boxNum - 1) / 3);
    const colIndex = (boxNum - 1) % 3;
    const boxClicked = document.getElementById(`${boxNum}`);

    if (tttBoard[rowIndex][colIndex] !== "") {
        return false; // already filled
    }

    // place move
    tttBoard[rowIndex][colIndex] = currentPlayer;
    boxClicked.textContent = currentPlayer;
    if (currentPlayer === computerPlayer) {
        boxClicked.style.color = "blue";
    }
    else {
        boxClicked.style.color = "black";
    }

    checkWinner(); // will set gameOver if someone won or drew

    // only toggle player if game not over
    if (!gameOver) {
        currentPlayer = currentPlayer === "O" ? "X" : "O";
        messageBox.textContent = `⭐ ${currentPlayer}'s turn`;
        messageBox.style.color = "rgba(82, 82, 82, 1)";
    }

    return true;
}

// check winner
function checkWinner() {
    let winningCombos =
        [[tttBoard[0][0], tttBoard[0][1], tttBoard[0][2]],
         [tttBoard[1][0], tttBoard[1][1], tttBoard[1][2]],
         [tttBoard[2][0], tttBoard[2][1], tttBoard[2][2]],
         [tttBoard[0][0], tttBoard[1][0], tttBoard[2][0]],
         [tttBoard[0][1], tttBoard[1][1], tttBoard[2][1]],
         [tttBoard[0][2], tttBoard[1][2], tttBoard[2][2]],
         [tttBoard[0][0], tttBoard[1][1], tttBoard[2][2]],
         [tttBoard[2][0], tttBoard[1][1], tttBoard[0][2]]];

    for (let combo of winningCombos) {
        if (combo[0] !== "" && combo[0] === combo[1] && combo[1] === combo[2]) {
            announceWinner(combo[0]);
            return;
        }
    }

    if (tttBoard.flat().every(box => box !== "")) {
        announceWinner("NA");
    }
}

// announce winner
function announceWinner(symbol) {
    const newGameButton = document.getElementById("new-btn");
    newGameButton.style.display = "block";
    
    gameOver = true;

    if (symbol === "NA") {
        messageBox.textContent = "😑 It's a draw.";
        messageBox.style.color = "rgba(82, 82, 82, 1)";
    } else {
        messageBox.textContent = `🎉 ${symbol} has won the game!`;
        messageBox.style.color = "#18cc00";
    }
}

// reset game
function resetGame() {
    const tttBoxes = document.getElementsByClassName("box");

    newGameButton.style.display = "none";
    for (const box of tttBoxes) {
        box.textContent = "";
    }
    messageBox.textContent = "📌 Select who you're playing as.";
    messageBox.style.color = "rgba(82, 82, 82, 1)";
    playAsO.style.display = "flex";
    playAsX.style.display = "flex";
    container.style.display = "none";

    tttBoard = [["","",""],["","",""],["","",""]];
    currentPlayer = "O";
    computerPlayer = "";
    firstOMoveDone = false;
    gameOver = false;
}

// optimal AI move
function getBestMove() {
    if (gameOver) return;

    const computer = computerPlayer;
    let bestScore = -Number.MAX_VALUE;
    let move = null;

    // AI move priority: center > corners > edges
    const moveOrder = [
        [1, 1],                   // center
        [0, 0], [0, 2], [2, 0], [2, 2], // corners
        [0, 1], [1, 0], [1, 2], [2, 1]  // edges
    ];

    for (const [i, j] of moveOrder) {
        if (tttBoard[i][j] === "") {
            tttBoard[i][j] = computer; // simulate move
            let score = minimax(tttBoard, 0, false, computer);
            tttBoard[i][j] = ""; // undo

            if (score > bestScore) {
                bestScore = score;
                move = { i, j };
            }
        }
    }

    if (move) {
        const boxNum = move.i * 3 + move.j + 1;
        currentPlayer = computer; // ensure move counts as computer's
        makeMove(boxNum);
    }
}

// minimax algorithm
function minimax(board, depth, isMaximizing, computer) {
    const result = checkWinnerForMinimax(board);
    if (result !== null) {
        if (result === "draw") return 0;
        return result === computer ? 100 - depth : -100 + depth;
    }

    if (isMaximizing) {
        let bestScore = -Number.MAX_VALUE;
        const moveOrder = [
            [1, 1], [0, 0], [0, 2], [2, 0], [2, 2],
            [0, 1], [1, 0], [1, 2], [2, 1]
        ];
        for (const [i, j] of moveOrder) {
            if (board[i][j] === "") {
                board[i][j] = computer;
                let score = minimax(board, depth + 1, false, computer);
                board[i][j] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Number.MAX_VALUE;
        const opponent = computer === "X" ? "O" : "X";
        const moveOrder = [
            [1, 1], [0, 0], [0, 2], [2, 0], [2, 2],
            [0, 1], [1, 0], [1, 2], [2, 1]
        ];
        for (const [i, j] of moveOrder) {
            if (board[i][j] === "") {
                board[i][j] = opponent;
                let score = minimax(board, depth + 1, true, computer);
                board[i][j] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// check winner for minimax
function checkWinnerForMinimax(board) {
    const winningCombos = [
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]],
        [board[0][0], board[1][0], board[2][0]],
        [board[0][1], board[1][1], board[2][1]],
        [board[0][2], board[1][2], board[2][2]],
        [board[0][0], board[1][1], board[2][2]],
        [board[2][0], board[1][1], board[0][2]],
    ];

    for (const combo of winningCombos) {
        if (combo[0] !== "" && combo[0] === combo[1] && combo[1] === combo[2]) {
            return combo[0];
        }
    }

    if (board.flat().every(box => box !== "")) return "draw";

    return null;
}

//------------------------------------------------------------------------
// SCRIPTS ON PAGE LOAD

document.addEventListener('DOMContentLoaded', () => {
    playAsO = document.getElementById("play-o");
    playAsX = document.getElementById("play-x");
    container = document.querySelector(".container");
    messageBox = document.getElementById("msg");
    newGameButton = document.getElementById("new-btn");

    playAsO.addEventListener('click', function() {
        computerPlayer = "O";
        firstOMoveDone = false;
        messageBox.textContent = "✅ Computer will make the best moves for O";
        messageBox.style.color = "rgba(82, 82, 82, 1)";
        container.style.display = "flex";
        playAsO.style.display = "none";
        playAsX.style.display = "none";
    });
    playAsX.addEventListener('click', function() {
        computerPlayer = "X";
        firstOMoveDone = false;
        messageBox.textContent = "✅ Computer will make the best moves for X";
        messageBox.style.color = "rgba(82, 82, 82, 1)";
        container.style.display = "flex";
        playAsO.style.display = "none";
        playAsX.style.display = "none";
    });

    const tttBoxes = document.getElementsByClassName("box");
    for (const box of tttBoxes) {
        box.addEventListener('click', function() {
            if (computerPlayer === "") {
                messageBox.textContent = "⚠️ Pick X or O first!";
                messageBox.style.color = "rgba(255, 81, 0, 1)";
                return;
            }

            if (gameOver) return;

            // special case: you chose O, you're placing the first O move for the computer
            if (computerPlayer === "O" && !firstOMoveDone && currentPlayer === "O") {
                if (makeMove(parseInt(box.id))) {
                    firstOMoveDone = true;
                    // after this, currentPlayer is X (your real player), so no immediate AI move
                }
                return;
            }

            // Normal user turn: user plays whenever it's NOT computerPlayer's turn
            if (currentPlayer !== computerPlayer) {
                if (makeMove(parseInt(box.id))) {
                    // if it's now the computer's turn, let AI move
                    if (!gameOver && currentPlayer === computerPlayer) {
                        getBestMove();
                    }
                }
            }
        });
    }

    newGameButton.addEventListener('click', function() {
        resetGame();
    });
});


