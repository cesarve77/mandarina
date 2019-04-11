let Schema
// @ts-ignore
if (!global.describe){
    Schema=require("../../../../packages/mandarina/build").Schema
}else{
    Schema=require("../../../../packages/mandarina/src").Schema
}


export const Category = new Schema({
    id: {type: String},
    category: {type: String},
    'users': {type: ['User']},
}, {
    name: 'Category',
})


