let Schema
// @ts-ignore
if (!global.describe){
    Schema=require("../../../../packages/mandarina/build").Schema
}else{
    Schema=require("../../../../packages/mandarina/src").Schema
}


export const Car = new Schema({
    plate: {type: String},
    brand: {type: String},
}, {
    name: 'Car',
})




