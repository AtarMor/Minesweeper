'use strict'

var gCountMines

function renderLives() {
    var livesStr = ''
    for (let i = 0; i < gGame.lives; i++) {
        livesStr += '❤️'
        document.querySelector('.lives').innerText = livesStr
    }
}

function reduceLives() {
    gGame.lives -= 1
    renderLives()
}

function renderHints() {
    var strHTML = '<tr>'
    for (let i = 0; i < 3; i++) {
        strHTML += `<td class="hint" onclick="onHintClick(this)">${HINT_IMG}</td>`
    }
    strHTML += '</tr>'
    document.querySelector('.hints').innerHTML = strHTML
}

function onHintClick(elHint) {
    if (gManuallyMinesMode) return
    gGame.hintMode = true
    elHint.classList.add('illuminate')
}

function hintMode(rowIdx, colIdx) {
    gGame.hintMode = false
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            if (!currCell.isShown) {
                const elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.classList.add('shown')
                if (gBoard[i][j].isMine) {
                    renderCell({ i, j }, MINE)
                } else if (gBoard[i][j].minesAroundCount) {
                    renderCell({ i, j }, gBoard[i][j].minesAroundCount)
                } else {
                    renderCell({ i, j }, '')
                }

                setTimeout(() => {
                    elCell.classList.remove('shown')
                    renderCell({ i, j }, '')
                    document.querySelector('.illuminate').innerText = ''
                }, 1000)
            }
        }
    }
}

function renderSafeClicks() {
    const elRemainClicks = document.querySelector('.remain-clicks span')
    elRemainClicks.innerText = gGame.safeClicks
}

function onSafeClick() {
    if (gGame.shownCount === gLevel.size ** 2 - gLevel.mines) return
    if (!gGame.safeClicks) return
    var randCell = getRandCell()
    while (gBoard[randCell.i][randCell.j].isMine) {
        randCell = getRandCell()
    }
    const elSafeCell = document.querySelector(`.cell-${randCell.i}-${randCell.j}`)
    elSafeCell.classList.add('highlight')
    renderCell({ i: randCell.i, j: randCell.j }, '')
    setTimeout(() => {
        console.log('hi')
        elSafeCell.classList.remove('highlight')
        renderCell({ i: randCell.i, j: randCell.j }, '')
    }, 1000)

    gGame.safeClicks -= 1
    renderSafeClicks()
}

function onManuallyMines() {
    gManuallyMinesMode = true
    gCountMines = 0
    onInit()
    renderManuallyMines()
}

function userSetMines(elCell, i, j) {
    const clickedCell = gBoard[i][j]
    clickedCell.isMine = true
    renderCell({ i, j }, MINE)
    gCountMines++
    renderManuallyMines()
    if (gCountMines === gLevel.mines) {
        setTimeout(() => {
            gManuallyMinesMode = false
            gCountMines = 0
            setMinesNegsCount()
            renderBoard()
            return
        }, 300)
    }
}

function renderManuallyMines() {
    var htmlStr
    if (!(gLevel.mines - gCountMines)) {
        htmlStr = `Mines sre set! Start Playing!`
    } else {
        htmlStr = `${gLevel.mines - gCountMines} mines to position`
    }
    const elRemainMines = document.querySelector('.remain-mines span')
    elRemainMines.innerHTML = htmlStr
}