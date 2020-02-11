import '../css/reset.css';
import '../css/minesweeper.css';

let board;
let parentBoard;
let actionsBoard;
let gridsNumbers;
let chosenDifficulty;
const virtualBoard = [];
const difficultyLevels = {
    easy: 8,
    normal: 16,
    hard: 32,
};

let bombsCounter;
let possibleGrids = 0;
let uncoveredGrids = 0;

let timer;
let gameTime = 0;
let vGameOver = false;

initGame('#game-board', 12);

function initGame(elemnt, grids, difficulty = 'normal') {
    parentBoard = document.querySelector(elemnt);
    parentBoard.innerHTML = `<div class="g-actions">
                            <div class="g-actions--timer">
                                <i class="far fa-clock"></i>
                                <span>00:00</span>
                            </div>
                            <div class="g-actions--bombs-counter">
                                <i class="fas fa-bomb"></i>
                                <span></span>
                            </div>
                        </div>
                        <div class="g-board"></div>`;
    board = parentBoard.querySelector('.g-board');
    actionsBoard = parentBoard.querySelector('.g-actions');
    timer = actionsBoard.querySelector('.g-actions--timer>span');
    bombsCounter = actionsBoard.querySelector('.g-actions--bombs-counter>span');
    gridsNumbers = grids;
    chosenDifficulty = difficulty;

    renderGameBoard();
}

function renderGameBoard() {
    let html = '';
    let timeoutTime = 0;
    for (let row = 0; row < gridsNumbers; row++) {
        html += `<div class="row" data-row="${row}">`;
        virtualBoard.push([]);
        for (let col = 0; col < gridsNumbers; col++) {
            const animationDelay = (row * 0.03) + (col * 0.03);
            html += `<div class="col" style="animation-delay: ${animationDelay}s;" data-col="${col}">
                <div class="col-content"></div>
            </div>`;
            virtualBoard[row].push(0);
            timeoutTime = (animationDelay * 1000) + 500;
        }
        html += '</div>';
    }
    board.innerHTML = html;
    generateBombs();
    actionsBoard.style.animationDelay = `${timeoutTime / 1000}s`;
    setTimeout(() => {
        setTimeout(() => {
            initTimer();
        }, 1000);
    }, timeoutTime);
}

function calcNumOfBombs() {
    let numBombs = 0;
    if (typeof chosenDifficulty === 'string') {
        if (difficultyLevels[chosenDifficulty] !== undefined) {
            numBombs = (difficultyLevels[chosenDifficulty] / 100) * (gridsNumbers ** 2);
        } else {
            numBombs = (difficultyLevels.normal / 100) * (gridsNumbers ** 2);
        }
    } else if (typeof chosenDifficulty === 'number') {
        numBombs = chosenDifficulty;
    }
    numBombs = Math.round(numBombs);
    bombsCounter.innerHTML = numBombs;
    possibleGrids = (gridsNumbers ** 2) - numBombs;
    return numBombs;
}

function generateBombs() {
    const numBombs = calcNumOfBombs();
    let assignedBombs = 0;
    while (assignedBombs < numBombs) {
        const row = Math.floor(Math.random() * (gridsNumbers - 1));
        const col = Math.floor(Math.random() * (gridsNumbers - 1));
        if (virtualBoard[row][col] !== -1) {
            virtualBoard[row][col] = -1;
            assignedBombs++;
        }
    }
    generateCounters();
}

function generateCounters() {
    for (let row = 0; row < gridsNumbers; row++) {
        for (let col = 0; col < gridsNumbers; col++) {
            if (virtualBoard[row][col] === -1) {
                const scope = [
                    [(row - 1), (col - 1)],
                    [(row - 1), col],
                    [(row - 1), (col + 1)],
                    [row, (col - 1)],
                    [row, (col + 1)],
                    [(row + 1), (col - 1)],
                    [(row + 1), col],
                    [(row + 1), (col + 1)],
                ];
                scope.forEach((coordinates) => {
                    if (virtualBoard[coordinates[0]] !== undefined) {
                        if (virtualBoard[coordinates[0]][coordinates[1]] !== undefined) {
                            if (virtualBoard[coordinates[0]][coordinates[1]] !== -1) {
                                virtualBoard[coordinates[0]][coordinates[1]] += 1;
                            }
                        }
                    }
                });
            }
        }
    }
    assignActions();
    // showBoardDetails();
}

function assignActions() {
    for (let row = 0; row < gridsNumbers; row++) {
        for (let col = 0; col < gridsNumbers; col++) {
            const grid = board.querySelector(`.row:nth-child(${(row + 1)})>.col:nth-child(${(col + 1)})`);
            grid.addEventListener('click', () => {
                discoverGrid(grid, row, col);
            }, false);
            grid.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                pointGrid(grid);
            }, false);
        }
    }
}

function discoverGrid(grid, row, col) {
    if (!vGameOver) {
        if (!grid.classList.contains('is-opened')) {
            grid.classList.add('is-opened');
            showGridDetails(row, col);
            clearNearShadow(row, col);
            checkResult(row, col);
        }
    }
}

function pointGrid(grid) {
    if (!vGameOver) {
        if (!grid.classList.contains('is-opened')) {
            if (grid.classList.contains('is-marked')) {
                grid.classList.remove('is-marked');
                grid.querySelector('div').innerHTML = '';
            } else {
                grid.classList.add('is-marked');
                grid.querySelector('div').innerHTML = '<i class="fas fa-flag"></i>';
            }
        }
    }
}

function showBoardDetails() {
    for (let row = 0; row < gridsNumbers; row++) {
        for (let col = 0; col < gridsNumbers; col++) {
            showGridDetails(row, col);
        }
    }
}

function showGridDetails(row, col) {
    let colValue = '';
    if (virtualBoard[row][col] === -1) {
        colValue = '<i class="fas fa-bomb"></i';
        board.querySelector(`.row:nth-child(${(row + 1)})>.col:nth-child(${(col + 1)})`).classList.add('bomb-activated');
    } else if (virtualBoard[row][col] > 0) {
        colValue = `<span>${virtualBoard[row][col]}</span>`;
        uncoveredGrids++;
    }
    board.querySelector(`.row:nth-child(${(row + 1)})>.col:nth-child(${(col + 1)})>div`).innerHTML = colValue;
}

function clearNearShadow(row, col) {
    if (virtualBoard[row][col] !== -1) {
        const scope = [
            [(row - 1), (col - 1)],
            [(row - 1), col],
            [(row - 1), (col + 1)],
            [row, (col - 1)],
            [row, (col + 1)],
            [(row + 1), (col - 1)],
            [(row + 1), col],
            [(row + 1), (col + 1)],
        ];
        scope.forEach((coordinates) => {
            if (virtualBoard[coordinates[0]] !== undefined) {
                if (virtualBoard[coordinates[0]][coordinates[1]] !== undefined) {
                    if (virtualBoard[coordinates[0]][coordinates[1]] !== -1) {
                        if (!board.querySelector(`.row:nth-child(${(coordinates[0] + 1)})>.col:nth-child(${(coordinates[1] + 1)})`).classList.contains('is-opened')) {
                            board.querySelector(`.row:nth-child(${(coordinates[0] + 1)})>.col:nth-child(${(coordinates[1] + 1)})`).classList.add('is-opened');
                            let colValue = '';
                            if (virtualBoard[coordinates[0]][coordinates[1]] > 0) {
                                colValue = virtualBoard[coordinates[0]][coordinates[1]];
                            }
                            board.querySelector(`.row:nth-child(${(coordinates[0] + 1)})>.col:nth-child(${(coordinates[1] + 1)})>div`).innerHTML = colValue;
                            uncoveredGrids++;
                        }
                    }
                }
            }
        });
    }
}

function checkResult(row, col) {
    if (virtualBoard[row][col] !== -1) {
        if (uncoveredGrids === possibleGrids) {
            gameOver();
        }
    } else {
        gameOver();
    }
}

function gameOver() {
    if (uncoveredGrids === possibleGrids) {
        console.log('You\'ve won!');
    } else {
        console.log('Game Over!');
    }
    showBoardDetails();
    if (!board.classList.contains('game-over')) {
        board.classList.add('game-over');
    }
    vGameOver = true;
}

function initTimer() {
    gameTime++;
    const minutes = Math.trunc(gameTime / 60);
    const printMinutes = (minutes > 9) ? minutes : `0${minutes}`;
    const seconds = gameTime % 60;
    const printSeconds = (seconds > 9) ? seconds : `0${seconds}`;
    timer.innerHTML = `${printMinutes}:${printSeconds}`;
    setTimeout(() => {
        if (!vGameOver) {
            initTimer();
        }
    }, 1000);
}
