import { Cell, MineField } from './minefield.js'
import * as Leaderboard from './leaderboard.js'

function GetName(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k[0].toUpperCase() + k.slice(1)]))
}

const DIFFICULTY = {
    easy: 0.1625,
    normal: 0.2,
    hard: 0.25
}

const DIFFICULTY_NAME = GetName(DIFFICULTY)

const GAMEMODES = {
    'casual-new': 0,
    casual: 0,
    blitz: 1,
    '500-tiles': 2
}

const GAMEMODES_NAME = GetName(GAMEMODES)

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
        const info = document.querySelector('#info')
        const timer = document.querySelector('#timer')
        const main_menu = document.querySelector('#main-menu')
        const game_config = document.querySelector('#game-config')
        const leaderboard = document.querySelector('#leaderboard')
        const settings = document.querySelector('#settings')
        const difficulty_display = document.querySelector('#difficulty')
        const game_mode_display = document.querySelector('#game-mode')
        const game_over_message = document.querySelector('#game-over-message')
        const gamemode_selector_elem = document.getElementById('gamemode-leaderboard-selector')
        const difficulty_selector_elem = document.getElementById('difficulty-leaderboard-selector')
        const leaderboard_elem = document.getElementById('leaderboard-list')

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
            if (e.target.checked) {
                container.classList.remove('hide')
                info.classList.add('hide')
            } else {
                container.classList.add('hide')
                info.classList.remove('hide')
            }

            this.show_screen(main_menu)()
        })

        game_config.addEventListener('submit', e => {
            const config = new FormData(e.target)
            const density = DIFFICULTY[config.get('difficulty')]
            this.game_mode = GAMEMODES[config.get('gamemode')]
            this.minefield.init(density)
            difficulty_display.textContent = DIFFICULTY_NAME[density]
            game_mode_display.textContent = GAMEMODES_NAME[this.game_mode]
            if (this.game_mode === 0) {
                if (config.get('gamemode') === 'casual') this.load_data()
                else {
                    localStorage.removeItem('casual-' + this.minefield.density)
                }
            }
            localStorage.setItem('gamemode', this.game_mode)
            localStorage.setItem('density', density)
            checker.checked = false
            container.classList.add('hide')
            info.classList.remove('hide')
            e.preventDefault()
        })

        /**
         * Handle leaderGameboard UI logic
         */
        const update_leaderboard = () => {
            Leaderboard.display(gamemode_selector_elem.value + '-' + DIFFICULTY[difficulty_selector_elem.value], leaderboard_elem)
        }

        /**
         * Handle all the gamemodes logic
         */
        this.minefield.post_update = () => {
            if (this.minefield.init_time && !this.minefield.game_over_time) game_over_message.textContent = 'Game over!'
            switch (this.game_mode) {
                case GAMEMODES.casual:
                    timer.textContent = '∞'
                    if (this.minefield.game_over_time) {
                        localStorage.removeItem('casual-' + this.minefield.density)
                    } else {
                        const data = []
                        for (const [key, cell] of Object.entries(this.minefield.data)) {
                            data.push([
                                key,
                                {
                                    flagged: cell.flagged,
                                    explored: cell.explored,
                                    mines: cell.mines,
                                    is_mine: cell.is_mine
                                }
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
                    break
                case GAMEMODES.blitz:
                    if (!this.minefield.game_over_time) {
                        if (this.minefield.init_time) {
                            const time_left = Math.max(
                                0,
                                Math.round((this.minefield.init_time + 120000 - Date.now()) / 1000)
                            )
                            timer.textContent = time_left + 's'
                            if (time_left <= 0) {
                                game_over_message.textContent = "Time's up!"
                                this.minefield.game_over_time = Date.now()
                                Leaderboard.add('blitz-' + this.minefield.density, this.minefield.score, false)
                                update_leaderboard()
                            }
                        } else {
                            timer.textContent = '120s'
                        }
                    }
                    break
                case GAMEMODES['500-tiles']:
                    if (!this.minefield.game_over_time) {
                        if (this.minefield.init_time) {
                            const elapsed = Math.round((Date.now() - this.minefield.init_time) / 1000)

                            timer.textContent = elapsed + 's'

                            if (this.minefield.score >= 500) {
                                game_over_message.textContent = 'You win!'
                                this.minefield.game_over_time = Date.now()
                                Leaderboard.add('500-tiles-' + this.minefield.density, elapsed + 's', true)
                                update_leaderboard()
                            }
                        } else {
                            timer.textContent = '0s'
                        }
                    }
            }
        }

        gamemode_selector_elem.addEventListener('change', update_leaderboard)
        difficulty_selector_elem.addEventListener('change', update_leaderboard)

        this.minefield.init(localStorage.getItem('density') || DIFFICULTY.normal)
        difficulty_display.textContent = DIFFICULTY_NAME[this.minefield.density]
        game_mode_display.textContent = GAMEMODES_NAME[this.game_mode]
        if (this.game_mode === 0) this.load_data()
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
