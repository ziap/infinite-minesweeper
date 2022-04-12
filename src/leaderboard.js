const MAX_LEADERBOARD_SIZE = 10

// TODO: Manage the leaderboard DOM directly in this file

/**
 * Get the leaderboard for a given gamemode and difficulty
 */
export function get(leaderboard_name) {
    const data = localStorage.getItem('leaderboard-' + leaderboard_name)
    if (data) {
        return JSON.parse(atob(data))
    }
    return []
}

/**
 * Add a score to the leaderboard, record the time the score was added and sort the leaderboard
 */
export function add(leaderboard_name, value, ascending = false) {
    const data = get(leaderboard_name)
    data.push({
        time: Date.now(),
        value
    })
    data.sort((a, b) => (ascending ? a.value - b.value : b.value - a.value))
    data.splice(MAX_LEADERBOARD_SIZE)
    localStorage.setItem('leaderboard-' + leaderboard_name, btoa(JSON.stringify(data)))
}

/**
 * Remove a score from the leaderboard
 */
export function del(leaderboard_name, idx) {
    const data = get(leaderboard_name)
    data.splice(idx, 1)
    localStorage.setItem('leaderboard-' + leaderboard_name, btoa(JSON.stringify(data)))
}

/**
 * Remove the leaderboard from the local storage
 */
export function clear(leaderboard_name) {
    localStorage.removeItem('leaderboard-' + leaderboard_name)
}
