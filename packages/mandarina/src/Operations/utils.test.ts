import {buildQueryFromFields} from "./utils";

describe('utils', () => {
    test("buildQueryFromFields", () => {
        const result = buildQueryFromFields(['otro', 'user.id', 'users.profile.name', 'users.profile.surname'])
        expect(result).toBe('{id,otro,users{id,profile{id,name,surname} profile2{nombre2}}}')
    })

    test("buildQueryFromFields2", () => {

        const qs='id,otro,users{id,profile{id,name,surname} profile2{nombre2}}'
        const insert=(qs:string,having:{[parent:string]:any})=>{
            const inserts:string[]=[]
            const parents=[]
            const havingParents=Object.keys(having)
            console.log('havingParents',havingParents)
            for (let i=0;i<qs.length;i++){
                const c=qs[i]

                if (c==='{'){
                    const sub=qs.substring(0,i)
                    const regEx=(/(\w+$)/)
                    const lastWord=regEx.exec(sub)[0]
                    console.log('lastWord',lastWord)
                    parents.push(lastWord)
                    const path=parents.join('.')
                    console.log('path',path)
                    if (havingParents.includes(path)){
                        console.log('index',i)
                        inserts[i]=path
                    }
                }
                if (c==='}'){
                    parents.pop()
                }
            }
            let result=qs
            for (let i=inserts.length;i>0;i--){
                if (!inserts[i]) continue
                console.log(i,inserts[i])
                result= qs.slice(0,i) + JSON.stringify(inserts[i]) + qs.slice(i)
            }
            return result
        }
        console.log(insert(qs,{'users.profile':{name_includes:'cesar'}}))

    })
})
