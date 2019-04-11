let Schema
// @ts-ignore
if (!global.describe){
    Schema=require("../../../../packages/mandarina/build").Schema
}else{
    Schema=require("../../../../packages/mandarina/src").Schema
}

export const Address = new Schema({
    country: {type: String},
    city: {type: String},
    user: {type: 'User'},
}, {
    name: 'Address',
})

