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
    let restartButton;

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
    restartButton.style.display = "none";
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

    for (const box of tttBoxes) {
        box.textContent = "";
    }
    messageBox.textContent = "📌 Select who you're playing as.";
    messageBox.style.color = "rgba(82, 82, 82, 1)";
    playAsO.style.display = "flex";
    playAsX.style.display = "flex";
    container.style.display = "none";
    restartButton.style.display = "none";
    newGameButton.style.display = "none";

    tttBoard = [["","",""],["","",""],["","",""]];
    currentPlayer = "O";
    computerPlayer = "";
    firstOMoveDone = false;
    gameOver = false;
}

// optimal AI move
function getBestMove() {
    // special case: AI is O, O in center, X in a corner, all other spaces empty
    if (computerPlayer === "O") {
        const center = tttBoard[1][1];
        if (center === "O") {
            const corners = [
                [0,0], [0,2], [2,0], [2,2]
            ];
            // find which corner X is in
            for (const [i,j] of corners) {
                if (tttBoard[i][j] === "X") {
                    // count non-empty squares
                    const nonEmpty = tttBoard.flat().filter(v => v !== "").length;
                    // only trigger if there are exactly 2 non-empty (O in center + X in corner)
                    if (nonEmpty === 2) {
                        const opposite = [2-i, 2-j];
                        if (tttBoard[opposite[0]][opposite[1]] === "") {
                            return opposite; // place O in opposite corner
                        }
                    }
                }
            }
        }
    }

    // general logic
    let bestScore = -Infinity;
    let bestMoves = [];

    const allEmptySquares = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (tttBoard[i][j] === "") allEmptySquares.push([i, j]);
        }
    }

    for (const [i, j] of allEmptySquares) {
        tttBoard[i][j] = computerPlayer;
        let score = minimax(tttBoard, 0, false, computerPlayer);
        tttBoard[i][j] = "";

        if (score > bestScore) {
            bestScore = score;
            bestMoves = [[i, j]];
        } else if (score === bestScore) {
            bestMoves.push([i, j]);
        }
    }

    // Tie-breaker: prefer center > corners > edges
    const preferredOrder = [
        [1,1],             
        [0,0], [0,2], [2,0], [2,2], 
        [0,1], [1,0], [1,2], [2,1]  
    ];

    for (const pref of preferredOrder) {
        for (const move of bestMoves) {
            if (move[0] === pref[0] && move[1] === pref[1]) return move;
        }
    }

    return bestMoves[0];
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
    restartButton = document.getElementById("restart");

    playAsO.addEventListener('click', function() {
        computerPlayer = "O";
        firstOMoveDone = false;
        messageBox.textContent = "✅ Computer will make the best plays for O";
        messageBox.style.color = "rgba(82, 82, 82, 1)";
        container.style.display = "flex";
        playAsO.style.display = "none";
        playAsX.style.display = "none";
        restartButton.style.display = "flex";
    });
    playAsX.addEventListener('click', function() {
        computerPlayer = "X";
        firstOMoveDone = false;
        messageBox.textContent = "✅ Computer will make the best plays for X";
        messageBox.style.color = "rgba(82, 82, 82, 1)";
        container.style.display = "flex";
        playAsO.style.display = "none";
        playAsX.style.display = "none";
        restartButton.style.display = "flex";
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

            // normal user turn: user plays whenever it's NOT computerPlayer's turn
            if (currentPlayer !== computerPlayer) {
                if (makeMove(parseInt(box.id))) {
                    // if it's now the computer's turn, let AI move
                    if (!gameOver && currentPlayer === computerPlayer) {
                        const [i, j] = getBestMove();
                        const boxNum = i * 3 + j + 1; // convert row/col → box id (1–9)
                        makeMove(boxNum);
                    }
                }
            }
        });
    }

    restartButton.addEventListener('click', function() {
        resetGame();
    });
    newGameButton.addEventListener('click', function() {
        resetGame();
    });
});

