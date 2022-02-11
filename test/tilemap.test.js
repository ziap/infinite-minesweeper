import TileMap from '../build/tilemap.js'

// Create canvas mock
HTMLCanvasElement.prototype.getContext = () => {}

describe('TileMap', () => {
    const tilemap = new TileMap()

    it('Can be instantiated', () => {
        // Assert
        expect(tilemap).toBeDefined()
        expect(tilemap).toBeInstanceOf(TileMap)
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
        // Arrange
        const mouse_x = 100
        const mouse_y = 100
        const mouse_button = 0

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
                clientX: mouse_x + 10,
                clientY: mouse_y + 10
            })
        )

        // Assert
        tilemap.center[0] = 10
        tilemap.center[1] = 10
    })
})
