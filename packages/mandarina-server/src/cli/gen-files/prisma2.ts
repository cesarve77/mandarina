import {getConfig, loadSchemas} from "../utils";
import {createDir} from "./genFilesUtils";
import {Table} from "../..";
import {Schema} from "mandarina";
import {isRequired} from "mandarina/build/Schema/utils";
import path from "path";
import fs from "fs";
import {FieldDefinition} from "mandarina/build/Schema/Schema";

const prisma2Models: { [schemaName: string]: { [fieldName: string]: string } } = {}
const processed: { [schemaName: string]: { [schemaName: string]: { [fieldName: string]: true } } } = {}
const processedSubSchemas: string[] = []
export const genFile = () => {
    const config = getConfig()
    loadSchemas(config.dir)
    createDir(config.dir.prisma2)
    for (const schemaName in Table.instances) {
        const schema = Schema.getInstance(schemaName)
        getPrisma2Model(schema)
    }
    let prisma = `generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-arm64-openssl-1.0.x"]  
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
`
    Object.keys(prisma2Models).forEach(modelName => {
        const model = prisma2Models[modelName]
        prisma += `model ${modelName} {\n `
        Object.keys(model).forEach(fieldName => {
            const field = model[fieldName]
            prisma += `\t${fieldName} ${field}\n`
        })
        const schema = Schema.getInstance(modelName)
        schema.indexes.forEach(({fields, type}) => {
            prisma += `\t@@${type.toLowerCase()}([${fields.map(({
                                                                    name,
                                                                    options
                                                                }) => `${name}${options ? `(${options})` : ``}`).join(',')}])\n`
        })
        prisma += `}\n\n`
    })
    const prismaDir = path.join(process.cwd(), config.dir.prisma2,)
    const fileAbs = `${prismaDir}/schema.prisma`;
    fs.writeFileSync(fileAbs, prisma);

}

const getPrisma2Model = (schema: Schema) => {
    prisma2Models[schema.name] = prisma2Models[schema.name] || {}
    for (const key of schema.keys) {
        if (key === 'id') {
            c++
            prisma2Models[schema.name].id = `String                 @id @default(cuid()) //`;
        } else {
            const fieldDefinition = schema.getPathDefinition(key)
            let required = fieldDefinition.isArray || isRequired(fieldDefinition)
            const fieldType = getGraphQLType(fieldDefinition, key, required);
            const unique = fieldDefinition.table.unique ? '@unique' : ''
            let createdAt = '', updatedAt = ''
            let defaultValue = ''
            if (fieldDefinition.table.default !== undefined) {
                const wrapper = (fieldDefinition.type === String) ? '"' : ''
                defaultValue = `@default(${wrapper}${fieldDefinition.table.default}${wrapper})`
            }
            if ((fieldDefinition.table.createdAt === true || (fieldDefinition.table.createdAt !== false && key === 'createdAt'))) {
                createdAt = `@default(now())`
            }
            if ((fieldDefinition.table.updatedAt === true || (fieldDefinition.table.updatedAt !== false && key === 'updatedAt'))) {
                updatedAt = `@updatedAt`
            }

            if (fieldDefinition.table.default !== undefined) {
                const wrapper = (fieldDefinition.type === String) ? '"' : ''
                defaultValue = `@default(${wrapper}${fieldDefinition.table.default}${wrapper})`
            }
            if (fieldDefinition.isTable) {
                getPrismaModelAModelB(schema, fieldDefinition)
                if (!processedSubSchemas.includes(fieldDefinition.type)) {
                    processedSubSchemas.push(fieldDefinition.type)
                    getPrisma2Model(Schema.getInstance(fieldDefinition.type))
                }
            } else {
                prisma2Models[schema.name][key] = `${fieldType} ${unique} ${createdAt} ${updatedAt} ${defaultValue}`;

            }
        }
    }// end for
}

let c = 0
const getPrismaModelAModelB = (schema: Schema, fieldDefinition: FieldDefinition) => {
    if (!fieldDefinition.isTable) {
        throw new Error(`Relation must be an array`)
    }
    processed[schema.name] = processed[schema.name] || {}
    processed[schema.name][fieldDefinition.type] = processed[schema.name][fieldDefinition.type] || {}
    prisma2Models[fieldDefinition.type] = prisma2Models[fieldDefinition.type] || {}
    prisma2Models[schema.name] = prisma2Models[schema.name] || {}
    c++
    const childSchema = Schema.getInstance(fieldDefinition.type)
    const children = childSchema.keys.filter((fieldName: string) => childSchema.getPathDefinition(fieldName).type === schema.name)

    if (!processed[schema.name][fieldDefinition.type][fieldDefinition.key]) {
        if (schema.name === fieldDefinition.type) {
            if (fieldDefinition.isArray) {
                throw new Error(`DO THIS`)
            } else {
                if (fieldDefinition.isArray) {
                    throw new Error(`DO THIS`)
                } else {
                    const child = schema.getPathDefinition(fieldDefinition.key)

                    if (getRelation(fieldDefinition) !== getRelation(child)) {
                        throw new Error(`Relation must be the same`)
                    }
                    const relation = getRelationName(fieldDefinition, child) || `${schema.name}To${schema.name}`
                    const fields = `p2${fieldDefinition.key}Id`
                    if (fieldDefinition.table?.relation?.type === 'MANY_TO_MANY') {
                        throw new Error(`DO THIS`)
                    }else if (fieldDefinition.table?.relation?.type === 'ONE_TO_MANY') {
                        prisma2Models[schema.name][fieldDefinition.key] = `${schema.name}? ${buildRelation(relation, fields)} //SELF: 1 - N ((${c}))`;
                        prisma2Models[schema.name][fields] = `String? //SELF: 1 - N ((${c}))`;
                        prisma2Models[schema.name][`p2Predecessor${schema.name}`] = `${schema.name}[] ${buildRelation(relation)}//SELF: N - 1 ((${c}))`;
                    }else{ //ONT_TO_ONE
                        prisma2Models[schema.name][fieldDefinition.key] = `${schema.name}? ${buildRelation(relation, fields)} //SELF: 1 - 1 ((${c}))`;
                        prisma2Models[schema.name][fields] = `String? @unique //SELF: 1 - 1 ((${c}))`;
                        prisma2Models[schema.name][`p2Predecessor${schema.name}`] = `${schema.name}? ${buildRelation(relation)}//SELF: 1 - 1 ((${c}))`;
                    }

                }
            }
        } else {
            if (children.length === 0) {
                const relation = getRelationName(fieldDefinition)
                if (fieldDefinition.isArray) {
                    if (!fieldDefinition.table?.relation?.type || !['MANY_TO_MANY','ONE_TO_MANY'].includes(fieldDefinition.table?.relation?.type) ) {
                        throw new Error(`Relation must be defined MANY_TO_MANY || ONE_TO_MANY- ${schema.name}.${fieldDefinition.key}`)
                    }
                    if (fieldDefinition.table?.relation?.type === 'ONE_TO_MANY') {
                        //relation many to one
                        prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}[] ${buildRelation(relation)}//CREATE: n - 1 ((${c}))`;
                        const fields = `p2${relation}${schema.name}Id`
                        prisma2Models[fieldDefinition.type][`p2${relation}${schema.name}`] = `${schema.name}? ${buildRelation(relation, fields)}  //=>CREATE: n - 1 ((${c}))`;
                        prisma2Models[fieldDefinition.type][fields] = `String? //=>CREATE:n - n  no children ((${c}))`;
                    }else if (fieldDefinition.table?.relation?.type === 'MANY_TO_MANY') {
                        //relation many to many
                        prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}[] ${buildRelation(relation)}//CREATE: n - 1 ((${c}))`;
                        prisma2Models[fieldDefinition.type][`p2${relation}${schema.name}`] = `${schema.name}[] //=>CREATE: n - n no children((${c}))`;
                    }
                } else {
                    if (!fieldDefinition.table?.relation?.type) {
                        throw new Error(`Relation must be defined ONE_TO_ONE || ONE_TO_MANY- ${schema.name}.${fieldDefinition.key}`)
                    }
                    if (fieldDefinition.table?.relation?.type === 'ONE_TO_ONE') {
                        const fields = `p2${relation}${schema.name}Id`
                        prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}? ${buildRelation(relation)}//INLINE : 1 - 1 ((${c}))`;
                        prisma2Models[fieldDefinition.type][`p2${relation}${schema.name}`] = `${schema.name}?  ${buildRelation(relation, fields)} //=>INLINE: 1 - 1 ((${c}))`;
                        prisma2Models[fieldDefinition.type][fields] = `String?  @unique //=>INLINE: 1 - 1 ((${c}))`;
                    } else if (fieldDefinition.table?.relation?.type === 'ONE_TO_MANY') {
                        const fields = `p2${relation}${fieldDefinition.type}Id`
                        prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}? ${buildRelation(relation, fields)}//CREATE: 1 - n ((${c}))`;
                        prisma2Models[schema.name][fields] = `String? //=>CREATE: 1 - n ((${c}))`;
                        prisma2Models[fieldDefinition.type][`p2${relation}${schema.name}`] = `${schema.name}[]  ${buildRelation(relation)} //=>CREATE: 1 - n ((${c}))`;
                    } else {
                        throw new Error(`many to one does no exists for create - ${schema.name}.${fieldDefinition.key}`)
                    }
                }
            } else if (children.length >= 1) {
                let child: FieldDefinition
                if (children.length === 1) {
                    child = childSchema.getPathDefinition(children[0])
                } else {
                    const childName = children.find((childName: string) => getRelation(childSchema.getPathDefinition(childName)) === getRelation(fieldDefinition))
                    if (!childName) {
                        throw new Error(`Relation not found111`)
                    }
                    child = childSchema.getPathDefinition(childName)
                }
                if (!child) {
                    throw new Error(`Relation not found222`)
                }

                if (child.isArray) { // means that the parent is the array (because fieldDefinition.isArray is array then child is the gran children which is really the parent)
                    const relation = getRelationName(fieldDefinition, child)
                    if (fieldDefinition.isArray) {
                        //relation many to many
                        prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}[]  ${buildRelation(relation)} //n - n ((${c}))`;
                        prisma2Models[fieldDefinition.type][child.key] = `${child.type}[] ${buildRelation(relation)} //=>n - n ((${c}))`;
                    } else {
                        //relation one to many
                        const relation = getRelationName(fieldDefinition, child)
                        const fields = `p2${relation}${fieldDefinition.type}Id`
                        prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}?   ${buildRelation(relation, fields)} //n - 1 ((${c}))`;
                        prisma2Models[schema.name][fields] = `String?  //n - 1 ((${c}))`;
                        prisma2Models[fieldDefinition.type][child.key] = `${schema.name} [] ${buildRelation(relation)}//=>n - 1 ((${c}))`;

                    }
                } else {
                    const relation = getRelationName(fieldDefinition, child)
                    if (fieldDefinition.isArray) {
                        //relation many to many
                        const fields = `p2${relation}${schema.name}Id`
                        prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}[] ${buildRelation(relation)}//1 - n ((${c}))`;
                        prisma2Models[fieldDefinition.type][child.key] = `${schema.name}?  ${buildRelation(relation, fields)} //=>n - 1 ((${c}))`;
                        prisma2Models[fieldDefinition.type][fields] = `String?  //=>n - 1 ((${c}))`;

                    } else {
                        if (!fieldDefinition.table?.relation?.owner && !child.table?.relation?.owner) {
                            throw new Error(`Relation must be defined a owner - ${schema.name}.${fieldDefinition.key}`)
                        }
                        if (fieldDefinition.table?.relation?.owner && child.table?.relation?.owner) {
                            throw new Error(`Relation booth can not be a owner - ${schema.name}.${fieldDefinition.key}`)
                        }
                        if (fieldDefinition.table?.relation?.owner) {
                            const fields = `p2${relation}${schema.name}Id`
                            prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}? ${buildRelation(relation)}//OWNER 1 - 1 ((${c}))`;
                            prisma2Models[fieldDefinition.type][child.key] = `${schema.name}?  ${buildRelation(relation, fields)} //OWNER =>1 - 1 ((${c}))`;
                            prisma2Models[fieldDefinition.type][fields] = `String?  @unique //OWNER =>1 - 1 ((${c}))`;
                        } else {
                            const fields = `p2${relation}${fieldDefinition.type}Id`
                            prisma2Models[schema.name][fieldDefinition.key] = `${fieldDefinition.type}? ${buildRelation(relation, fields)}//OWNED 1 - 1 ((${c}))`;
                            prisma2Models[schema.name][fields] = `String?  @unique  //OWNED =>1 - 1 ((${c}))`;
                            prisma2Models[fieldDefinition.type][child.key] = `${child.type}? ${buildRelation(relation)} //OWNED =>1 - 1 ((${c}))`;
                        }
                    }
                }
                processed[fieldDefinition.type] = processed[fieldDefinition.type] || {}
                processed[fieldDefinition.type][schema.name] = processed[fieldDefinition.type][schema.name] || {}
                processed[fieldDefinition.type][schema.name][child.key] = true
            } else {
                throw new Error(`Relation must be have name`)
            }
        }
    }
}


function getRelation(fieldDefinition: FieldDefinition) {
    if (!fieldDefinition.table.relation) return ''
    if (typeof fieldDefinition.table.relation === 'string') {
        return fieldDefinition.table.relation
    }
    return fieldDefinition.table.relation.name || ''
}

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

function buildRelation(relation: string, fields?: string) {
    if (!relation && !fields) return ''
    if (!relation) return `@relation(fields: [${fields}],  references: [id])`
    if (fields) {
        return `@relation("${relation}", fields: [${fields}],  references: [id])`
    }
    return `@relation("${relation}")`

}

const getRelationName = (def1: FieldDefinition, def2?: FieldDefinition) => {
    const n1 = getRelation(def1)
    if (!def2) {
        if (!n1) {
            return ''
        }
        return n1
    }
    const n2 = getRelation(def2)
    if (n1 !== n2) {
        throw new Error(`Relation name must be equal ${n1} ${n2}`)
    }
    if (!n1) return ""
    return n1
}
