//
// export const loadSchemas=(config: )=>{
//     config.dir.schemas.forEach((dir) => {
//         schemas = walkSync(path.join(process.cwd(), dir), schemas)
//     })
//     config.dir.tables.forEach((dir) => {
//         tables = walkSync(path.join(process.cwd(), dir), tables)
//     })
//     schemas.forEach((schema) => {
//         const content: string = fs.readFileSync(schema, 'utf8');
//         if (true || content.match(/new *Schema/)) {
//             console.log('processing ', schema)
//             require(schema)
//         }
//     })
//     tables.forEach((table) => {
//         const content: string = fs.readFileSync(table, 'utf8');
//         if (true || content.match(/new *Table/)) {
//             console.log('processing ', table)
//             require(table)
//         }
//     })
//     console.log('saving models')
//     saveFiles()
//     console.log('done!')
// }
