'use strict'

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

function setBestScore() {
    var currMinutes = 60 * +document.querySelector('.minutes').innerText
    var currSeconds = +document.querySelector('.seconds').innerText
    var currTimeInSec = currMinutes + currSeconds

    switch (gLevel.size) {
        case 4:
            if (currTimeInSec < (localStorage.begScore || Infinity)) {
                localStorage.begScore = currTimeInSec
                gBestScores.beginner = localStorage.begScore
            }
            break
        case 8:
            if (currTimeInSec < (localStorage.interScore || Infinity)) {
                localStorage.interScore = currTimeInSec
                gBestScores.intermediate = localStorage.interScore
            }
            break
        case 12:
            if (currTimeInSec < (localStorage.expScore || Infinity)) {
                localStorage.expScore = currTimeInSec
                gBestScores.expert = localStorage.expScore
            }
            break
    }
}

function renderBestScores() {
    document.querySelector('.beg-best-score').innerText = gBestScores.beginner || '-'
    document.querySelector('.inter-best-score').innerText = gBestScores.intermediate || '-'
    document.querySelector('.exp-best-score').innerText = gBestScores.expert || '-'
}