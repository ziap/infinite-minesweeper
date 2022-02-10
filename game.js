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

export default class Game extends TileMap {
    density = 0.25
    first_click = true
    game_over = false
    score = 0
    colors = ['#262626', '#60a5fa', '#4ade80', '#f87171', '#c084fc', '#facc15', '#2dd4bf', '#ffffff', '#a3a3a3']
    bomb_img = new Image()
    flag_img = new Image()

    /**
     * @type {{[key: string]: Cell}}
     */
    data = {}

    primary_action(x, y) {
        const invert = document.getElementById('invert').checked
        if (this.game_over) this.init(this.density)
        else invert && !this.first_click ? this.flag(x, y) : this.explore(x, y)
    }

    secondary_action(x, y) {
        const invert = document.getElementById('invert').checked
        if (this.game_over) this.init(this.density)
        else invert || this.first_click ? this.explore(x, y) : this.flag(x, y)
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
        this.ctx.strokeStyle = '#262626'
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
        if (this.animation[x + ',' + y] < 1) return
        this.rounded_rectangle(x + 0.1, y + 0.1, 0.8, 0.8, 0.1, '#dc2626')
        this.ctx.drawImage(
            this.bomb_img,
            (x + 0.25) * this.cell_size,
            (y + 0.25) * this.cell_size,
            0.5 * this.cell_size,
            0.5 * this.cell_size
        )
    }

    draw_flag(x, y) {
        if (this.animation[x + ',' + y] < 1) return
        this.rounded_rectangle(x + 0.1, y + 0.1, 0.8, 0.8, 0.1, '#737373')
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
            if (cell.explored || cell.flagged || this.animation[x + ',' + y] < 1) {
                this.ctx.fillStyle = '#262626'
                this.ctx.strokeStyle = '#262626'
                this.ctx.lineWidth = 0.02 * this.cell_size

                let tween = 1
                if (this.animation[x + ',' + y] !== undefined) {
                    tween *= Math.max(0, this.animation[x + ',' + y])
                    if (!(cell.explored || cell.flagged)) tween = 1 - tween
                }
                this.rounded_rectangle(
                    x + 0.5 - 0.6 * tween,
                    y + 0.5 - 0.6 * tween,
                    1.2 * tween,
                    1.2 * tween,
                    0.1 * tween,
                    '#262626'
                )

                if (tween < 1) continue

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

                this.ctx.globalAlpha = 1
            }
        }
    }

    draw_symbol(entries) {
        for (const [[x, y], cell] of entries) {
            if (cell.is_mine && cell.explored) this.draw_mine(x, y)
            else if (cell.flagged) this.draw_flag(x, y)
            else if (cell.mines > 0) {
                this.ctx.fillStyle = this.colors[cell.mines]
                let font_size = 0.6 * this.cell_size
                if (this.animation[x + ',' + y] !== undefined) font_size *= Math.max(0, this.animation[x + ',' + y])
                this.ctx.font = font_size + 'px Arial'
                this.ctx.textAlign = 'center'
                this.ctx.textBaseline = 'middle'
                this.ctx.fillText(cell.mines, (x + 0.5) * this.cell_size, (y + 0.5) * this.cell_size)
            }
        }
    }

    draw_borders(entries) {
        for (const [[x, y], cell] of entries) {
            if ((cell.explored || cell.flagged) && this.animation[x + ',' + y] >= 5 / 6) {
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

    draw_grid(entries) {
        this.draw_explored_or_flagged(entries)
        this.draw_symbol(entries)
        this.draw_borders(entries)
        document.getElementById('score').textContent = this.score
        if (this.game_over) this.canvas.classList.add('game-over')
    }

    init(new_density) {
        this.density = new_density
        this.data = {}
        this.score = 0
        this.first_click = true
        this.game_over = false
        this.canvas.classList.remove('game-over')
    }

    constructor(new_density) {
        super()
        this.bomb_img.src = 'assets/bomb.svg'
        this.flag_img.src = 'assets/flag.svg'
        this.init(new_density)
    }

    explored_or_flagged(x, y) {
        return (
            this.animation[x + ',' + y] !== undefined &&
            this.data[x + ',' + y] !== undefined &&
            (this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged) &&
            this.animation[x + ',' + y] >= 1
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
        this.animation[x + ',' + y] = -0.5 * Math.hypot(x - start_x, y - start_y)
        this.first_click = false

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
