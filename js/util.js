'use strict'

function getRandCell() {
    const i = getRandomInt(0, gLevel.size)
    const j = getRandomInt(0, gLevel.size)
    return { i, j }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
}