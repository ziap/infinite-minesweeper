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
                this.ctx.fillStyle = this.colors[cell.mines]
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
            this.data[x + ',' + y] !== undefined && (this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged)
        )
    }

    is_mine(x, y) {
        if (this.data[x + ',' + y] === undefined) this.data[x + ',' + y] = new Cell(Math.random() < this.density, false)
        return this.data[x + ',' + y].is_mine
    }

    explore(x, y) {
        if (this.data[x + ',' + y] === undefined) {
            if (this.first_click) {
                const rest_mines = Math.min(25 * this.density, 16)
                const edge = []
                for (let i = x - 2; i <= x + 2; i++) {
                    for (let j = y - 2; j <= y + 2; j++) {
                        if (Math.abs(x - i) === 2 || Math.abs(y - j) === 2) edge.push([i, j])
                        this.data[i + ',' + j] = new Cell(false, false)
                    }
                }
                for (let i = 0; i < rest_mines; i++) {
                    const index = Math.floor(Math.random() * edge.length)
                    const [x, y] = edge[index]
                    edge.splice(index, 1)
                    this.data[x + ',' + y].is_mine = true
                }
            } else this.is_mine(x, y)
        }
        if (this.data[x + ',' + y].explored || this.data[x + ',' + y].flagged) return

        this.data[x + ',' + y].explored = true
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
                    this.explore(x + i, y + j)
                }
            }
        }
    }

    flag(x, y) {
        if (this.data[x + ',' + y] === undefined) this.data[x + ',' + y] = new Cell(false, false)
        if (!this.data[x + ',' + y].explored) this.data[x + ',' + y].flagged = !this.data[x + ',' + y].flagged
    }
}
