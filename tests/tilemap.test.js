import TileMap from '../src/tilemap.js'
import { jest } from '@jest/globals'

describe('TileMap', () => {
    const tilemap = new TileMap()

    it('Can be instantiated empty', () => {
        // Assert
        expect(tilemap).toBeDefined()
        expect(tilemap).toBeInstanceOf(TileMap)
        expect(tilemap.data).toEqual({})
        expect(tilemap.animation).toEqual({})
    })

    it('Is resized when the window is resized', () => {
        // Arrange
        const width = window.innerWidth
        const height = window.innerHeight

        // Act
        window.dispatchEvent(new Event('resize'))

        // Assert
        expect(tilemap.canvas.width).toEqual(width)
        expect(tilemap.canvas.height).toEqual(height)
    })

    it('Can be dragged with the mouse', () => {
        for (let i = 0; i < 100; i++) {
            // Arrange
            const mouse_x = 0 | (Math.random() * window.innerWidth)
            const mouse_y = 0 | (Math.random() * window.innerHeight)
            const mouse_button = 0

            const new_mouse_x = 0 | (Math.random() * window.innerWidth)
            const new_mouse_y = 0 | (Math.random() * window.innerHeight)

            const [old_x, old_y] = tilemap.center

            // Act
            tilemap.canvas.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: mouse_x,
                    clientY: mouse_y,
                    button: mouse_button
                })
            )
            tilemap.canvas.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: new_mouse_x,
                    clientY: new_mouse_y
                })
            )

            // Assert
            expect(tilemap.center[0] - old_x).toEqual(mouse_x - new_mouse_x)
            expect(tilemap.center[1] - old_y).toEqual(mouse_y - new_mouse_y)
        }
    })

    it('Can be zoomed with the mouse wheel', () => {
        for (let i = 0; i < 100; i++) {
            // Arrange
            const mouse_x = 0 | (Math.random() * window.innerWidth)
            const mouse_y = 0 | (Math.random() * window.innerHeight)
            const delta = 0 | (Math.random() * 100)

            const old_size = tilemap.cell_size

            // Act
            tilemap.canvas.dispatchEvent(
                new WheelEvent('wheel', {
                    clientX: mouse_x,
                    clientY: mouse_y,
                    deltaY: delta
                })
            )

            // Assert
            expect(tilemap.cell_size).toEqual(Math.max(10, Math.min(200, old_size - delta / 5)))
            expect(tilemap.cell_size).toBeGreaterThanOrEqual(10)
            expect(tilemap.cell_size).toBeLessThanOrEqual(200)
        }
    })

    it('Can be clicked', () => {
        for (let i = 0; i < 100; i++) {
            // Arrange
            const mouse_x = 0 | (Math.random() * window.innerWidth)
            const mouse_y = 0 | (Math.random() * window.innerHeight)
            const mouse_button = 0 | (Math.random() * 3)
            const spy = jest.spyOn(tilemap, 'interact')

            // Act
            tilemap.canvas.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: mouse_x,
                    clientY: mouse_y,
                    button: mouse_button
                })
            )

            tilemap.canvas.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: mouse_x,
                    clientY: mouse_y,
                    button: mouse_button
                })
            )

            // Assert
            expect(spy).toBeCalledWith(~~mouse_x, ~~mouse_y, mouse_button)
        }
    })

    it('Can be dragged with touch events', () => {
        for (let i = 0; i < 100; i++) {
            // Arrange
            const touch_x = 0 | (Math.random() * window.innerWidth)
            const touch_y = 0 | (Math.random() * window.innerHeight)
            const touch_id = 0

            const [old_x, old_y] = tilemap.center

            const new_touch_x = 0 | (Math.random() * window.innerWidth)
            const new_touch_y = 0 | (Math.random() * window.innerHeight)

            // Act
            tilemap.canvas.dispatchEvent(
                new TouchEvent('touchstart', {
                    touches: [
                        {
                            clientX: touch_x,
                            clientY: touch_y,
                            identifier: touch_id
                        }
                    ]
                })
            )
            tilemap.canvas.dispatchEvent(
                new TouchEvent('touchmove', {
                    touches: [
                        {
                            clientX: new_touch_x,
                            clientY: new_touch_y,
                            identifier: touch_id
                        }
                    ]
                })
            )

            // Assert
            expect(tilemap.center[0] - old_x).toBeCloseTo(touch_x - new_touch_x)
            expect(tilemap.center[1] - old_y).toBeCloseTo(touch_y - new_touch_y)
        }
    })

    it('Can be zoomed with 2 fingers', () => {
        for (let i = 0; i < 100; i++) {
            // Arrange
            const first_touch = [
                [0 | (Math.random() * window.innerWidth), 0 | (Math.random() * window.innerHeight)],
                [0 | (Math.random() * window.innerWidth), 0 | (Math.random() * window.innerHeight)]
            ]

            const second_touch = [
                [0 | (Math.random() * window.innerWidth), 0 | (Math.random() * window.innerHeight)],
                [0 | (Math.random() * window.innerWidth), 0 | (Math.random() * window.innerHeight)]
            ]

            const old_size = tilemap.cell_size

            // Act
            tilemap.canvas.dispatchEvent(
                new TouchEvent('touchstart', {
                    touches: [
                        {
                            clientX: first_touch[0][0],
                            clientY: first_touch[0][1],
                            identifier: 0
                        },
                        {
                            clientX: first_touch[1][0],
                            clientY: first_touch[1][1],
                            identifier: 1
                        }
                    ]
                })
            )

            tilemap.canvas.dispatchEvent(
                new TouchEvent('touchmove', {
                    touches: [
                        {
                            clientX: second_touch[0][0],
                            clientY: second_touch[0][1],
                            identifier: 0
                        },
                        {
                            clientX: second_touch[1][0],
                            clientY: second_touch[1][1],
                            identifier: 1
                        }
                    ]
                })
            )

            const old_pinch = Math.hypot(first_touch[0][0] - first_touch[1][0], first_touch[0][1] - first_touch[1][1])
            const new_pinch = Math.hypot(
                second_touch[0][0] - second_touch[1][0],
                second_touch[0][1] - second_touch[1][1]
            )

            // Assert
            expect(tilemap.cell_size).toBeCloseTo(Math.max(10, Math.min(200, (old_size / old_pinch) * new_pinch)))
            expect(tilemap.cell_size).toBeGreaterThanOrEqual(10)
            expect(tilemap.cell_size).toBeLessThanOrEqual(200)
        }
    })

    it('Can interact with touch', () => {
        for (let i = 0; i < 100; i++) {
            // Arrange
            const mouse_x = 0 | (Math.random() * window.innerWidth)
            const mouse_y = 0 | (Math.random() * window.innerHeight)
            const spy = jest.spyOn(tilemap, 'interact')

            // Act
            tilemap.canvas.dispatchEvent(
                new TouchEvent('touchstart', {
                    touches: [
                        {
                            clientX: mouse_x,
                            clientY: mouse_y
                        }
                    ]
                })
            )

            tilemap.canvas.dispatchEvent(
                new TouchEvent('touchend', {
                    touches: [
                        {
                            clientX: mouse_x,
                            clientY: mouse_y
                        }
                    ]
                })
            )

            // Assert
            expect(spy).toBeCalledWith(~~mouse_x, ~~mouse_y, 0)
        }
    })

    it('Calls the update method every frame', () => {
        // Arrange
        const spy = jest.spyOn(tilemap, 'draw')

        // Act
        tilemap.update()

        // Assert
        expect(spy).toBeCalled()
    })

    it('Displays the cursor', () => {
        // Arrange
        const spy = jest.spyOn(tilemap.ctx, 'fillRect')
        tilemap.cursor = [0, 0]

        // Act
        tilemap.draw_cursor()

        // Assert
        expect(spy).toBeCalled()
    })

    it('Draws the grid', () => {
        // Arrange
        const spy = jest.spyOn(tilemap, 'draw_grid')
        tilemap.center = [0, 0]
        tilemap.data = { '0,0': {} }

        // Act
        tilemap.draw()

        // Assert
        expect(spy).toBeCalledWith([[[0, 0], {}]])
    })

    it('Updates the animation', () => {
        // Arrange
        tilemap.center = [0, 0]
        tilemap.data = { '0,0': {} }
        tilemap.animation = { '0,0': 0 }

        // Act
        tilemap.draw(10)

        // Assert
        expect(tilemap.animation['0,0']).toBe(10 / tilemap.animation_duration)
    })
})
