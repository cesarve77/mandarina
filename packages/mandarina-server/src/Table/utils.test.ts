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
    })


})
