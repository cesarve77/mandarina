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
const getPrisma2Model = (schema: Schema, parent?: Schema, parentName?: string) => {
  let mainSchema: { [fieldName: string]: string } = prisma2Models[schema.name] || {}
  let isParentInChild = false
  if (!proccesed.includes(schema.name)) {
    for (const key of schema.keys) {
      if (key === 'id') {
        c++
        mainSchema.id = `String                 @id @default(cuid()) //${c}`;
      } else {
        const fieldDefinition = schema.getPathDefinition(key)

        let required = fieldDefinition.isArray || isRequired(fieldDefinition)
        const unique = fieldDefinition.table.unique ? '@unique' : ''
        let defaultValue = ''
        if (fieldDefinition.table.default !== undefined) {
          const wrapper = (fieldDefinition.type === String) ? '"' : ''
          defaultValue = `@default(${wrapper}${fieldDefinition.table.default}${wrapper})`
        }
        const relations: string[] = []
        let relation: string = ''
        if (fieldDefinition.isTable) {
          if (!fieldDefinition.isArray){
            required=false
          }
          let relationName = fieldDefinition.table.relation ? typeof fieldDefinition.table.relation === 'string' ? fieldDefinition.table.relation : fieldDefinition.table?.relation?.name : ``

          if (fieldDefinition.table?.relation && typeof fieldDefinition.table?.relation !== 'string' && fieldDefinition.table?.relation?.onDelete) {
            //relations.push(`onDelete: Cascade`)
          }

          if (!parent || !parentName) {
            getPrisma2Model(Schema.getInstance(fieldDefinition.type), schema, key)
          } else {
            if (parent.name === fieldDefinition.type) {
              isParentInChild = true
              console.log('isParentInChild', key, parent.name, parentName)
              getPrisma2Model(Schema.getInstance(fieldDefinition.type), schema, key)
              // const parentDef=parent.getPathDefinition(parentName)
              const idName = `${parent.names.query.single}Id`
              mainSchema[idName] = `String //aqui`;
              relations.push(`fields: [${idName}]`)
            } else {
              getPrisma2Model(Schema.getInstance(fieldDefinition.type), schema, key)
            }
          }

          if (relationName) {
            relations.push(`name: "${relationName}"`)
          }
          if (relations.length > 0) {
            if (relations.length === 1 && relations[0].indexOf('name:')>=0){
            }else{
              relations.push(`references: [id]`)
            }
          }
          if (relations.length > 0) {
            relation = `@relation(${relations.join(', ')})`
          }
        }
        let createdAt = '', updatedAt = ''//processMissingInfo
        if ((fieldDefinition.table.createdAt === true || (fieldDefinition.table.createdAt !== false && key === 'createdAt'))) {
          createdAt = `@default(now())`
        }
        if ((fieldDefinition.table.updatedAt === true || (fieldDefinition.table.updatedAt !== false && key === 'updatedAt'))) {
          createdAt = `@default(now())`
        }
        const fieldType = getGraphQLType(fieldDefinition, key, required );
        if (!fieldType) {
          throw new Error('no type')
        }
        mainSchema[key] = `${fieldType} ${unique} ${createdAt} ${updatedAt} ${defaultValue} ${relation} //@relation(${relations.join(', ')})`;
      }

      proccesed.push(schema.name)
    }

  }else{
    for (const key of schema.keys) {
      const fieldDefinition = schema.getPathDefinition(key)
      if (parent && parent.name === fieldDefinition.type) {
        isParentInChild = true
      }
    }
  }
  if (parent && parentName) {
    const parentDef = parent.getPathDefinition(parentName)

    if (!isParentInChild) {
      const relationName = parentDef.table.relation ? typeof parentDef.table.relation === 'string' ? parentDef.table.relation : parentDef.table?.relation?.name : ``
      const name = !relationName ? `${parent.names.query.single}` : `${parent.names.query.single}For${capitalize(parentName)}`
      const idName=`${name}Id`
      mainSchema[name] = `${parent.name} @relation(fields: [${idName}], references: [id]${relationName ? `, name:"${relationName}"` : ''}) //isParentInChild`
      mainSchema[idName] = `String`
    }
  }
  prisma2Models[schema.name] = {...mainSchema,...prisma2Models[schema.name]}
}


export const getGraphQLType = (def: FieldDefinition, key: string, required: boolean): string => {
  const optional=!def.isArray && !required ? '?' : ''
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


