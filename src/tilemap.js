export default class TileMap {
    center = [0, 0]
    cursor = null
    cell_size = 80
    data = {}
    animation = {}
    animation_duration = 500

    prev_time = 0

    primary_action() {}

    secondary_action() {}

    draw_grid() {}

    resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    constructor() {
        this.canvas = document.createElement('canvas')
        this.canvas.id = 'grid'
        this.ctx = this.canvas.getContext('2d')
        window.addEventListener('resize', () => this.resize())
        this.resize()

        this.listen_mouse()
        this.listen_touch()

        this.prev_time = performance.now()
        requestAnimationFrame(this.update.bind(this))
    }

    get_mouse_pos(mouse_x, mouse_y) {
        return [
            Math.round((mouse_x - this.canvas.width / 2 + this.center[0]) / this.cell_size - 0.5),
            Math.round((mouse_y - this.canvas.height / 2 + this.center[1]) / this.cell_size - 0.5)
        ]
    }

    interact(mouse_x, mouse_y, mouse_button) {
        const [x, y] = this.get_mouse_pos(mouse_x, mouse_y)

        if (mouse_button === 0) {
            this.primary_action(x, y)
        } else if (mouse_button === 2) {
            this.secondary_action(x, y)
        }
    }

    draw_cursor() {
        if (!this.cursor) return
        const [x, y] = this.cursor
        this.ctx.fillStyle = '#eeeeee'
        this.ctx.globalAlpha = 0.5
        this.ctx.fillRect(x * this.cell_size, y * this.cell_size, this.cell_size, this.cell_size)
        this.ctx.globalAlpha = 1
    }

    draw(delta_time) {
        this.ctx.restore()
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.save()
        this.ctx.translate(this.canvas.width / 2 - this.center[0], this.canvas.height / 2 - this.center[1])
        const entries = []
        for (const [key, cell] of Object.entries(this.data)) {
            if (this.animation[key] !== undefined) {
                this.animation[key] += delta_time / this.animation_duration
                this.animation[key] = Math.min(this.animation[key], 1)
            }
            const [x, y] = key.split(',').map(x => ~~x)
            const canvas_pos_x = x * this.cell_size - this.center[0] + this.canvas.width / 2
            const canvas_pos_y = y * this.cell_size - this.center[1] + this.canvas.height / 2

            const canvas_pos_x_min = canvas_pos_x - this.cell_size
            const canvas_pos_x_max = canvas_pos_x + this.cell_size * 2
            const canvas_pos_y_min = canvas_pos_y - this.cell_size
            const canvas_pos_y_max = canvas_pos_y + this.cell_size * 2

            const canvas_pos_x_min_max = canvas_pos_x_min <= this.canvas.width && canvas_pos_x_max >= 0
            const canvas_pos_y_min_max = canvas_pos_y_min <= this.canvas.height && canvas_pos_y_max >= 0

            if (canvas_pos_x_min_max && canvas_pos_y_min_max) {
                entries.push([[x, y], cell])
            }
        }
        this.draw_grid(entries)
        this.draw_cursor()
    }

    listen_mouse() {
        let last_mouse_pos = [0, 0]
        let is_dragging = false
        let sum_delta = [0, 0]

        this.canvas.addEventListener('mousedown', e => {
            is_dragging = true
            sum_delta = [0, 0]
            last_mouse_pos = [e.clientX, e.clientY]
        })

        this.canvas.addEventListener('mousemove', e => {
            this.cursor = this.get_mouse_pos(e.clientX, e.clientY)
            if (is_dragging) {
                this.cursor = null
                this.center[0] -= e.clientX - last_mouse_pos[0]
                this.center[1] -= e.clientY - last_mouse_pos[1]
                sum_delta[0] += Math.abs(e.clientX - last_mouse_pos[0])
                sum_delta[1] += Math.abs(e.clientY - last_mouse_pos[1])
                last_mouse_pos = [e.clientX, e.clientY]
            }
        })

        this.canvas.addEventListener('mouseup', e => {
            is_dragging = false
            const max_abs = Math.max(sum_delta[0], sum_delta[1])
            if (max_abs <= 10) {
                this.interact(e.clientX, e.clientY, e.button)
            }
        })

        this.canvas.addEventListener('wheel', e => {
            this.center[0] += e.clientX - this.canvas.width / 2
            this.center[1] += e.clientY - this.canvas.height / 2
            this.center[0] /= this.cell_size
            this.center[1] /= this.cell_size
            this.cell_size -= e.deltaY / 5
            this.cell_size = Math.max(this.cell_size, 10)
            this.cell_size = Math.min(this.cell_size, 200)
            this.center[0] *= this.cell_size
            this.center[1] *= this.cell_size
            this.center[0] -= e.clientX - this.canvas.width / 2
            this.center[1] -= e.clientY - this.canvas.height / 2
        })

        this.canvas.addEventListener('mouseout', () => (is_dragging = false))

        this.canvas.addEventListener('contextmenu', e => e.preventDefault())
    }

    // Same as above, but for touch events
    listen_touch() {
        let last_touch_pos = [0, 0]
        let is_dragging = false
        let sum_delta = [0, 0]
        let last_pinch_dist = 0

        function get_touch_pos(touches) {
            const touch_pos = [0, 0]
            for (const touch of touches) {
                touch_pos[0] += touch.clientX / touches.length
                touch_pos[1] += touch.clientY / touches.length
            }
            return touch_pos
        }

        function get_pinch_dist(touches) {
            let dist = 0
            for (let i = 0; i < touches.length - 1; i++) {
                for (let j = i + 1; j < touches.length; j++) {
                    dist = Math.max(
                        dist,
                        Math.hypot(touches[i].clientX - touches[j].clientX, touches[i].clientY - touches[j].clientY)
                    )
                }
            }
            return dist
        }

        this.canvas.addEventListener('touchend', e => {
            last_touch_pos = [...get_touch_pos(e.touches)]
            last_pinch_dist = 0
            if (e.touches.length === 0) {
                is_dragging = false
                if (Math.max(...sum_delta) <= 10) {
                    this.interact(e.changedTouches[0].clientX, e.changedTouches[0].clientY, 0)
                }
            }

            e.preventDefault()
        })

        this.canvas.addEventListener('touchstart', e => {
            is_dragging = true
            this.cursor = null
            sum_delta = [0, 0]
            last_touch_pos = [...get_touch_pos(e.touches)]
            last_pinch_dist = get_pinch_dist(e.touches)
            e.preventDefault()
        })

        this.canvas.addEventListener('touchmove', e => {
            if (is_dragging) {
                const new_touch_pos = [...get_touch_pos(e.touches)]

                this.center[0] -= new_touch_pos[0] - last_touch_pos[0]
                this.center[1] -= new_touch_pos[1] - last_touch_pos[1]

                const new_pinch_dist = get_pinch_dist(e.touches)

                if (last_pinch_dist !== 0) {
                    this.center[0] += new_touch_pos[0] - this.canvas.width / 2
                    this.center[1] += new_touch_pos[1] - this.canvas.height / 2

                    this.center[0] /= this.cell_size
                    this.center[1] /= this.cell_size

                    this.cell_size *= new_pinch_dist / last_pinch_dist
                    this.cell_size = Math.max(this.cell_size, 10)
                    this.cell_size = Math.min(this.cell_size, 200)

                    this.center[0] *= this.cell_size
                    this.center[1] *= this.cell_size

                    this.center[0] -= new_touch_pos[0] - this.canvas.width / 2
                    this.center[1] -= new_touch_pos[1] - this.canvas.height / 2
                }
                sum_delta[0] += Math.abs(new_touch_pos[0] - last_touch_pos[0])
                sum_delta[1] += Math.abs(new_touch_pos[1] - last_touch_pos[1])

                last_touch_pos[0] = new_touch_pos[0]
                last_touch_pos[1] = new_touch_pos[1]
                last_pinch_dist = new_pinch_dist
            }
            e.preventDefault()
        })
    }

    update(time) {
        this.draw(time - this.prev_time)
        this.prev_time = time
        requestAnimationFrame(this.update.bind(this))
    }
}
