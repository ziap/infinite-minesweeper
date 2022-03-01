import TileMap from './tilemap.js'
import { BOMB_IMG, FLAG_IMG, FLAG_AUDIO, CLEAR_AUDIO } from './assets.js'

/**
 * Store the data of a cell.  
 * Might implement bitboard representation later for efficiency.
 * Still wondering if bitboard representation with getters/setters
 * are more efficient than object representation.
 */
class Cell {
    explored = false
    is_mine = false
    flagged = false
    mines = 0

    constructor(is_mine, is_flagged) {
        this.is_mine = is_mine
        this.flagged = is_flagged
    }
}

/**
 * The color palette for the numbers
 */
const COLORS = ['#262626', '#60a5fa', '#4ade80', '#f87171', '#c084fc', '#facc15', '#2dd4bf', '#ffffff', '#a3a3a3']

/**
 * The class representing a minefield.  
 * It is responsible for creating the grid, handling most of the game logic, and drawing the grid.  
 * It also creates and hydrates the inverse button and score display.
 * @extends TileMap
 */
export default class MineField extends TileMap {
    density = 0.25
    first_click = true
    game_over = false
    score = 0
    invert_button = document.createElement('input')
    score_display = document.createElement('h1')

    /**
     * @type {{[key: string]: Cell}}
     */
    data = {}

    constructor(new_density) {
        super()
        this.invert_button.type = 'checkbox'
        this.invert_button.id = 'invert'
        this.invert_button.hidden = true
        this.score_display.id = 'score'
        this.init(new_density)
    }

    /**
     * Handle the left (primary) click on a cell.  
     * Also restart the game if it's over.
     * @param {number} x
     * @param {number} y
     */
    primary_action(x, y) {
        // Clone the audio element to avoid multiple audio elements playing at the same time causing earrape.
        const audio = CLEAR_AUDIO.cloneNode(true)
        if (this.game_over) this.init(this.density)
        else {
            if (this.data[x + ',' + y] !== undefined && this.data[x + ',' + y].explored) {
                // The cell is already explored.

                // Count the number of adjacent cells that are flagged.
                let flagged = 0
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (this.data[x + i + ',' + (y + j)].flagged) flagged++
                    }
                }

                // If the number of flagged cells is equal to the number of mines, then clear the adjacent cells.
                // Note that if the cells are incorrectly flagged, this will click a mine and lose the game.
                if (flagged === this.data[x + ',' + y].mines) {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            this.explore(x + i, y + j, audio)
                        }
                    }
                }

                // TODO: Highlight the adjacent unexplored cells if the number of them aren't equal to the number of mines.
            } else {
                // If inverse is checked, flag the cell (mainly for mobile).
                // First click is always a primary action whether or not inverse is checked.
                if (this.invert_button.checked && !this.first_click) this.flag(x, y)
                else this.explore(x, y, audio)
            }
        }
    }

    /**
     * Simply flag the cell if it isn't already explored and restart the game if it's over.
     * @param {number} x
     * @param {number} y
     */
    secondary_action(x, y) {
        if (this.game_over) this.init(this.density)
        else this.first_click ? this.explore(x, y, CLEAR_AUDIO.cloneNode(true)) : this.flag(x, y)
    }

    /**
     * Get the animation frame for the cell.  
     * The tilemap have already prevented the frame from going higher than 1  
     * so we can just prevent the frame from going lower than 0.  
     * May need to change the way it handles the animation later.
     * @param {number} x
     * @param {number} y
     * @returns {number} The animation frame
     */
    get_tween(x, y) {
        let tween = 1
        if (this.animation[x + ',' + y] !== undefined) tween = Math.max(0, this.animation[x + ',' + y])
        if (!(this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged)) tween = 1 - tween

        return tween
    }

    /**
     * The bezier curve function to ease the animation.
     * @param {number} x The animation frame
     * @returns {number} The eased value of the animation frame
     */
    bezier(x) {
        return x * x * (3 - 2 * x)
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} radius
     * @param {string} color
     */
    rounded_rectangle(x, y, width, height, radius, color) {
        x *= this.cell_size
        y *= this.cell_size
        width *= this.cell_size
        height *= this.cell_size
        radius *= this.cell_size
        if (width < 2 * radius) radius = width / 2
        if (height < 2 * radius) radius = height / 2
        this.ctx.fillStyle = color
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = 0.02 * this.cell_size
        this.ctx.beginPath()
        this.ctx.moveTo(x + radius, y)
        this.ctx.arcTo(x + width, y, x + width, y + height, radius)
        this.ctx.arcTo(x + width, y + height, x, y + height, radius)
        this.ctx.arcTo(x, y + height, x, y, radius)
        this.ctx.arcTo(x, y, x + width, y, radius)
        this.ctx.fill()
        this.ctx.stroke()
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    draw_mine(x, y) {
        if (this.animation[x + ',' + y] < 0.2) return
        this.rounded_rectangle(x + 0.1, y + 0.1, 0.8, 0.8, 0.1, '#dc2626')
        this.ctx.drawImage(
            BOMB_IMG,
            (x + 0.25) * this.cell_size,
            (y + 0.25) * this.cell_size,
            0.5 * this.cell_size,
            0.5 * this.cell_size
        )
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    draw_flag(x, y) {
        const tween = this.bezier(this.get_tween(x, y))
        this.ctx.globalAlpha = tween
        this.ctx.drawImage(
            FLAG_IMG,
            (x + 0.25) * this.cell_size,
            (y - 0.2 * (1 - tween) + 0.25) * this.cell_size,
            0.5 * this.cell_size,
            0.5 * this.cell_size
        )
        this.ctx.globalAlpha = 1
    }

    /**
     * Draw a rounded corner at the intersection of two diagonal adjacent cells.
     * @param {number} x
     * @param {number} y
     * @param {number} x1
     * @param {number} y1
     */
    draw_corner(x, y, x1, y1) {
        this.ctx.fillStyle = '#262626'
        this.ctx.strokeStyle = '#262626'
        this.ctx.lineWidth = 0.02 * this.cell_size
        this.ctx.beginPath()
        this.ctx.moveTo(x * this.cell_size, y * this.cell_size)
        this.ctx.lineTo(x * this.cell_size, y1 * this.cell_size)
        this.ctx.lineTo(x1 * this.cell_size, y1 * this.cell_size)
        this.ctx.arcTo(
            x * this.cell_size,
            y1 * this.cell_size,
            x * this.cell_size,
            y * this.cell_size,
            0.1 * this.cell_size
        )
        this.ctx.fill()
        this.ctx.stroke()
    }

    /**
     * Draw the background of the explored cells.
     * @param {[[number, number], Cell][]} entries The cells that need to be drawn
     */
    draw_explored(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.explored) {
                this.ctx.fillStyle = '#262626'
                this.ctx.strokeStyle = '#262626'
                this.ctx.lineWidth = 0.02 * this.cell_size

                if (this.get_tween(x, y) < 0.2) continue
                this.rounded_rectangle(x + 0.5 - 0.6, y + 0.5 - 0.6, 1.2, 1.2, 0.1, '#262626')

                // If there is an adjacent diagonal cell that is also explored, draw a rounded corner.
                if (!this.explored(x + 1, y)) {
                    if (this.explored(x + 1, y - 1)) {
                        this.draw_corner(x + 1.1, y + 0.2, x + 1.2, y + 0.1)
                    }
                    if (this.explored(x + 1, y + 1)) {
                        this.draw_corner(x + 1.1, y + 0.8, x + 1.2, y + 0.9)
                    }
                }
                if (!this.explored(x - 1, y)) {
                    if (this.explored(x - 1, y - 1)) {
                        this.draw_corner(x - 0.1, y + 0.2, x - 0.2, y + 0.1)
                    }
                    if (this.explored(x - 1, y + 1)) {
                        this.draw_corner(x - 0.1, y + 0.8, x - 0.2, y + 0.9)
                    }
                }

                this.ctx.globalAlpha = 1
            }
        }
    }

    /**
     * Draw the symbols of the cells.  
     * A symbol is either a number, a flag, or a mine.
     * @param {[[number, number], Cell][]} entries The cells that need to be drawn
     */
    draw_symbol(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.is_mine && cell.explored) this.draw_mine(x, y)
            else if (!cell.explored) this.draw_flag(x, y)
            else if (cell.mines > 0) {
                if (this.get_tween(x, y) < 0.2) continue
                this.ctx.fillStyle = COLORS[cell.mines]
                const font_size = 0.6 * this.cell_size
                this.ctx.font = font_size + 'px Arial'
                this.ctx.textAlign = 'center'
                this.ctx.textBaseline = 'middle'
                this.ctx.fillText(cell.mines, (x + 0.5) * this.cell_size, (y + 0.5) * this.cell_size)
            }
        }
    }

    /**
     * Draw borders around an explored cells.  
     * Does not draw borders if the animation is still in the first stage.
     * @param {[[number, number], Cell][]} entries
     */
    draw_borders(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.explored && this.get_tween(x, y) >= 0.2) {
                this.ctx.strokeStyle = '#737373'
                this.ctx.lineCap = 'round'
                this.ctx.lineWidth = 0.02 * this.cell_size
                this.ctx.globalAlpha = Math.min(this.ctx.lineWidth, 1)
                this.ctx.beginPath()
                this.ctx.moveTo(x * this.cell_size, (y + 0.2) * this.cell_size)
                this.ctx.lineTo(x * this.cell_size, (y + 0.8) * this.cell_size)
                this.ctx.stroke()

                this.ctx.beginPath()
                this.ctx.moveTo((x + 0.2) * this.cell_size, y * this.cell_size)
                this.ctx.lineTo((x + 0.8) * this.cell_size, y * this.cell_size)
                this.ctx.stroke()

                this.ctx.beginPath()
                this.ctx.moveTo((x + 1) * this.cell_size, (y + 0.2) * this.cell_size)
                this.ctx.lineTo((x + 1) * this.cell_size, (y + 0.8) * this.cell_size)
                this.ctx.stroke()

                this.ctx.beginPath()
                this.ctx.moveTo((x + 0.2) * this.cell_size, (y + 1) * this.cell_size)
                this.ctx.lineTo((x + 0.8) * this.cell_size, (y + 1) * this.cell_size)
                this.ctx.stroke()

                this.ctx.globalAlpha = 1
            }
        }
    }

    /**
     * Draw an overlay over the cells with unfinished animation.  
     * Essentially, this is the animation of the cells being revealed.
     * @param {[[number, number], Cell][]} entries
     */
    draw_overlay(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.explored) {
                const tween = this.get_tween(x, y)
                if (tween >= 1) continue

                // The animation is split into two stages:
                // 1. In the first stage, the cell gets bigger, overlapping the adjacent cells,
                //    hiding the fact that we haven't made the animations for the rounded corner and shit.
                // 2. In the second stage, the cell gets smaller until it completely disappears,
                //    showing the mine if there is one, and the number of adjacent mines otherwise.
                // Of course this looks like shit, but idk how to do it better.
                if (tween < 0.2) {
                    const partial = this.bezier(tween / 0.2)

                    this.rounded_rectangle(
                        x + 0.1 - 0.3 * partial,
                        y + 0.1 - 0.3 * partial,
                        0.8 + 0.6 * partial,
                        0.8 + 0.6 * partial,
                        0.1,
                        '#fed7aa'
                    )
                } else {
                    const partial = this.bezier((tween - 0.2) / 0.8)

                    this.rounded_rectangle(
                        x - 0.2 + 0.7 * partial,
                        y - 0.2 + 0.7 * partial,
                        1.4 - 1.4 * partial,
                        1.4 - 1.4 * partial,
                        0.1,
                        '#fed7aa'
                    )
                }
            }
        }
    }

    /**
     * Draw the cells.
     * TODO: improve performance with:
     * - Some sort of caching
     * - Level of detail
     * - More sofisticated canvas drawing
     * - WebGL I guess
     * @param {[[number, number], Cell][]} entries
     */
    draw_grid(entries) {
        this.draw_explored(entries)
        this.draw_symbol(entries)
        this.draw_borders(entries)
        this.draw_overlay(entries)
        this.score_display.textContent = this.score
        if (this.game_over) this.canvas.classList.add('game-over')
    }

    /**
     * @param {number} new_density
     */
    init(new_density) {
        this.density = new_density
        this.data = {}
        this.animation = {}
        this.score = 0
        this.first_click = true
        this.game_over = false
        this.canvas.classList.remove('game-over')
    }

    /**
     * Note: don't use this for the game logic, this is only for drawing
     * because this function only returns true after the first stage of the
     * reveal animation is done.
     * @param {number} x
     * @param {number} y
     * @returns {boolean} Whether the cell is explored
     */
    explored(x, y) {
        return (
            this.animation[x + ',' + y] !== undefined &&
            this.data[x + ',' + y] !== undefined &&
            this.data[x + ',' + y].explored &&
            this.animation[x + ',' + y] >= 0.2
        )
    }

    /**
     * Check if the cell is a mine.  
     * Works for both explored and unexplored cells.  
     * This only matters when you explore a cell, so the cell is both a
     * mine and not a mine until itself or an adjacent cell is explored.
     * @param {number} x
     * @param {number} y
     * @returns {boolean} Whether the cell is a mine
     */
    is_mine(x, y) {
        if (this.data[x + ',' + y] === undefined) this.data[x + ',' + y] = new Cell(Math.random() < this.density, false)
        return this.data[x + ',' + y].is_mine
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {HTMLAudioElement} audio
     */
    explore(x, y, audio) {
        // Create a new cell if it doesn't exist yet.
        // This is also the only time to check for first click.
        if (this.data[x + ',' + y] === undefined) {
            if (this.first_click) {
                // The 3x3 area around the first click doesn't have mines to give the player a head start.
                // However the 5x5 area around the first click has almost the same amount of mines as any 5x5 area around any other cell.
                // This doesn't work for higher densities, but I don't care.
                const rest_mines = Math.min((25 * this.density) / 16, 1)
                for (let i = x - 2; i <= x + 2; i++) {
                    for (let j = y - 2; j <= y + 2; j++) {
                        this.data[i + ',' + j] = new Cell(false, false)
                        if (Math.abs(x - i) === 2 || Math.abs(y - j) === 2) {
                            this.data[i + ',' + j].is_mine = Math.random() < rest_mines
                        }
                    }
                }
            } else this.is_mine(x, y)
        }

        // Queue for BFS in case the cell doesn't have any adjacent mines.
        const queue = [[x, y, 0]]

        if (!this.data[x + ',' + y].explored && !this.data[x + ',' + y].flagged) {
            audio.play()
        }

        // The only reason why we use BFS instead of just using recursive DFPS is because
        // we want the cells to be revealed in the right order for the animation.
        while (queue.length > 0) {
            const [x, y, depth] = queue.shift()

            if (this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged) continue
            this.data[x + ',' + y].explored = true
            this.animation[x + ',' + y] = -0.2 * depth + (this.first_click ? 0.2 : 0)
            if (this.data[x + ',' + y].is_mine) {
                this.game_over = true
                return
            }

            this.score++

            this.data[x + ',' + y].mines = 0

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue
                    if (this.is_mine(x + i, y + j)) {
                        this.data[x + ',' + y].mines++
                    }
                }
            }

            // If the cell doesn't have any adjacent mines, queue the adjacent cells to be explored.
            if (this.data[x + ',' + y].mines === 0) {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue
                        queue.push([x + i, y + j, depth + 1])
                    }
                }
            }
        }

        this.first_click = false
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    flag(x, y) {
        if (this.data[x + ',' + y] === undefined) this.data[x + ',' + y] = new Cell(false, false)
        if (!this.data[x + ',' + y].explored) {
            FLAG_AUDIO.cloneNode(true).play()
            this.data[x + ',' + y].flagged = !this.data[x + ',' + y].flagged
            if (this.animation[x + ',' + y] === undefined) this.animation[x + ',' + y] = 0
            else this.animation[x + ',' + y] = 1 - this.animation[x + ',' + y]
        }
    }
}
