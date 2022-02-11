import MineField from './minefield.js'

export default class Game {
    constructor(density) {
        this.minefield = new MineField(density)

        document.getElementById('grid').replaceWith(this.minefield.canvas)
        document.getElementById('invert').replaceWith(this.minefield.invert_button)
        document.getElementById('score').replaceWith(this.minefield.score_display)
    }
}
