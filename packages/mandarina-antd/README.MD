


TableField

Props:

**query**:\
*type*: string\
*required*\
*description*: comma separate of fields list, to get "id" and "text" from. eg: "id,name" the generate object {id:"xxxxxx",:name:"mandarina"} is passed to extractor function (see bellow), to extract the id and the text to be shown in the select combo

**extractor**:\
*type*: function\
default: return a object {value, label} where value should be the value in the select (normally id) and label the text in the option
*params*:\
get one param the object result of the query, e.g: for  query: "id,name" get  {id:"xxxxxx",:name:"mandarina"} 



