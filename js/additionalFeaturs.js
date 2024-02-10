'use strict'

var gManuallyMines

/// MINES COUNT ///

function renderMinesCount() {
    const exposedMines = gLives - gGame.lives
    const elMines = document.querySelector('.mines')
    elMines.innerText = gLevel.mines - gGame.markedCount - exposedMines
}

/// LIVES ///

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

/// HINTS ///

function renderHints() {
    var strHTML = '<tr>'
    for (let i = 0; i < 3; i++) {
        strHTML += `<td class="hint" title="hint" onclick="onHintClick(this)">${HINT_IMG}</td>`
    }
    strHTML += '</tr>'
    document.querySelector('.hints').innerHTML = strHTML
}

function onHintClick(elHint) {
    if (gManuallyMinesMode) return
    gGame.hintMode = true
    elHint.classList.add('illuminate')
}

function handleHintMode(rowIdx, colIdx) {
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
                }, 1000)
            }
        }
    }
    document.querySelector('.illuminate').innerText = ''
    document.querySelector('.illuminate').classList.remove('illuminate')
}

/// MEGA HINT ///

function handleMegaHint(i, j) {
    gMegaHint.countClicks++
    if (gMegaHint.countClicks === 1) {
        gMegaHint.cell1 = { i, j }
    } else if (gMegaHint.countClicks === 2) {
        gMegaHint.cell2 = { i, j }
    }
    if (!gMegaHint.cell2) return
    gGame.megaHintMode = false
    megaHintMode()
}

function renderMegaHint() {
    const elMegaHint = document.querySelector('.mega-hint button')
    elMegaHint.classList.remove('used')
}

function onMegaHintClick(elMegaHint) {
    if (gManuallyMinesMode) return
    if (gMegaHint.countClicks) return
    gGame.megaHintMode = true
}

function megaHintMode() {
    for (let i = gMegaHint.cell1.i; i <= gMegaHint.cell2.i; i++) {
        for (let j = gMegaHint.cell1.j; j <= gMegaHint.cell2.j; j++) {
            const currCell = gBoard[i][j]
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
                    const elMegaHint = document.querySelector('.mega-hint button')
                    elMegaHint.classList.add('used')
                }, 2000)
            }
        }
    }
}

/// SAFE CLICKS ///

function renderSafeClicks() {
    const elRemainClicks = document.querySelector('.remain-clicks span')
    elRemainClicks.innerText = gGame.safeClicks
}

function onSafeClick() {
    if (gGame.shownCount === gLevel.size ** 2 - gLevel.mines) return
    if (!gGame.safeClicks) return 
    gGame.safeClicks -= 1
    var randCell = getRandCell()
    while (gBoard[randCell.i][randCell.j].isMine || gBoard[randCell.i][randCell.j].isShown) {
        randCell = getRandCell()
    }
    const elSafeCell = document.querySelector(`.cell-${randCell.i}-${randCell.j}`)
    elSafeCell.classList.add('highlight')
    setTimeout(() => {
        elSafeCell.classList.remove('highlight')
        if (!gGame.safeClicks) document.querySelector('.safe-click button').classList.add('used')
    }, 1000)

    renderSafeClicks()
}

/// MANUAL MINES POSITIONING ///

function onManuallyMines() {
    gManuallyMinesMode = true
    gManuallyMines = 0
    onInit()
    renderManuallyMines()
}

function userSetMines(elCell, i, j) {
    const clickedCell = gBoard[i][j]
    if (clickedCell.isMine) return
    clickedCell.isMine = true
    renderCell({ i, j }, MINE)
    gManuallyMines++
    renderManuallyMines()
    if (gManuallyMines === gLevel.mines) {
        setTimeout(() => {
            gManuallyMinesMode = false
            gManuallyMines = 0
            setMinesNegsCount()
            renderBoard()
            return
        }, 300)
    }
}

function renderManuallyMines() {
    var htmlStr
    if (!(gLevel.mines - gManuallyMines)) {
        htmlStr = `Mines sre set!`
    } else {
        htmlStr = `${gLevel.mines - gManuallyMines} mines left`
    }
    const elRemainMines = document.querySelector('.manual-mines h6')
    elRemainMines.innerHTML = htmlStr
}

/// MINES EXTERMINATOR ///

function onExterminator() {
    if (gGame.shownCount > 0) return
    if (gLevel.size === 4) return
    if (gGame.isExterminatorUsed) return
    gGame.isExterminatorUsed = true
    for (let i = 0; i < 3; i++) {
        var randIdx = getRandomInt(0, gMinesLocations.length)
        var randMine = gMinesLocations[randIdx]
        gBoard[randMine.i][randMine.j].isMine = false
        gMinesLocations.splice(randIdx, 1)
    }
    gLevel.mines -= 3
    setMinesNegsCount()
    renderBoard()
    renderMinesCount()
    setTimeout(disableExterminator, 500)
}

function disableExterminator() {
    var extIcon = document.querySelector('.exterminator')
    extIcon.classList.add('used')
}

/// UNDO ///

function onUndo() {
    if (!gMoves.length) return
    const lastMove = gMoves.pop() // lastMove = {elCell, currCell, i, j}
    gGame = gGameStates.pop()

    gBoard[lastMove.i][lastMove.j] = lastMove.currCell

    lastMove.elCell.classList.remove('mine')
    lastMove.elCell.classList.remove('marked')
    lastMove.elCell.classList.remove('shown')
    renderCell({ i: lastMove.i, j: lastMove.j }, '')
    renderGame()
}

/// DARK MODE ///

function onDarkMode() {
    const elDarkModeBtn = document.querySelector('.dark-mode-btn')
    const elBody = document.querySelector('body')
    const elModal = document.querySelector('.modal')
    if (gDarkMode) {
        elBody.style.backgroundColor = '#d1cac1b3'
        elBody.style.color = 'black'
        elDarkModeBtn.innerText = 'Dark Mode'
        elModal.style.backgroundColor = 'rgb(222 217 211)'
    } else {
        elBody.style.backgroundColor = 'rgb(40 40 40)'
        elBody.style.color = 'white'
        elDarkModeBtn.innerText = 'Light Mode'
        elModal.style.backgroundColor = 'rgb(40 40 40 / 96%)'
    }
    gDarkMode = !gDarkMode
}