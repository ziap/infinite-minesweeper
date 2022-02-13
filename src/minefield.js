import TileMap from './tilemap.js'

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
const BOMB_IMG = new Image()
const FLAG_IMG = new Image()

BOMB_IMG.src = `data:image/svg+xml; charset=utf8, ${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            fill="#262626"
            d="M390.5 144.1l12.83-12.83c6.25-6.25 6.25-16.37 0-22.62s-16.37-6.25-22.62 0L367.9 121.5l-35.24-35.17c-8.428-8.428-22.09-8.428-30.52 0l-22.58 22.58C257.2 100.7 233.2 96 208 96C93.13 96 0 189.1 0 304S93.13 512 208 512S416 418.9 416 304c0-25.18-4.703-49.21-12.9-71.55l22.58-22.58c8.428-8.428 8.428-22.09 0-30.52L390.5 144.1zM208 192C146.3 192 96 242.3 96 304C96 312.8 88.84 320 80 320S64 312.8 64 304C64 224.6 128.6 160 208 160C216.8 160 224 167.2 224 176S216.8 192 208 192zM509.1 59.21l-39.73-16.57L452.8 2.918c-1.955-3.932-7.652-3.803-9.543 0l-16.57 39.72l-39.73 16.57c-3.917 1.961-3.786 7.648 0 9.543l39.73 16.57l16.57 39.72c1.876 3.775 7.574 3.96 9.543 0l16.57-39.72l39.73-16.57C512.9 66.86 513 61.17 509.1 59.21z">
        </path>
    </svg>`
)}`

FLAG_IMG.src = `data:image/svg+xml; charset=utf8, ${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            fill="#262626"
            d="M64 496C64 504.8 56.75 512 48 512h-32C7.25 512 0 504.8 0 496V32c0-17.75 14.25-32 32-32s32 14.25 32 32V496zM476.3 0c-6.365 0-13.01 1.35-19.34 4.233c-45.69 20.86-79.56 27.94-107.8 27.94c-59.96 0-94.81-31.86-163.9-31.87C160.9 .3055 131.6 4.867 96 15.75v350.5c32-9.984 59.87-14.1 84.85-14.1c73.63 0 124.9 31.78 198.6 31.78c31.91 0 68.02-5.971 111.1-23.09C504.1 355.9 512 344.4 512 332.1V30.73C512 11.1 495.3 0 476.3 0z">
        </path>
    </svg>`
)}`

export default class MineField extends TileMap {
    uuid = ''
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

    primary_action(x, y) {
        const invert = this.invert_button.checked
        if (this.game_over) this.init(this.density)
        else invert && !this.first_click ? this.flag(x, y) : this.explore(x, y)
    }

    secondary_action(x, y) {
        const invert = this.invert_button.checked
        if (this.game_over) this.init(this.density)
        else invert || this.first_click ? this.explore(x, y) : this.flag(x, y)
    }

    get_tween(x, y) {
        let tween = 1
        if (this.animation[x + ',' + y] !== undefined) tween = Math.max(0, this.animation[x + ',' + y])
        if (!(this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged)) tween = 1 - tween

        return tween
    }

    beizer_curve(x) {
        return x * x * (3 - 2 * x)
    }

    // Draw a rounded rectangle from point x, y to point x1, y1 with radius r
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

    draw_flag(x, y) {
        this.ctx.globalAlpha = this.beizer_curve(this.get_tween(x, y))
        this.ctx.drawImage(
            FLAG_IMG,
            (x + 0.25) * this.cell_size,
            (y + 0.25) * this.cell_size,
            0.5 * this.cell_size,
            0.5 * this.cell_size
        )
        this.ctx.globalAlpha = 1
    }

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

    draw_explored(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.explored) {
                this.ctx.fillStyle = '#262626'
                this.ctx.strokeStyle = '#262626'
                this.ctx.lineWidth = 0.02 * this.cell_size

                if (this.get_tween(x, y) < 0.2) continue
                this.rounded_rectangle(x + 0.5 - 0.6, y + 0.5 - 0.6, 1.2, 1.2, 0.1, '#262626')

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

    draw_overlay(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.explored) {
                const tween = this.get_tween(x, y)
                if (tween >= 1) continue
                if (tween < 0.2) {
                    const partial = this.beizer_curve(tween / 0.2)

                    this.rounded_rectangle(
                        x + 0.1 - 0.3 * partial,
                        y + 0.1 - 0.3 * partial,
                        0.8 + 0.6 * partial,
                        0.8 + 0.6 * partial,
                        0.1,
                        '#fed7aa'
                    )
                } else {
                    const partial = this.beizer_curve((tween - 0.2) / 0.8)

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

    draw_grid(entries) {
        this.draw_explored(entries)
        this.draw_symbol(entries)
        this.draw_borders(entries)
        this.draw_overlay(entries)
        this.score_display.textContent = this.score
        if (this.game_over) this.canvas.classList.add('game-over')
    }

    init(new_density) {
        this.uuid = crypto.randomUUID()
        this.density = new_density
        this.data = {}
        this.animation = {}
        this.score = 0
        this.first_click = true
        this.game_over = false
        this.canvas.classList.remove('game-over')
    }

    explored(x, y) {
        return (
            this.animation[x + ',' + y] !== undefined &&
            this.data[x + ',' + y] !== undefined &&
            this.data[x + ',' + y].explored &&
            this.animation[x + ',' + y] >= 0.2
        )
    }

    is_mine(x, y) {
        if (this.data[x + ',' + y] === undefined) this.data[x + ',' + y] = new Cell(Math.random() < this.density, false)
        return this.data[x + ',' + y].is_mine
    }

    explore(x, y, start_x = x, start_y = y) {
        if (this.data[x + ',' + y] === undefined) {
            if (this.first_click) {
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
        if (this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged) return

        this.data[x + ',' + y].explored = true
        this.animation[x + ',' + y] = -0.2 * Math.hypot(x - start_x, y - start_y)
        this.first_click = false

        if (this.data[x + ',' + y].is_mine) {
            this.game_over = true
            return
        }

        const current_uuid = this.uuid

        setTimeout(() => {
            if (this.uuid === current_uuid) this.score++
        }, 0 - this.animation[x + ',' + y] * this.animation_duration)

        this.data[x + ',' + y].mines = 0

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue
                if (this.is_mine(x + i, y + j)) {
                    this.data[x + ',' + y].mines++
                }
            }
        }

        if (this.data[x + ',' + y].mines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue
                    this.explore(x + i, y + j, start_x, start_y)
                }
            }
        }
    }

    flag(x, y) {
        if (this.data[x + ',' + y] === undefined) this.data[x + ',' + y] = new Cell(false, false)
        if (!this.data[x + ',' + y].explored) {
            this.data[x + ',' + y].flagged = !this.data[x + ',' + y].flagged
            if (this.animation[x + ',' + y] === undefined) this.animation[x + ',' + y] = 0
            else this.animation[x + ',' + y] = 1 - this.animation[x + ',' + y]
        }
    }
}
