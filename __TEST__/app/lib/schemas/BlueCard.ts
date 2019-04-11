let Schema
// @ts-ignore
if (!global.describe){
    Schema=require("../../../../packages/mandarina/build").Schema
}else{
    Schema=require("../../../../packages/mandarina/src").Schema
}


export const BlueCard = new Schema({
    number: {type: String},
    status: {type: String},
}, {
    name: 'BlueCard',
})




