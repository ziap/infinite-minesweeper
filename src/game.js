import MineField from './minefield.js'

export default class Game {
    constructor(density) {
        this.minefield = new MineField(density)

        document.querySelector('#menu').addEventListener('input', e => {
            const container = document.querySelector('#menu-container')

            if (e.target.checked) container.classList.remove('hide')
            else container.classList.add('hide')
        })

        const main_menu = document.querySelector('#main_menu')
        const game_config = document.querySelector('#game_config')
        const leaderboard = document.querySelector('#leaderboard')
        const settings = document.querySelector('#settings')

        let current_screen = main_menu

        function addListenerToList(query, inputType, callbackFunction) {
            for (const element of document.querySelectorAll(query)) {
                element.addEventListener(inputType, callbackFunction)
            }
        }

        function show_screen(next_screen) {
            return () => {
                current_screen.classList.add('hide')
                next_screen.classList.remove('hide')
                current_screen = next_screen
            }
        }

        addListenerToList('.show_game_config', 'click', show_screen(game_config))
        addListenerToList('.show_settings', 'click', show_screen(settings))
        addListenerToList('.show_leaderboard', 'click', show_screen(leaderboard))
        addListenerToList('.return_to_menu', 'click', show_screen(main_menu))

        document.getElementById('grid').replaceWith(this.minefield.canvas)
        document.getElementById('invert').replaceWith(this.minefield.invert_button)
        document.getElementById('score').replaceWith(this.minefield.score_display)
    }
}
