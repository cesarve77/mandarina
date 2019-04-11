let Schema
// @ts-ignore
if (!global.describe){
    Schema=require("../../../../packages/mandarina/build").Schema
}else{
    Schema=require("../../../../packages/mandarina/src").Schema
}

export const Post = new Schema({
    id: {type: String},
    title: {type: String},
    published: {type: Boolean},
    tags: {type: [String]},
    user: {type: 'User'},
}, {
    name: 'Post',
})

