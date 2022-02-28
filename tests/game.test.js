import Game from '../src/game.js'

document.body.innerHTML = `
    <input type="checkbox" id="menu-checker">
    <div id="menu-container"></div>
    <div id="main-menu">
        <button class="show-game-config"></button>
        <button class="show-leaderboard"></button>
        <button class="show-settings"></button>
        <button class="return-to-menu"></button>
    </div>
    <div id="game-config">
        <form id="game-config">
            <fieldset>
                <legend>Select game mode</legend>
                <label><input type="radio" value="casual" name="gamemode" checked /> Casual</label>
                <label><input type="radio" value="blitz" name="gamemode" disabled /> Blitz</label>
                <label><input type="radio" value="500-tiles" name="gamemode" disabled /> 500 tiles</label>
            </fieldset>
            <fieldset>
                <legend>Select difficulty</legend>
                <label><input type="radio" value="easy" name="difficulty" /> Easy</label>
                <label><input type="radio" value="normal" name="difficulty" checked /> Normal</label>
                <label><input type="radio" value="hard" name="difficulty" /> Hard</label>
            </fieldset>
            <section>
                <input type="submit" value="start" />
            </section>
        </form>
    </div>
    <div id="leaderboard"></div>
    <div id="settings"></div>
    <div id="grid"></div>
    <div id="invert"></div>
    <div id="score"></div>
`

describe('Game', () => {
    const game = new Game()
    const menu_checker = document.querySelector('#menu-checker')
    const menu_container = document.querySelector('#menu-container')
    const main_menu = document.querySelector('#main-menu')
    const game_config = document.querySelector('#game-config')
    const leaderboard = document.querySelector('#leaderboard')
    const settings = document.querySelector('#settings')

    const show_game_config = document.querySelector('.show-game-config')
    const show_leaderboard = document.querySelector('.show-leaderboard')
    const show_settings = document.querySelector('.show-settings')
    const return_to_menu = document.querySelector('.return-to-menu')

    it('Can be instantiated', () => {
        // Assert
        expect(game).toBeDefined()
        expect(game).toBeInstanceOf(Game)
        expect(game.minefield.density).toEqual(0.2)
    })

    it('Can open menu', () => {
        // Act
        menu_checker.click()

        // Assert
        expect(menu_container.classList.contains('hide')).toEqual(false)
    })

    it('Can close menu', () => {
        // Act
        menu_checker.click()

        // Assert
        expect(menu_container.classList.contains('hide')).toEqual(true)
    })

    it('Can show game config', () => {
        // Arrange
        menu_checker.click()

        // Act
        show_game_config.click()

        // Assert
        expect(main_menu.classList.contains('hide')).toEqual(true)
        expect(game_config.classList.contains('hide')).toEqual(false)
    })

    it('Can return to menu', () => {
        // Act
        return_to_menu.click()

        // Assert
        expect(game_config.classList.contains('hide')).toEqual(true)
        expect(main_menu.classList.contains('hide')).toEqual(false)
    })

    it('Can show leaderboard', () => {
        // Arrange
        return_to_menu.click()

        // Act
        show_leaderboard.click()

        // Assert
        expect(main_menu.classList.contains('hide')).toEqual(true)
        expect(leaderboard.classList.contains('hide')).toEqual(false)
    })

    it('Can show settings', () => {
        // Arrange
        return_to_menu.click()

        // Act
        show_settings.click()

        // Assert
        expect(main_menu.classList.contains('hide')).toEqual(true)
        expect(settings.classList.contains('hide')).toEqual(false)
    })

    it('Can start a new game', () => {
        // Arrange
        return_to_menu.click()
        show_game_config.click()

        // Act
        game_config.querySelector('[value="hard"]').click()
        game_config.querySelector('[type="submit"]').click()

        // Assert
        expect(game.minefield.density).toEqual(0.25)
        expect(game.minefield.data).toEqual({})
    })
})
