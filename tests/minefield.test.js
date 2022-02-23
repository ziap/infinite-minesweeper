import MineField from '../src/minefield.js'
import { jest } from '@jest/globals'

window.HTMLMediaElement.prototype.play = () => {}

describe('MineField', () => {
    it('Can be instantiated', () => {
        // Arrange
        const minefield = new MineField(0.25)

        // Assert
        expect(minefield).toBeDefined()
        expect(minefield).toBeInstanceOf(MineField)
        expect(minefield.density).toEqual(0.25)
    })

    it('Has a safe first click', () => {
        // Arrange
        const minefield = new MineField(0.25)

        // Act
        minefield.primary_action(0, 0)

        // Assert
        for (const i of [-1, 0, 1]) {
            for (const j of [-1, 0, 1]) {
                expect(minefield.data[i + ',' + j]).toBeDefined()
                expect(minefield.data[i + ',' + j].is_mine).toEqual(false)
            }
        }
    })

    it('Can flag', () => {
        // Arrange
        const minefield = new MineField(1)

        // Act
        minefield.primary_action(0, 0)
        for (let i = 2; i < 100; i++) minefield.secondary_action(0, i)

        // Assert
        for (let i = 2; i < 100; i++) expect(minefield.data[0 + ',' + i].flagged).toEqual(true)
    })

    it('Can unflag', () => {
        // Arrange
        const minefield = new MineField(1)

        // Act
        minefield.primary_action(0, 0)
        for (let i = 2; i < 100; i++) {
            minefield.secondary_action(0, i)
            minefield.secondary_action(0, i)
        }

        // Assert
        for (let i = 2; i < 100; i++) expect(minefield.data[0 + ',' + i].flagged).toEqual(false)
    })

    it("Can't flag revealed tiles", () => {
        // Arrange
        const minefield = new MineField(1)

        // Act
        minefield.primary_action(0, 0)
        minefield.secondary_action(0, 1)

        // Assert
        expect(minefield.data['0,1'].explored).toEqual(true)
        expect(minefield.data['0,1'].flagged).toEqual(false)
    })

    it("Can't reveal flagged files", () => {
        // Arrange
        const minefield = new MineField(1)

        // Act
        minefield.primary_action(0, 0)
        minefield.secondary_action(0, 2)
        minefield.primary_action(0, 2)

        // Assert
        expect(minefield.data['0,2'].flagged).toEqual(true)
        expect(minefield.data['0,2'].explored).toEqual(false)
    })

    it('Can hit a mine', () => {
        // Arrange
        const minefield = new MineField(1)

        // Act
        minefield.primary_action(0, 0)
        minefield.primary_action(0, 3)

        // Assert
        expect(minefield.game_over).toEqual(true)
    })

    it('Can invert click', () => {
        // Arrange
        const minefield = new MineField(1)

        // Act
        minefield.primary_action(0, 0)
        minefield.invert_button.checked = true
        minefield.primary_action(0, 3)

        // Assert
        expect(minefield.data['0,3'].flagged).toEqual(true)
    })

    it('Can click tile to open all adjacent tiles', () => {
        // Arrange
        const minefield = new MineField(0.25)

        minefield.data = {
            '0,0': { is_mine: false, explored: true, flagged: false, mines: 1 },
            '0,1': { is_mine: true, explored: false, flagged: true },
            '0,-1': { is_mine: false, explored: false, flagged: false },
            '1,0': { is_mine: false, explored: false, flagged: false },
            '1,1': { is_mine: false, explored: false, flagged: false },
            '1,-1': { is_mine: false, explored: false, flagged: false },
            '-1,0': { is_mine: false, explored: false, flagged: false },
            '-1,1': { is_mine: false, explored: false, flagged: false },
            '-1,-1': { is_mine: false, explored: false, flagged: false }
        }

        // Act
        minefield.primary_action(0, 0)

        // Assert
        for (const i of [-1, 0, 1]) {
            for (const j of [-1, 0, 1]) {
                const cell = minefield.data[i + ',' + j]
                expect(cell.explored || cell.flagged).toEqual(true)
            }
        }
    })

    it('Can restart', async () => {
        // Arrange
        const minefield = new MineField(0.125)

        // Act
        minefield.primary_action(0, 0)
        minefield.init(0.1)

        await new Promise(resolve => setTimeout(resolve, 500))

        // Assert
        expect(minefield.score).toEqual(0)
    })

    it('Can draw', () => {
        // Arrange
        const minefield = new MineField(1)
        const spy_draw_explored_or_flagged = jest.spyOn(minefield, 'draw_explored')
        const spy_draw_symbol = jest.spyOn(minefield, 'draw_symbol')
        const spy_draw_mine = jest.spyOn(minefield, 'draw_mine')
        const spy_draw_flag = jest.spyOn(minefield, 'draw_flag')
        const spy_draw_border = jest.spyOn(minefield, 'draw_borders')
        const spy_draw_corner = jest.spyOn(minefield, 'draw_corner')

        // Act
        minefield.data = {
            '0,0': {
                is_mine: false,
                explored: true,
                flagged: false,
                mines: 1
            },
            '1,1': {
                is_mine: false,
                explored: true,
                flagged: false,
                mines: 1
            },
            '1,-1': {
                is_mine: false,
                explored: true,
                flagged: false,
                mines: 1
            },
            '-1,1': {
                is_mine: true,
                explored: true,
                flagged: false
            },
            '-1,-1': {
                is_mine: true,
                flagged: true,
                explored: false
            }
        }
        minefield.animation = {
            '0,0': 1,
            '1,1': 1,
            '1,-1': 1,
            '-1,1': 1,
            '-1,-1': 1
        }
        minefield.draw(0)

        // Assert
        expect(spy_draw_explored_or_flagged).toHaveBeenCalled()
        expect(spy_draw_symbol).toHaveBeenCalled()
        expect(spy_draw_border).toHaveBeenCalled()
        expect(spy_draw_mine).toHaveBeenCalled()
        expect(spy_draw_flag).toHaveBeenCalled()
        expect(spy_draw_corner).toHaveBeenCalled()
    })
})
