import Game from '../src/game.js'
import { jest } from '@jest/globals'

HTMLMediaElement.prototype.play = jest.fn()

document.body.innerHTML = `
    <input type="checkbox" id="menu-checker" />
    <h1 id="game-over-message">Game Over!</h1>
    <div id="menu-container">
        <div id="main-menu">
            <button class="show-game-config"></button>
            <button class="show-leaderboard"></button>
            <button class="show-settings"></button>
            <button class="return-to-menu"></button>
        </div>
        <form id="game-config">
            <fieldset>
                <legend>Select game mode</legend>
                <label><input type="radio" value="casual" name="gamemode" checked /> Casual</label>
                <label><input type="radio" value="casual-new" name="gamemode" /> Casual (new game)</label>
                <label><input type="radio" value="blitz" name="gamemode" /> Blitz</label>
                <label><input type="radio" value="500-tiles" name="gamemode" /> 500 tiles</label>
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
        <div id="leaderboard"></div>
        <div id="settings"></div>
    </div>
    <div id="info">
        <div id="difficulty"></div>
        <div id="game-mode"></div>
        <div id="timer">0</div>
    </div>
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

    it('Can load a game', () => {
        // Arrange
        return_to_menu.click()
        show_game_config.click()
        localStorage.setItem(
            'casual-0.25',
            'eyJmaXJzdCI6ZmFsc2UsImRhdGEiOltbIi0xLC0zIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6ZmFsc2UsIm1pbmVzIjowLCJpc19taW5lIjp0cnVlfV0sWyItMSwtMiIseyJmbGFnZ2VkIjpmYWxzZSwiZXhwbG9yZWQiOmZhbHNlLCJtaW5lcyI6MCwiaXNfbWluZSI6ZmFsc2V9XSxbIi0xLC0xIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6ZmFsc2UsIm1pbmVzIjowLCJpc19taW5lIjp0cnVlfV0sWyItMSwwIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6ZmFsc2UsIm1pbmVzIjowLCJpc19taW5lIjp0cnVlfV0sWyItMSwxIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6ZmFsc2UsIm1pbmVzIjowLCJpc19taW5lIjpmYWxzZX1dLFsiMCwtMyIseyJmbGFnZ2VkIjpmYWxzZSwiZXhwbG9yZWQiOmZhbHNlLCJtaW5lcyI6MCwiaXNfbWluZSI6ZmFsc2V9XSxbIjAsLTIiLHsiZmxhZ2dlZCI6ZmFsc2UsImV4cGxvcmVkIjp0cnVlLCJtaW5lcyI6MiwiaXNfbWluZSI6ZmFsc2V9XSxbIjAsLTEiLHsiZmxhZ2dlZCI6ZmFsc2UsImV4cGxvcmVkIjp0cnVlLCJtaW5lcyI6MiwiaXNfbWluZSI6ZmFsc2V9XSxbIjAsMCIseyJmbGFnZ2VkIjpmYWxzZSwiZXhwbG9yZWQiOnRydWUsIm1pbmVzIjozLCJpc19taW5lIjpmYWxzZX1dLFsiMCwxIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6ZmFsc2UsIm1pbmVzIjowLCJpc19taW5lIjp0cnVlfV0sWyIxLC0zIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6ZmFsc2UsIm1pbmVzIjowLCJpc19taW5lIjpmYWxzZX1dLFsiMSwtMiIseyJmbGFnZ2VkIjpmYWxzZSwiZXhwbG9yZWQiOnRydWUsIm1pbmVzIjoxLCJpc19taW5lIjpmYWxzZX1dLFsiMSwtMSIseyJmbGFnZ2VkIjpmYWxzZSwiZXhwbG9yZWQiOnRydWUsIm1pbmVzIjowLCJpc19taW5lIjpmYWxzZX1dLFsiMSwwIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6dHJ1ZSwibWluZXMiOjEsImlzX21pbmUiOmZhbHNlfV0sWyIxLDEiLHsiZmxhZ2dlZCI6ZmFsc2UsImV4cGxvcmVkIjpmYWxzZSwibWluZXMiOjAsImlzX21pbmUiOmZhbHNlfV0sWyIyLC0zIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6ZmFsc2UsIm1pbmVzIjowLCJpc19taW5lIjp0cnVlfV0sWyIyLC0yIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6dHJ1ZSwibWluZXMiOjMsImlzX21pbmUiOmZhbHNlfV0sWyIyLC0xIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6dHJ1ZSwibWluZXMiOjEsImlzX21pbmUiOmZhbHNlfV0sWyIyLDAiLHsiZmxhZ2dlZCI6ZmFsc2UsImV4cGxvcmVkIjp0cnVlLCJtaW5lcyI6MSwiaXNfbWluZSI6ZmFsc2V9XSxbIjIsMSIseyJmbGFnZ2VkIjpmYWxzZSwiZXhwbG9yZWQiOmZhbHNlLCJtaW5lcyI6MCwiaXNfbWluZSI6ZmFsc2V9XSxbIjMsLTMiLHsiZmxhZ2dlZCI6ZmFsc2UsImV4cGxvcmVkIjpmYWxzZSwibWluZXMiOjAsImlzX21pbmUiOnRydWV9XSxbIjMsLTIiLHsiZmxhZ2dlZCI6ZmFsc2UsImV4cGxvcmVkIjpmYWxzZSwibWluZXMiOjAsImlzX21pbmUiOmZhbHNlfV0sWyIzLC0xIix7ImZsYWdnZWQiOmZhbHNlLCJleHBsb3JlZCI6ZmFsc2UsIm1pbmVzIjowLCJpc19taW5lIjp0cnVlfV0sWyIzLDAiLHsiZmxhZ2dlZCI6ZmFsc2UsImV4cGxvcmVkIjpmYWxzZSwibWluZXMiOjAsImlzX21pbmUiOmZhbHNlfV0sWyIzLDEiLHsiZmxhZ2dlZCI6ZmFsc2UsImV4cGxvcmVkIjpmYWxzZSwibWluZXMiOjAsImlzX21pbmUiOmZhbHNlfV1dLCJjZW50ZXIiOlswLDBdLCJjZWxsX3NpemUiOjgwLCJzY29yZSI6OX0='
        )

        // Act
        game_config.querySelector('[value="hard"]').click()
        game_config.querySelector('[value="casual"]').click()
        game_config.querySelector('[type="submit"]').click()

        // Assert
        expect(game.minefield.density).toEqual(0.25)
        expect(game.game_mode).toEqual(0)
        expect(game.minefield.score).toBeGreaterThan(0)
        expect(game.minefield.first_click).toBe(false)
    })

    it('Can start a new game', () => {
        // Arrange
        menu_checker.click()
        show_game_config.click()

        // Act
        game_config.querySelector('[value="hard"]').click()
        game_config.querySelector('[value="casual-new"]').click()
        game_config.querySelector('[type="submit"]').click()

        // Assert
        expect(localStorage.getItem('casual-0.25')).toBeNull()
        expect(game.minefield.density).toEqual(0.25)
        expect(game.game_mode).toEqual(0)
        expect(game.minefield.score).toEqual(0)
        expect(game.minefield.first_click).toBe(true)
    })

    it('Can save data to localStorage', () => {
        // Act
        game.minefield.primary_action(0, 0)
        game.minefield.update()

        // Assert
        expect(localStorage.getItem('casual-0.25').length).toBeGreaterThan(0)
    })

    it('Can remove data from localStorage', () => {
        // Act
        game.minefield.game_over_time = Date.now()
        game.minefield.update()

        // Assert
        expect(localStorage.getItem('casual-0.25')).toBeNull()
    })

    it('Can start blitz mode', () => {
        // Arrange
        menu_checker.click()
        show_game_config.click()

        // Act
        game_config.querySelector('[value="blitz"]').click()
        game_config.querySelector('[value="normal"]').click()
        game_config.querySelector('[type="submit"]').click()

        // Assert
        expect(game.minefield.density).toEqual(0.2)
        expect(game.game_mode).toEqual(1)
    })

    it('Can update timer in blitz', () => {
        // Act
        game.minefield.update()

        // Assert
        expect(document.querySelector('#timer').innerHTML).toEqual('120s')

        // Act
        game.minefield.primary_action(0, 0)
        game.minefield.init_time = Date.now() - 1500
        game.minefield.update()

        // Assert
        expect(document.querySelector('#timer').innerHTML).toEqual('118s')
    })

    it('Can make game over by running out of time', () => {
        // Assert
        expect(game.minefield.game_over_time).toBeNull()

        // Act
        game.minefield.init_time = Date.now() - 120000
        game.minefield.update()

        // Assert
        expect(game.minefield.game_over_time).toBeGreaterThan(0)
    })

    it('Can start 500 tiles mode', () => {
        // Arrage
        menu_checker.click()
        show_game_config.click()

        // Act
        game_config.querySelector('[value="500-tiles"]').click()
        game_config.querySelector('[value="normal"]').click()
        game_config.querySelector('[type="submit"]').click()

        // Assert
        expect(game.minefield.density).toEqual(0.2)
        expect(game.game_mode).toEqual(2)
    })

    it('Can update timer in 500 tiles', () => {
        // Act
        game.minefield.update()

        // Assert
        expect(document.querySelector('#timer').innerHTML).toEqual('0s')

        // Act
        game.minefield.primary_action(0, 0)
        game.minefield.init_time = Date.now() - 2000
        game.minefield.update()

        // Assert
        expect(document.querySelector('#timer').innerHTML).toEqual('2s')
    })

    it('Can win by getting 500 tiles', () => {
        // Assert
        expect(game.minefield.game_over_time).toBeNull()

        // Act
        game.minefield.score = 500
        game.minefield.update()

        // Assert
        expect(game.minefield.game_over_time).toBeGreaterThan(0)
    })
})
