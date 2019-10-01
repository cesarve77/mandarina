import {buildQueryFromFields} from "./utils";

describe('Table Utils', () => {
    test("buildQueryFromFields ", () => {
        const result = buildQueryFromFields(
            ['otro', 'user.id', 'user.profile.name', 'user.profile.surname'],
            {id: 'uiserId', roles: ['admin']},
            {
                'user.profile': {roles: ['admin'], operator: '', value: 100}
            }
        )
        console.log('result', result)
    })
    test("try catch ", async () => {
        const func = async () => {
            await func2 ()
            console.log(5)
            throw new Error('Application already exists!')
        }
        const func2 = async () => {
            throw new Error('2')
        }
        console.log(1)
        await func()
        console.log(2)
        await func2 ()
        console.log(3)

    })

})
