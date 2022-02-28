import Game from '../src/game.js'
import crypto from 'crypto'

window.crypto = crypto

window.document.body.innerHTML = `
    <div id="menu-checker"></div>
    <div id="game-config">
    <div id="grid"></div>
    <div id="invert"></div>
    <div id="score"></div>
`

describe('Game', () => {
    it('Can be instantiated', () => {
        // Arrange
        const game = new Game()

        // Assert
        expect(game).toBeDefined()
        expect(game).toBeInstanceOf(Game)
        expect(game.minefield.density).toEqual(0.2)
    })
})
