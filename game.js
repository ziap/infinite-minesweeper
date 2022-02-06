import Grid from './grid.js'

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

export default class Game extends Grid {
    density = 0.25
    first_click = true
    game_over = false
    bomb_img = new Image()
    flag_img = new Image()

    /**
     * @type {{[key: string]: Cell}}
     */
    data = {}

    primary_action(x, y) {
        if (this.game_over) this.init(this.density)
        else this.explore(x, y)
    }

    secondary_action(x, y) {
        if (this.game_over) this.init(this.density)
        else this.flag(x, y)
    }

    draw_plot(x, y, color) {
        this.ctx.fillStyle = color
        this.ctx.strokeStyle = '#262626'
        this.ctx.lineWidth = 0.02 * this.cell_size
        this.ctx.beginPath()
        this.ctx.moveTo((x + 0.2) * this.cell_size, (y + 0.1) * this.cell_size)
        this.ctx.arcTo(
            (x + 0.9) * this.cell_size,
            (y + 0.1) * this.cell_size,
            (x + 0.9) * this.cell_size,
            (y + 0.2) * this.cell_size,
            0.1 * this.cell_size
        )
        this.ctx.arcTo(
            (x + 0.9) * this.cell_size,
            (y + 0.9) * this.cell_size,
            (x + 0.2) * this.cell_size,
            (y + 0.9) * this.cell_size,
            0.1 * this.cell_size
        )
        this.ctx.arcTo(
            (x + 0.1) * this.cell_size,
            (y + 0.9) * this.cell_size,
            (x + 0.1) * this.cell_size,
            (y + 0.2) * this.cell_size,
            0.1 * this.cell_size
        )
        this.ctx.arcTo(
            (x + 0.1) * this.cell_size,
            (y + 0.1) * this.cell_size,
            (x + 0.2) * this.cell_size,
            (y + 0.1) * this.cell_size,
            0.1 * this.cell_size
        )
        this.ctx.fill()
        this.ctx.stroke()
    }

    draw_mine(x, y) {
        this.draw_plot(x, y, '#dc2626')
        this.ctx.drawImage(
            this.bomb_img,
            (x + 0.25) * this.cell_size,
            (y + 0.25) * this.cell_size,
            0.5 * this.cell_size,
            0.5 * this.cell_size
        )
    }

    draw_flag(x, y) {
        this.draw_plot(x, y, '#737373')
        this.ctx.drawImage(
            this.flag_img,
            (x + 0.25) * this.cell_size,
            (y + 0.25) * this.cell_size,
            0.5 * this.cell_size,
            0.5 * this.cell_size
        )
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

    draw_explored_or_flagged(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.explored || cell.flagged) {
                this.ctx.fillStyle = '#262626'
                this.ctx.strokeStyle = '#262626'
                this.ctx.lineWidth = 0.02 * this.cell_size
                this.ctx.beginPath()
                this.ctx.moveTo(x * this.cell_size, (y - 0.1) * this.cell_size)
                this.ctx.arcTo(
                    (x + 1.1) * this.cell_size,
                    (y - 0.1) * this.cell_size,
                    (x + 1.1) * this.cell_size,
                    y * this.cell_size,
                    0.1 * this.cell_size
                )
                this.ctx.arcTo(
                    (x + 1.1) * this.cell_size,
                    (y + 1.1) * this.cell_size,
                    (x + 0.1) * this.cell_size,
                    (y + 1.1) * this.cell_size,
                    0.1 * this.cell_size
                )
                this.ctx.arcTo(
                    (x - 0.1) * this.cell_size,
                    (y + 1.1) * this.cell_size,
                    (x - 0.1) * this.cell_size,
                    y * this.cell_size,
                    0.1 * this.cell_size
                )
                this.ctx.arcTo(
                    (x - 0.1) * this.cell_size,
                    (y - 0.1) * this.cell_size,
                    x * this.cell_size,
                    (y - 0.1) * this.cell_size,
                    0.1 * this.cell_size
                )
                this.ctx.fill()
                this.ctx.stroke()

                if (!this.explored_or_flagged(x + 1, y)) {
                    if (this.explored_or_flagged(x + 1, y - 1)) {
                        this.draw_corner(x + 1.1, y + 0.2, x + 1.2, y + 0.1)
                    }
                    if (this.explored_or_flagged(x + 1, y + 1)) {
                        this.draw_corner(x + 1.1, y + 0.8, x + 1.2, y + 0.9)
                    }
                }
                if (!this.explored_or_flagged(x - 1, y)) {
                    if (this.explored_or_flagged(x - 1, y - 1)) {
                        this.draw_corner(x - 0.1, y + 0.2, x - 0.2, y + 0.1)
                    }
                    if (this.explored_or_flagged(x - 1, y + 1)) {
                        this.draw_corner(x - 0.1, y + 0.8, x - 0.2, y + 0.9)
                    }
                }
            }
        }
    }

    draw_symbol(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.is_mine && cell.explored) this.draw_mine(x, y)
            else if (cell.flagged) this.draw_flag(x, y)
            else if (cell.mines > 0) {
                switch (cell.mines) {
                    case 1:
                        this.ctx.fillStyle = '#60a5fa'
                        break
                    case 2:
                        this.ctx.fillStyle = '#4ade80'
                        break
                    case 3:
                        this.ctx.fillStyle = '#f87171'
                        break
                    case 4:
                        this.ctx.fillStyle = '#c084fc'
                        break
                    case 5:
                        this.ctx.fillStyle = '#facc15'
                        break
                    case 6:
                        this.ctx.fillStyle = '#2dd4bf'
                        break
                    case 7:
                        this.ctx.fillStyle = '#ffffff'
                        break
                    case 8:
                        this.ctx.fillStyle = '#a3a3a3'
                        break
                    default:
                        this.ctx.fillStyle = '#ffffff'
                        break
                }
                this.ctx.font = 0.6 * this.cell_size + 'px sans-serif'
                this.ctx.textAlign = 'center'
                this.ctx.textBaseline = 'middle'
                this.ctx.fillText(cell.mines, (x + 0.5) * this.cell_size, (y + 0.5) * this.cell_size)
            }
        }
    }

    draw_borders(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.explored || cell.flagged) {
                this.ctx.strokeStyle = '#737373'
                this.ctx.lineWidth = 0.02 * this.cell_size
                this.ctx.strokeRect(x * this.cell_size, (y + 0.2) * this.cell_size, 0, 0.6 * this.cell_size)
                this.ctx.strokeRect((x + 0.2) * this.cell_size, y * this.cell_size, 0.6 * this.cell_size, 0)
                this.ctx.strokeRect((x + 1) * this.cell_size, (y + 0.2) * this.cell_size, 0, 0.6 * this.cell_size)
                this.ctx.strokeRect((x + 0.2) * this.cell_size, (y + 1) * this.cell_size, 0.6 * this.cell_size, 0)
            }
        }
    }

    draw_grid(entries) {
        this.draw_explored_or_flagged(entries)
        this.draw_symbol(entries)
        this.draw_borders(entries)
    }

    init(new_density) {
        this.density = new_density
        this.data = {}
        this.first_click = true
        this.game_over = false
    }

    constructor(new_density) {
        super()
        this.bomb_img.src = 'assets/bomb.svg'
        this.flag_img.src = 'assets/flag.svg'
        this.init(new_density)
    }

    explored_or_flagged(x, y) {
        return (
            this.data[x + ',' + y] !== undefined && (this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged)
        )
    }

    is_mine(x, y) {
        if (this.data[x + ',' + y] === undefined) {
            if (Math.random() < this.density) {
                this.data[x + ',' + y] = new Cell(true, false)
            } else {
                this.data[x + ',' + y] = new Cell(false, false)
            }
        }
        return this.data[x + ',' + y].is_mine
    }

    explore(x, y) {
        if (this.data[x + ',' + y] === undefined) {
            if (this.first_click) this.data[x + ',' + y] = new Cell(false, false)
            else this.is_mine(x, y)
        }
        if (this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged) return

        this.data[x + ',' + y].explored = true
        this.first_click = false

        if (this.data[x + ',' + y].is_mine) {
            this.game_over = true
            return
        }

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
                    this.explore(x + i, y + j)
                }
            }
        }
    }

    flag(x, y) {
        if (this.data[x + ',' + y] === undefined) this.data[x + ',' + y] = new Cell(false, false)
        if (!this.data[x + ',' + y].explored) return (this.data[x + ',' + y].flagged = !this.data[x + ',' + y].flagged)
    }
}
