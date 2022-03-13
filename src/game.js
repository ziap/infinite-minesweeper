import { Cell, MineField } from './minefield.js'

const DIFFICULTY = {
    easy: 0.1625,
    normal: 0.2,
    hard: 0.25
}

const GAMEMODES = {
    casual: 0,
    'casual-new': 0,
    blitz: 1,
    '500-tiles': 2
}

/**
 * A class representing a Minesweeper game.
 * - Create and manage the MineField
 * - Manipulate the DOM and listen to events
 * - Control the game mode game difficulty
 * - Handle the logic for the game modes
 */
export default class Game {
    minefield = new MineField(DIFFICULTY.normal)
    game_mode = 0
    current_screen = null

    load_data() {
        const data = localStorage.getItem('casual-' + this.minefield.density)
        if (data) {
            const parsed = JSON.parse(atob(data))
            this.minefield.data = {}
            for (const [key, value] of parsed.data) {
                this.minefield.data[key] = new Cell(false, false)
                this.minefield.data[key].explored = value.explored
                this.minefield.data[key].flagged = value.flagged
                this.minefield.data[key].mines = value.mines
                this.minefield.data[key].is_mine = value.is_mine
                this.minefield.animation[key] = 1
            }
            this.minefield.center = parsed.center || [0, 0]
            this.minefield.cell_size = parsed.cell_size || 80
            this.minefield.first_click = parsed.first !== undefined ? parsed.first : true
            this.minefield.score = parsed.score || 0
        }
    }

    constructor() {
        const checker = document.querySelector('#menu-checker')
        const container = document.querySelector('#menu-container')
        const main_menu = document.querySelector('#main-menu')
        const game_config = document.querySelector('#game-config')
        const leaderboard = document.querySelector('#leaderboard')
        const settings = document.querySelector('#settings')

        this.current_screen = main_menu
        this.game_mode = +localStorage.getItem('gamemode')

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
            const densiy = DIFFICULTY[config.get('difficulty')]
            this.game_mode = GAMEMODES[config.get('gamemode')]
            this.minefield.init(densiy)
            if (this.game_mode == 0) {
                if (config.get('gamemode') == 'casual') this.load_data()
                else {
                    localStorage.removeItem('casual-' + this.minefield.density)
                }
            }
            localStorage.setItem('gamemode', this.game_mode)
            localStorage.setItem('density', densiy)
            checker.checked = false
            container.classList.add('hide')
            e.preventDefault()
        })

        /**
         * Save the game data to localStorage
         */
        this.minefield.post_update = () => {
            if (this.minefield.game_over_time) {
                localStorage.removeItem('casual-' + this.minefield.density)
            } else {
                const data = []
                for (const [key, cell] of Object.entries(this.minefield.data)) {
                    data.push([
                        key,
                        { flagged: cell.flagged, explored: cell.explored, mines: cell.mines, is_mine: cell.is_mine }
                    ])
                }
                localStorage.setItem(
                    'casual-' + this.minefield.density,
                    btoa(
                        JSON.stringify({
                            first: this.minefield.first_click,
                            data: data,
                            center: this.minefield.center,
                            cell_size: this.minefield.cell_size,
                            score: this.minefield.score
                        })
                    )
                )
            }
        }

        this.minefield.init(localStorage.getItem('density') || DIFFICULTY.normal)
        this.load_data()
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
