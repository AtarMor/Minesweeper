'use strict'

const MINE = '*'
const EMPTY = ''
const FLAG = '🚩'
const SMILEY = '😃'
const LOSS = '🤯'
const VICTORY = '😎'

var gGame
var gBoard
var gLevel = {
    size: 4,
    mines: 2
}
var gTimerInterval
var gLives

function onInit() {
    hideModal()
    restartTimer()
    gLives = gLevel.mines > 2 ? 3 : 2
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        lives: gLives,
    }
    gBoard = buildBoard()
    setMinesLocations()
    setMinesNegsCount()
    renderBoard()
    renderLives()
    const elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerText = SMILEY
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
    // board[1][1].isMine = board[2][3].isMine = true
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

function renderLives() {
    var livesStr = ''
    for (let i = 0; i < gGame.lives; i++) {
        livesStr += '❤️'
        document.querySelector('.lives').innerText = livesStr
    }
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
    if (gBoard[i][j].isMine && gGame.shownCount === 0) {
        onInit()
    }
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMine && gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine) {
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
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        renderCell({ i, j }, FLAG)
        checkVictory()
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        renderCell({ i, j }, '')
    }
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
    if (gGame.shownCount !== gLevel.size ** 2 - gLevel.mines) return
    const elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerText = VICTORY
    endGame('You Won!')
}

function gameOver() {
    const elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerText = LOSS
    endGame('Game Over!')
}

function endGame(msg) {
    clearInterval(gTimerInterval)
    const elModalH3 = document.querySelector('.modal h3')
    elModalH3.innerText = msg
    showModal()
    gGame.isOn = false
}

function onChangeLevel(size, mines) {
    gLevel.size = size
    gLevel.mines = mines
    onInit()
}

function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function startTimer() {
    if (gGame.shownCount === 1) {
        var startTime = Date.now()
        clearInterval(gTimerInterval)
        gTimerInterval = setInterval(() => {
            const timeDiff = Date.now() - startTime
            const seconds = getSeconds(timeDiff)
            const minutes = getMinutes(timeDiff)
            document.querySelector('.seconds').innerText = seconds
            document.querySelector('.minutes').innerText = minutes
        }, 1000)
    }
}

function getSeconds(timeDiff) {
    const seconds = new Date(timeDiff).getSeconds()
    return (seconds + '').padStart(2, '0')
}

function getMinutes(timeDiff) {
    const minutes = new Date(timeDiff).getMinutes()
    return (minutes + '').padStart(2, '0')
}

function restartTimer() {
    clearInterval(gTimerInterval)
    document.querySelector('.seconds').innerText = '00'
    document.querySelector('.minutes').innerText = '00'
}

function reduceLives() {
    gGame.lives += -1 
    renderLives()
}