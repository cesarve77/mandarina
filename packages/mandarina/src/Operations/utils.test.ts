import {buildQueryFromFields, insertHaving} from "./utils";

describe('utils', () => {
    test("buildQueryFromFields", () => {
        const result = buildQueryFromFields(['otro', 'user.id', 'users.profile.name', 'users.profile.surname'])
        expect(result).toBe('{id,otro,users{id,profile{id,name,surname} profile2{nombre2}}}')
    })

    test("buildQueryFromFields2", () => {
        const qs='id,otro,users{id,profile{id,name,surname} profile2{nombre2}}'
        const result=insertHaving(qs,{'users.profile':{name_includes:'cesar'}})
        expect(result).toBe('id,otro,users{id,profile({where:{"name_includes":"cesar"}}){id,name,surname} profile2{nombre2}}')


    })
})
