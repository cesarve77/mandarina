import {getConfig, loadSchemas} from "../utils";
import {createDir, resetDir} from "./genFilesUtils";
import {Table} from "../..";
import {Schema} from "mandarina";
import {capitalize, isRequired} from "mandarina/build/Schema/utils";
import path from "path";
import fs from "fs";
import {FieldDefinition} from "mandarina/build/Schema/Schema";


const prisma2Models: { [schemaName: string]: { [fieldName: string]: string } } = {}
const proccesed: string[] = []
let c = 0
export const genFile = () => {
  const config = getConfig()
  loadSchemas(config.dir)
  createDir(config.dir.prisma2)
  resetDir(config.dir.prisma2)
  for (const schemaName in Table.instances) {
    const schema = Schema.getInstance(schemaName)
    getPrisma2Model(schema)
  }
  let prisma = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`
  Object.keys(prisma2Models).forEach(modelName => {
    const model = prisma2Models[modelName]
    prisma += `model ${modelName} {\n `
    Object.keys(model).forEach(fieldName => {
      const field = model[fieldName]
      prisma += `\t${fieldName} ${field}\n`
    })
    prisma += `}\n\n`
  })
  const prismaDir = path.join(process.cwd(), config.dir.prisma2,)
  const fileAbs = `${prismaDir}/schema.prisma`;
  fs.writeFileSync(fileAbs, prisma);
}

function getRelationName(parentDef: FieldDefinition) {
  if (!parentDef.table.relation) return ''
  if (typeof parentDef.table.relation === 'string') {
    return parentDef.table.relation
  }
  return parentDef.table.relation.name || ''
}

const getPrisma2Model = (schema: Schema, parent?: Schema, parentName?: string) => {
  prisma2Models[schema.name] = prisma2Models[schema.name] || {}
  let selfDef: FieldDefinition | null = null
  for (const key of schema.keys) {
    if (key === 'id') {
      c++
      prisma2Models[schema.name].id = `String                 @id @default(cuid()) //${c}`;
    } else {
      const fieldDefinition = schema.getPathDefinition(key)
      let required = fieldDefinition.isArray || isRequired(fieldDefinition)
      const fieldType = getGraphQLType(fieldDefinition, key, required);
      const unique = fieldDefinition.table.unique ? '@unique' : ''
      let defaultValue = ''
      if (fieldDefinition.table.default !== undefined) {
        const wrapper = (fieldDefinition.type === String) ? '"' : ''
        defaultValue = `@default(${wrapper}${fieldDefinition.table.default}${wrapper})`
      }
      let relation: string = ''
      if (fieldDefinition.isTable) {

        const processedName = [schema.name, key].join('-')
        let relationName = getRelationName(fieldDefinition)
        let childExists=false
        if (parent && parentName) {
          const parentDef = parent.getPathDefinition(parentName)
          let parentRelationName = getRelationName(parentDef)
          if (parent && (fieldDefinition.type === parent.name ) && (parentRelationName === relationName)) { //child exists
            selfDef = fieldDefinition
            childExists=true
          }
        }
        if (!proccesed.includes(processedName)) {
          proccesed.push(processedName)
          if (!childExists) {
            getPrisma2Model(Schema.getInstance(fieldDefinition.type), schema, key)
          }
        }
      } else {

        let createdAt = '', updatedAt = ''
        if ((fieldDefinition.table.createdAt === true || (fieldDefinition.table.createdAt !== false && key === 'createdAt'))) {
          createdAt = `@default(now())`
        }
        if ((fieldDefinition.table.updatedAt === true || (fieldDefinition.table.updatedAt !== false && key === 'updatedAt'))) {
          createdAt = `@default(now())`
        }
        if (!fieldType) {
          throw new Error('no type')
        }
        prisma2Models[schema.name][key] = `${fieldType} ${unique} ${createdAt} ${updatedAt} ${defaultValue} ${relation} `;
      }
    }
  }// end for
  if (parent && parentName) {
    const parentDef = parent.getPathDefinition(parentName)
    let parentRelationName = getRelationName(parentDef)
    const parentArray = parentDef.isArray
    if (selfDef) {
      if (selfDef.key==='visitStaff'){
        console.log('visitStaff')
      }
      let childRelationName = getRelationName(selfDef)
      const childArray = selfDef.isArray
      if (childRelationName !== parentRelationName) {
        throw new Error(`${childRelationName}-parentRelationName`)
      }
      if (!parentArray && !childArray) { //1 - 1
        const relation = getRelationName(parentDef) || `${[parent.name, `${selfDef.type}_${selfDef.key}`].join('_Exist_')}`
        if (typeof parentDef.table?.relation !== 'string' && parentDef.table?.relation?.link) {
          prisma2Models[parent.name][parentDef.key] = `${parentDef.type}? @relation(fields: [${parentDef.key}Id], references: [id],name: "${relation}") // 1`
          prisma2Models[parent.name][`${parentDef.key}Id`] = `String?`
          prisma2Models[schema.name][`${selfDef.key}`] = `${selfDef.type}? @relation(name: "${relation}") // 2`
        } else {
          if (schema.name===parent.name){
            prisma2Models[schema.name][`${relation}`] = `${parentDef.type}? @relation(name: "${relation}") // 3.1 `
            prisma2Models[schema.name][`${selfDef.key}`] = `${selfDef.type}? @relation(fields: [${selfDef.key}Id], references: [id], name: "${relation}") // 4.1 ${parentDef.key} ${selfDef.key}`
            prisma2Models[schema.name][`${selfDef.key}Id`] = `String?`
          }else{
            prisma2Models[parent.name][parentDef.key] = `${parentDef.type}? @relation(name: "${relation}") // 3`
            prisma2Models[schema.name][`${selfDef.key}`] = `${selfDef.type}? @relation(fields: [${selfDef.key}Id], references: [id], name: "${relation}") // 4`
            prisma2Models[schema.name][`${selfDef.key}Id`] = `String?`
          }

        }
      }
      if (parentArray && !childArray) { // n - 1
        const relation = getRelationName(parentDef) || `${[parent.name, `${schema.name}_${selfDef.key}`].join('_Exist_')}`
        prisma2Models[parent.name][parentDef.key] = `${parentDef.type}[] @relation(name: "${relation}") //5 `
        prisma2Models[schema.name][selfDef.key] = `${selfDef.type}? @relation(fields: [${selfDef.key}Id], references: [id], name: "${relation}") // 6`
        prisma2Models[schema.name][`${selfDef.key}Id`] = `String?`

      }
      if (!parentArray && childArray) {  // 1 - n
        const relation = getRelationName(parentDef) || `${[parent.name, `${schema.name}_${selfDef.key}`].join('_Exist_')}`
        prisma2Models[schema.name][selfDef.key] = `${selfDef.type}[] @relation(name: "${relation}") //7`
        prisma2Models[parent.name][parentDef.key] = `${parentDef.type}? @relation(fields: [${parentDef.key}Id], references: [id], name: "${relation}") //7.1`
        prisma2Models[parent.name][`${parentDef.key}Id`] = `String?`
      }
      if (parentArray && childArray) {  // n - n
        const relation = getRelationName(parentDef) || `${[parent.name, `${schema.name}_${selfDef.key}`].join('_Exist_')}`
        if (schema.name===parent.name){
          prisma2Models[parent.name][parentDef.key] = `${parentDef.type}[] @relation(name: "${relation}", references: [id]) // 8 self1`
          prisma2Models[schema.name][`${selfDef.key}2`] = `${selfDef.type}[] @relation(name: "${relation}", references: [id]) // 9 self2`
        }else{
          prisma2Models[parent.name][parentDef.key] = `${parentDef.type}[] @relation(name: "${relation}") // 8`
          prisma2Models[schema.name][selfDef.key] = `${selfDef.type}[] @relation(name: "${relation}") // 9`
        }

      }
    } else {
      const parentRelationName= getRelationName(parentDef)

      if (!parentArray) { //1 - n
        const relation =parentRelationName || `${[parent.name, `${schema.name}_${parentDef.key}`].join('_Exist_')}`
        prisma2Models[parent.name][parentDef.key] = `${parentDef.type}? @relation(name: "${relation}") //10`
        prisma2Models[schema.name][`${parentRelationName || parent.name}${parent.names.query.single}`] = `${parent.name}? @relation(fields: [${parentRelationName ||parent.name}${parent.names.query.single}Id], references: [id], name: "${relation}") // 11`
        prisma2Models[schema.name][`${parentRelationName || parent.name}${parent.names.query.single}Id`] = `String?`

      }
      if (parentArray) { // n - 1
        const name = parent.names.query.single
        const relation =parentRelationName || `${[parent.name, `${schema.name}_${name}`].join('_Exist_')}`
        prisma2Models[parent.name][parentDef.key] = `${parentDef.type}[] @relation(name: "${relation}") // 12 `
        prisma2Models[schema.name][`${parentRelationName || parent.name}${capitalize(parentDef.key)}`] = `${parent.name}? @relation(fields: [${parentRelationName || parent.name}${capitalize(parentDef.key)}Id], references: [id], name: "${relation}") // 13`
        prisma2Models[schema.name][`${parentRelationName || parent.name}${capitalize(parentDef.key)}Id`] = `String?`

      }
    }
  }
}
//  if (typeof fieldDefinition.table?.relation !== 'string' && fieldDefinition.table?.relation?.link) {
//               const nameId = `${key}Id`
//               prisma2Models[schema.name][nameId] = `String //id with link`;
//               relations.push(`fields: [${nameId}]`)
//               relations.push(`references: [id]`)
//             }
//             if (relations.length > 0) {
//               relation = `@relation(${relations.join(', ')})`
//             }
//             prisma2Models[schema.name][key] = `${fieldType} ${unique} ${defaultValue} ${relation} //deeping call=> ${fieldDefinition.type}`;
const getGraphQLType = (def: FieldDefinition, key: string, required: boolean): string => {
  const optional = !def.isArray && !required ? '?' : ''
  switch (true) {
    case (!def.isArray && !def.isTable && def.type.name === 'String'):
      return `String${optional}`;

    case (!def.isArray && !def.isTable && def.type.name === 'Boolean'):
      return `Boolean${optional}`;

    case (!def.isArray && !def.isTable && def.type.name === 'Number'):
      return `Float${optional}`;

    case (!def.isArray && !def.isTable && def.type.name === 'Integer'):
      return `Int${optional}`;
    case (!def.isArray && !def.isTable && def.type.name === 'Date'):
      return `DateTime${optional}`;
    case (def.isArray && def.isTable):
      return `${def.type}[]`
    case (def.isArray && !def.isTable):
      const scalarName = getGraphQLType({...def, isArray: false}, key, def.isArray && required)
      return `${scalarName}[]`
    default:
      return def.type + optional;
  }
}


