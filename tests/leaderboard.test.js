import * as Leaderboard from '../src/leaderboard.js'

describe('Leaderboard', () => {
    it('Can add a score', () => {
        // Act
        Leaderboard.add('test', 10, false)

        // Assert
        expect(Leaderboard.get('test')).toEqual([{
            time: expect.any(Number),
            value: 10
        }])
    })

    it('Can add multiple scores and sort them in both direction', () => {
        // Act
        Leaderboard.add('test', 20, true)
        Leaderboard.add('test', 5, true)

        Leaderboard.add('test1', 10, false)
        Leaderboard.add('test1', 20, false)
        Leaderboard.add('test1', 5, false)

        // Assert
        expect(Leaderboard.get('test')).toEqual([{
            time: expect.any(Number),
            value: 5
        }, {
            time: expect.any(Number),
            value: 10
        }, {
            time: expect.any(Number),
            value: 20
        }])

        expect(Leaderboard.get('test1')).toEqual([{
            time: expect.any(Number),
            value: 20
        }, {
            time: expect.any(Number),
            value: 10
        }, {
            time: expect.any(Number),
            value: 5
        }])
    })

    it('Can display the leaderboard', () => {
        // Arrange
        const leaderboard_elem = document.createElement('ul')
        leaderboard_elem.innerHTML = '<li>This has to be removed</li>'

        // Act
        Leaderboard.display('test', leaderboard_elem)

        // Assert
        expect(leaderboard_elem.innerHTML).toEqual(`
            <li>
                <div>5</div>
                <div>${new Date().toLocaleDateString()}</div>
            </li>
            <li>
                <div>10</div>
                <div>${new Date().toLocaleDateString()}</div>
            </li>
            <li>
                <div>20</div>
                <div>${new Date().toLocaleDateString()}</div>
            </li>
        `.split(/[ \n]/).join(''))
    })
})