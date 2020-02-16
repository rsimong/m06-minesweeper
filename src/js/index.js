import '../css/reset.css';
import '../css/minesweeper.css';

const welcomeScreen = document.getElementById('game-welcome');
const customLevelField = welcomeScreen.getElementsByClassName('custom-level')[0];

const gameScreen = document.getElementById('game-board');
let board;
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

const gameMenu = document.querySelector('#game-welcome>.container>.section--new-game>.section--new-game--content>form');
const levelOptions = gameMenu.querySelectorAll('.levels>label>input');

const gameHistory = document.querySelector('#game-welcome>.container>.section--history-results');

initApp();

function initApp() {
    [...levelOptions].slice(0, (levelOptions.length - 1)).forEach((lvl) => {
        lvl.addEventListener('click', () => {
            initGame(9, lvl.value);
            welcomeScreen.classList.add('is-hidden');
            gameScreen.classList.remove('is-hidden');
        }, false);
    });

    levelOptions[(levelOptions.length - 1)].addEventListener('click', () => {
        customLevelField.classList.remove('is-hidden');
        if (!gameHistory.classList.contains('is-hidden')) {
            gameHistory.classList.add('is-hidden');
        }
        const input = customLevelField.querySelector('input');
        input.focus();
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const iValue = e.target.value;
                if (/\d+/.test(iValue)) {
                    initGame(9, parseFloat(iValue));
                    welcomeScreen.classList.add('is-hidden');
                    gameScreen.classList.remove('is-hidden');
                }
            }
        }, false);
    }, false);

    renderHistory();
}

function checkIfExistHistoryStored() {
    if (localStorage.getItem('gm-history')) {
        const results = JSON.parse(localStorage.getItem('gm-history'));
        if (typeof results === 'object') {
            if (results.length === 0) {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
    return true;
}

function renderHistory() {
    if (checkIfExistHistoryStored()) {
        if (gameHistory.classList.contains('is-hidden')) {
            gameHistory.classList.remove('is-hidden');
        }
    } else {
        if (!gameHistory.classList.contains('is-hidden')) {
            gameHistory.classList.add('is-hidden');
        }
        return;
    }

    let html = '<ul class="history-list">';
    JSON.parse(localStorage.getItem('gm-history')).forEach((log, index) => {
        if (index < 5) {
            const minutes = Math.trunc(log.time / 60);
            const seconds = log.time % 60;
            const printTime = `${(minutes > 0) ? `${minutes}m` : ''} ${(seconds > 0) ? `${seconds}s` : '0s'}`.trim();
            html += `<li class="hl--item">
                <div class="hl--item--pos">
                    ${(index === 0) ? '<i class="fas fa-crown"></i>' : ''}
                    ${(index === 1 || index === 2) ? '<i class="fas fa-medal"></i>' : ''}
                </div>
                <div class="hl--item--username">
                    <span>${log.username}</span>
                </div>
                <div class="hl--item--bombs">
                    <i class="fas fa-bomb"></i>
                    <span>${log.numBombs}</span>
                </div>
                <div class="hl--item--time">
                    <i class="far fa-clock"></i>
                    <span>${printTime}</span>
                </div>
            </li>`;
        }
    });
    html += '</ul>';
    gameHistory.getElementsByClassName('section--history-results--list')[0].innerHTML = html;
}

function initGame(grids, difficulty = 'normal') {
    gameScreen.innerHTML = `<div class="g-actions">
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
    board = gameScreen.querySelector('.g-board');
    actionsBoard = gameScreen.querySelector('.g-actions');
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
        numBombs = (chosenDifficulty < (gridsNumbers ** 2)) ? chosenDifficulty : (gridsNumbers ** 2) - 1;
    }
    numBombs = Math.round(numBombs);
    bombsCounter.innerHTML = numBombs;
    possibleGrids = (gridsNumbers ** 2) - numBombs;
    return numBombs;
}

function generateBombs() {
    const numBombs = calcNumOfBombs();
    const availableGrids = [];
    virtualBoard.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            availableGrids.push([rowIndex, colIndex]);
        });
    });
    for (let i = 0; i < numBombs; i++) {
        const pos = Math.floor(Math.random() * (availableGrids.length - 1));
        virtualBoard[availableGrids[pos][0]][availableGrids[pos][1]] = -1;
        availableGrids.splice(pos, 1);
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
            grid.addEventListener('click', (e) => {
                e.stopPropagation();
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
    } else {
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
    if (!vGameOver) {
        vGameOver = true;
        let isWinner = false;
        if (!board.classList.contains('game-over')) {
            board.classList.add('game-over');
        }
        if (uncoveredGrids === possibleGrids) {
            if (!board.classList.contains('is-winner')) {
                board.classList.add('is-winner');
                isWinner = true;
                updateWinnerLogs();
            }
        } else {
            if (!board.classList.contains('is-loser')) {
                board.classList.add('is-loser');
            }
        }
        showBoardDetails();
        setTimeout(() => {
            renderGameOverIcon(isWinner);
        }, 800);
    }
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

function renderGameOverIcon(isWinner) {
    let icon = '<i class="fas fa-frown-open"></i>';
    if (isWinner) {
        icon = '<i class="fas fa-grin-beam"></i>';
    }
    actionsBoard.querySelector('.g-actions--timer').insertAdjacentHTML('afterend', `
        <div class="g-actions--btn-restart">${icon}</div>
    `);
    actionsBoard.querySelector('.g-actions--btn-restart').addEventListener('click', () => {
        location.reload();
    }, false);
}

function updateWinnerLogs() {
    let logs = [];
    const d = new Date();
    if (localStorage.getItem('gm-history')) {
        logs = JSON.parse(localStorage.getItem('gm-history'));
    }
    logs.push({
        username: `anonymous #${logs.length + 1}`,
        numBombs: ((gridsNumbers ** 2) - possibleGrids),
        time: gameTime,
        date: `${d.toISOString()}`,
    });
    logs.sort((a, b) => {
        if (a.time > b.time) {
            return 1;
        }
        if (a.time < b.time) {
            return -1;
        }
        return 0;
    });
    localStorage.setItem('gm-history', JSON.stringify(logs));
}
