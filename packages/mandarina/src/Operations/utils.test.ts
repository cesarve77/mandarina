import {buildQueryFromFields} from "./utils";

describe('utils', () => {
    test("buildQueryFromFields", () => {
        const result = buildQueryFromFields(['otro', 'user.id', 'user.profile.name', 'user.profile.surname'])
    })
})