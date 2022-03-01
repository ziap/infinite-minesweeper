import MineField from './minefield.js'

const DIFFICULTY = {
    easy: 1 / 6,
    normal: 1 / 5,
    hard: 1 / 4
}

/**
 * A class representing a Minesweeper game.
 * - Create and manage the MineField
 * - Manipulate the DOM and listen to events
 * - Control the game mode game difficulty
 * - Handle the logic for the game modes
 */
export default class Game {
    constructor() {
        this.minefield = new MineField(DIFFICULTY.normal)

        const checker = document.querySelector('#menu-checker')
        const container = document.querySelector('#menu-container')
        const main_menu = document.querySelector('#main-menu')
        const game_config = document.querySelector('#game-config')
        const leaderboard = document.querySelector('#leaderboard')
        const settings = document.querySelector('#settings')

        this.current_screen = main_menu

        this.listen('.show-game-config', 'click', this.show_screen(game_config))
        this.listen('.show-settings', 'click', this.show_screen(settings))
        this.listen('.show-leaderboard', 'click', this.show_screen(leaderboard))
        this.listen('.return-to-menu', 'click', this.show_screen(main_menu))

        // Replace the existing DOM elements with the new one created by the MineField to ensure encapsulation
        document.querySelector('#grid').replaceWith(this.minefield.canvas)
        document.querySelector('#invert').replaceWith(this.minefield.invert_button)
        document.querySelector('#score').replaceWith(this.minefield.score_display)

        checker.addEventListener('input', e => {
            if (e.target.checked) container.classList.remove('hide')
            else container.classList.add('hide')

            this.show_screen(main_menu)()
        })

        game_config.addEventListener('submit', e => {
            const config = new FormData(e.target)
            this.minefield.init(DIFFICULTY[config.get('difficulty')])
            checker.checked = false
            container.classList.add('hide')
            e.preventDefault()
        })
    }

    /**
     * @param {Element} next_screen The next screen to show
     * @returns {Function} Returns a function because we mainly use it as a callback
     */
    show_screen(next_screen) {
        return () => {
            this.current_screen.classList.add('hide')
            next_screen.classList.remove('hide')
            this.current_screen = next_screen
        }
    }

    /**
     * @param {string} query The query for the list of elements
     * @param {string} event The event name e.g. 'click'
     * @param {Function} callback
     */
    listen(query, event, callback) {
        for (const element of document.querySelectorAll(query)) {
            element.addEventListener(event, callback)
        }
    }
}
