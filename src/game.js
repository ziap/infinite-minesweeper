import MineField from './minefield.js'

const DIFFICULTY = {
    easy: 1 / 6,
    normal: 1 / 5,
    hard: 1 / 4
}

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

        document.getElementById('grid').replaceWith(this.minefield.canvas)
        document.getElementById('invert').replaceWith(this.minefield.invert_button)
        document.getElementById('score').replaceWith(this.minefield.score_display)

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
