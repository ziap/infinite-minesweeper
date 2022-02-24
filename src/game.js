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

        this.current_screen = main_menu

        this.listen('.show_game_config', 'click', this.show_screen(game_config))
        this.listen('.show_settings', 'click', this.show_screen(settings))
        this.listen('.show_leaderboard', 'click', this.show_screen(leaderboard))
        this.listen('.return_to_menu', 'click', this.show_screen(main_menu))

        document.getElementById('grid').replaceWith(this.minefield.canvas)
        document.getElementById('invert').replaceWith(this.minefield.invert_button)
        document.getElementById('score').replaceWith(this.minefield.score_display)
    }

    show_screen(next_screen) {
        return () => {
            this.current_screen.classList.add('hide')
            next_screen.classList.remove('hide')
            this.current_screen = next_screen
        }
    }

    listen(query, input, callback) {
        for (const element of document.querySelectorAll(query)) {
            element.addEventListener(input, callback)
        }
    }
}
