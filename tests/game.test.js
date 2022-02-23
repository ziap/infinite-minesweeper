import Game from '../src/game.js'
import crypto from 'crypto'

window.crypto = crypto

window.document.body.innerHTML = `
    <div id="menu"></div>
    <div id="grid"></div>
    <div id="invert"></div>
    <div id="score"></div>
`

describe('Game', () => {
    it('Can be instantiated', () => {
        // Arrange
        const game = new Game(0.25)

        // Assert
        expect(game).toBeDefined()
        expect(game).toBeInstanceOf(Game)
        expect(game.minefield.density).toEqual(0.25)
    })
})
