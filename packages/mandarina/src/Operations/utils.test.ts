import {buildQueryFromFields} from "./utils";

describe('utils', () => {
    test("buildQueryFromFields", () => {
        const result = buildQueryFromFields(['otro', 'user.id', 'users.profile.name', 'users.profile.surname'])
        expect(result).toBe('{id,otro,users{id,profile{id,name,surname} profile2{nombre2}}}')
    })
})
