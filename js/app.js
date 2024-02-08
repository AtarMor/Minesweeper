'use strict'

const MINE = '*'
const EMPTY = ''
const FLAG = '🚩'
const SMILEY = '😃'
const LOSS = '🤯'
const VICTORY = '😎'
const HINT_IMG = '<img src="img/hint.png">'

var gGame
var gBoard
var gLevel = {
    size: 4,
    mines: 2
}
var gTimerInterval
var gLives
var gMegaHint
var gManuallyMinesMode = false
var gBestScores = {
    beginner: localStorage.begScore,
    intermediate: localStorage.interScore,
    expert: localStorage.expScore
}

function onInit() {
    hideModal()
    restartTimer()
    gLives = gLevel.mines > 2 ? 3 : 2
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        lives: gLives,
        hintMode: false,
        megaHintMode: false,
        safeClicks: 3,
    }
    gMegaHint = {
        countClicks: 0,
        cell1: '',
        cell2: ''
    }
    gBoard = buildBoard()
    setMinesLocations()
    setMinesNegsCount()

    renderGame()
}

function renderGame() {
    renderBoard()
    renderLives()
    renderHints()
    renderMegaHint()
    renderSafeClicks()
    renderBestScores()

    const elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerText = SMILEY

    const elRemainMines = document.querySelector('h6.remain-mines')
    elRemainMines.innerHTML = 'position Mines'
}

function buildBoard() {
    const board = []
    for (let i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (let j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard() {
    var strHTML = ''
    for (let i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (let j = 0; j < gBoard[0].length; j++) {
            const cell = ""
            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}" onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(event,${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function setMinesNegsCount() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].minesAroundCount = countNegsMines(i, j)
        }
    }
}

function countNegsMines(rowIdx, colIdx) {
    var negsCount = 0

    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue

            var currCell = gBoard[i][j]
            if (currCell.isMine) negsCount++
        }
    }
    return negsCount
}

function setMinesLocations() {
    if (gManuallyMinesMode) return

    for (let i = 0; i < gLevel.mines; i++) {
        var randCell = getRandCell()
        while (gBoard[randCell.i][randCell.j].isMine) {
            randCell = getRandCell()
        }
        gBoard[randCell.i][randCell.j].isMine = true
    }
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    if (gManuallyMinesMode) return userSetMines(elCell, i, j)
    if (gGame.megaHintMode) return handleMegaHint(i, j)
    if (gGame.hintMode) return handleHintMode(i, j)

    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine && gGame.shownCount === 0) onInit()

    if (gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        elCell.classList.add('mine')
        renderCell({ i, j }, MINE)
        reduceLives()
        if (!gGame.lives) return gameOver()
    } else {
        expandShown(i, j)
    }

    checkVictory()
}

function onCellMarked(ev, i, j) {
    ev.preventDefault()
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        renderCell({ i, j }, FLAG)
        checkVictory()
        return
    }

    gBoard[i][j].isMarked = false
    gGame.markedCount--
    renderCell({ i, j }, '')
}

function expandShown(rowIdx, colIdx) {
    if (rowIdx < 0 || rowIdx >= gBoard.length) return
    if (colIdx < 0 || colIdx >= gBoard[0].length) return
    if (gBoard[rowIdx][colIdx].isShown) return

    gBoard[rowIdx][colIdx].isShown = true
    gGame.shownCount++
    startTimer()
    const elCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
    elCell.classList.add('shown')

    if (gBoard[rowIdx][colIdx].minesAroundCount) {
        renderCell({ i: rowIdx, j: colIdx }, gBoard[rowIdx][colIdx].minesAroundCount)
        return
    }
    renderCell({ i: rowIdx, j: colIdx }, '')

    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            expandShown(i, j)
        }
    }
}

function checkVictory() {
    const exposedMines = gLives - gGame.lives
    if (gGame.markedCount + exposedMines !== gLevel.mines) return
    if (gGame.shownCount - exposedMines !== gLevel.size ** 2 - gLevel.mines) return
    const elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerText = VICTORY
    endGame('You Won!')

    setBestScore()
    renderBestScores()
}

function gameOver() {
    const elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerText = LOSS
    revealAllMines()
    endGame('Game Over!')
}

function revealAllMines() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) renderCell({ i, j }, MINE)
        }
    }
}

function endGame(msg) {
    clearInterval(gTimerInterval)
    const elModalH3 = document.querySelector('.modal h3')
    elModalH3.innerText = msg
    showModal()
    gManuallyMinesMode = false
    gCountMines = 0
    gGame.isOn = false
}

function onRestart() {
    gManuallyMinesMode = false
    gCountMines = 0
    onInit()
}

function onChangeLevel(size, mines) {
    gLevel.size = size
    gLevel.mines = mines
    gManuallyMinesMode = false
    gCountMines = 0
    onInit()
}

function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}