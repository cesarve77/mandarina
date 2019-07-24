import {Schema} from "mandarina";
import {capitalize, isRequired} from "mandarina/build/Schema/utils";
import {CustomAction} from "../../";
import path from "path";
import fs from "fs";
import merge from 'lodash.merge'
import {FieldDefinition} from "mandarina/build/Schema/Schema";
//
// export const getDeclarationType = (type: any, key: string): string => {
//
//     let typeName = type
//     if (type.name) typeName = type.name
//     if (Array.isArray(type)) typeName = 'Array'
//     switch (typeName) {
//         case 'String':
//             return `string`;
//
//         case 'Boolean':
//             return `boolean`;
//
//         case 'Number':
//             return `number`;
//
//         case 'Integer':
//             return `number`;
//
//         case 'Array':
//             if (typeof type[0] === 'string') {
//                 const schema = Schema.getInstance(type[0])
//                 const interfaceName = buildInterfaceName(schema)
//
//                 return `${interfaceName}[]`
//             }
//             const scalarName = getDeclarationType(type[0], key)
//             return `${scalarName}[]`
//         case 'Object':
//             throw new Error(`Error in field definition ${key}. Fields Table definitions do not accept objects, please use composite tables`)
//
//         case 'Date':
//             return `Date`;
//         default:
//             if (typeof type === 'string') {
//                 const schema = Schema.getInstance(type)
//                 const interfaceName = buildInterfaceName(schema)
//                 return `${interfaceName}`
//             }
//             throw new Error(`Error in field definition ${key}. Fields Table definitions do not accept objects, please use composite tables`)
//     }
// }

export const getGraphQLType = (def: FieldDefinition, key: string, required: '' | '!' = '', isInput: boolean = false): string => {
    //if (isBrowser) throw new Error('_functionCreator is not avaiblabe on browser')
    const input = isInput ? 'Input' : ''
    switch (true) {
        case (!def.isArray && !def.isTable && def.type.name === 'String'):
            return `String${required}`;

        case (!def.isArray && !def.isTable && def.type.name === 'Boolean'):
            return `Boolean${required}`;

        case (!def.isArray && !def.isTable && def.type.name === 'Number'):
            return `Float${required}`;

        case (!def.isArray && !def.isTable && def.type.name === 'Integer'):
            return `Int${required}`;
        case (!def.isArray && !def.isTable && def.type.name === 'Date'):
            return `DateTime${required}`;
        case (def.isArray && def.isTable):
            return `[${def.type}${input}!]${required}`
        case (def.isArray && !def.isTable):
            const scalarName = getGraphQLType({...def, isArray: false}, key)
            return `[${scalarName}!]${required}`


        default:
            const schemaName = def.type
            if (isInput && def.isTable && def.form && def.form.props && def.form.props.query) {
                console.log('`${schemaName}WhereUnique${input}${required}`', `${schemaName}WhereUnique${input}${required}`)
                return `${schemaName}WhereUnique${input}${required}`
            }
            return def.type + input + required;
    }
}

// export const buildInterfaceName = (schema: Schema | string): string => schema instanceof Schema ? `${schema.name}Interface` : `${schema}Interface`

const getMainSchema = (schema: Schema, type: 'input' | 'type') => {
    let mainSchema = []
    for (const key of schema.keys) {
        if (key === 'id' && type === 'type') {
            mainSchema.push(`id: ID! @id`);
            continue
        }
        const fieldDefinition = schema.getPathDefinition(key)

        const required = isRequired(fieldDefinition) ? '!' : ''
        const unique = type === 'type' && fieldDefinition.table.unique ? '@unique' : ''
        let defaultValue = ''
        if (type === 'type' && fieldDefinition.table.default !== undefined) {
            const wrapper = (fieldDefinition.type === String) ? '"' : ''
            defaultValue = `@default(value: ${wrapper}${fieldDefinition.table.default}${wrapper})`
        }
        const rename = (type === 'type' && fieldDefinition.table.rename !== undefined) ? `@rename(oldName: "${fieldDefinition.table.default}")` : ''
        const relations: string[] = []
        let relation: string = ''
        if (type === 'type' && fieldDefinition.table.relation !== undefined) {
            if (typeof fieldDefinition.table.relation === "string") {
                relations.push(`name: "${fieldDefinition.table.relation}"`)
            } else {
                if (fieldDefinition.table.relation.link) {
                    relations.push(`link: ${fieldDefinition.table.relation.link}`)
                }
                if (fieldDefinition.table.relation.name) {
                    relations.push(`name: "${fieldDefinition.table.relation.name}"`)
                }
                if (fieldDefinition.table.relation.onDelete) {
                    relations.push(`onDelete: ${fieldDefinition.table.relation.onDelete}`)
                }
            }
            if (relations.length > 0) {
                relation = `@relation(${relations.join(', ')})`
            }
        }
        let scalarList = '', createdAt = '', updatedAt = ''
        if (type === 'type' && fieldDefinition.table.scalarList) {
            scalarList = `@scalarList(strategy: ${fieldDefinition.table.scalarList.strategy})`
        }
        if (type === 'type' && (fieldDefinition.table.createdAt === true || (fieldDefinition.table.createdAt !== false && key === 'createdAt'))) {
            createdAt = `@createdAt`
        }
        if (type === 'type' && (fieldDefinition.table.createdAt === true || (fieldDefinition.table.updatedAt !== false && key === 'updatedAt'))) {
            createdAt = `@updatedAt`
        }
        if (!scalarList && type === 'type' && fieldDefinition.isArray && !fieldDefinition.isTable) {
            scalarList = `@scalarList(strategy: RELATION)`
        }
        const fieldType = getGraphQLType(fieldDefinition, key, required, type === 'input');

        fieldDefinition.description && mainSchema.push(`# ${fieldDefinition.description}`);
        mainSchema.push(`${key}: ${fieldType} ${unique} ${createdAt} ${updatedAt} ${defaultValue} ${relation} ${scalarList} ${rename}`);
    }
    return mainSchema
}
const getGraphQL = (type: 'input' | 'type', schema: Schema) => {
    const name = schema.name
    //if (isBrowser) throw new Error('getGraphQLSchema is not available on browser')
    let mainSchema = getMainSchema(schema, type), graphQLSchema = '';
    const description = `${capitalize(type)} for ${name}`
    if (mainSchema.length) {
        graphQLSchema += `# ${description}\n`
        graphQLSchema += `${type} ${name}${type === 'input' ? 'Input' : ''} {\n`
        graphQLSchema += `\t${mainSchema.join('\n\t')}\n`
        graphQLSchema += `}`
    }
    return graphQLSchema;
}

export const getGraphQLModel = (schema: Schema) => getGraphQL('type', schema)
export const getGraphQLInput = (schema: Schema) => getGraphQL('input', schema)

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const createDir = (dir: string) => {
    const prismaDir = path.join(process.cwd(), dir)
    if (!fs.existsSync(`${prismaDir}/datamodel`)) {
        fs.mkdirSync(`${prismaDir}/datamodel`);
    }

}
export const saveFile = (dir: string, fileName: string, content: string, fileType: 'model' | 'input' | 'operation') => {
    const prismaDir = path.join(process.cwd(), dir)
    const fileAbs = `${prismaDir}/datamodel/${fileName}.${fileType}.graphql`;
    fs.writeFileSync(fileAbs, content);
    console.log(`saving ${fileType}: ${fileName}`)
}


export const resetDir = (dir: string) => {
    const prismaDir = path.join(process.cwd(), dir)
    const datamodelDir = path.join(prismaDir, 'datamodel');
    fs.readdirSync(datamodelDir).forEach((file: string) => fs.unlinkSync(path.join(datamodelDir, file)));
}

export const savePrismaYaml = (datamodel: Set<string>, dir: string, endpoint: string, secret?: string,) => {
    const prismaDir = path.join(process.cwd(), dir)
    const prismaYaml = path.join(prismaDir, `prisma.yml`)
    const data: { endpoint: string, datamodel: Set<string>, secret?: string } = {endpoint, datamodel,}
    if (secret) data.secret = secret
    saveYaml(prismaYaml, data)
}

export const saveDockerComposeYaml = (dir: string, port: string) => {
    const prismaDir = path.join(process.cwd(), dir)
    const dcYaml = path.join(prismaDir, `docker-compose.yml`)
    if (!fs.existsSync(dcYaml)) return console.warn(`"${dcYaml}" file does not exists`)
    saveYaml(dcYaml, {
        services: {
            prisma: {
                ports: [`${port}:${port}`],
                environment: {
                    PRISMA_CONFIG: {
                        port,
                    }
                }
            }
        }
    })
}

const saveYaml = (file: string, data: any) => {
    const yaml: any = require("yaml")
    const contentFile = fs.readFileSync(file, {encoding: 'utf8'}).replace(/([\t ]*)PRISMA_CONFIG *: *(\||>)?\n/, '$1PRISMA_CONFIG:\n')
    let originalData = yaml.parse(contentFile) || {};
    data.datamodel = Array.from(data.datamodel)
    const newData = merge(originalData, data)
    const str = yaml.stringify(newData).replace(/([\t ]*)PRISMA_CONFIG *: *\n/, '$1PRISMA_CONFIG: |\n')
    fs.writeFileSync(file, str);
}
export const getSubSchemas = (schema: Schema, processedSchemas: string[] = []): string[] => {
    const subSchemas: string[] = []
    if (processedSchemas.includes(schema.name)) return subSchemas
    processedSchemas.push(schema.name)
    schema.getSubSchemas().forEach(field => {
        const fieldDefinition = schema.getPathDefinition(field)
        if (!fieldDefinition.isTable) return
        console.log('parent',schema.name,field)

        if (!(fieldDefinition.form && fieldDefinition.form.props && fieldDefinition.form.props.query)) {
            const schemaName = fieldDefinition.type
            subSchemas.push(schemaName)
            subSchemas.push(...getSubSchemas(Schema.getInstance(schemaName), processedSchemas))
        }
    })
    return subSchemas
}


export const getGraphQLOperation = (action: CustomAction, schema: Schema) => {
    let response = '', input = ''
    const actions = action.actions;
    if (action.schema) {
        const actionName = action.schema.name
        input = schema ? `(data: ${capitalize(actionName)}Input!)` : ''
    }
    if (actions) {
        Object.keys(actions).forEach((actionName: string) => {
            const action = actions[actionName];
            response += `extend type Mutation {\n\t${actionName} ${input}: ${action.result}\n}`;
        })
    }
    return response;
}


export const getAuthOperation = () => { //todo unify with Table save files
    return `extend type Query {\n\tAuthFields(action: String!, table: String!) :  [String!]\n}`
}

/*

export const getDeclarations = (schema: Schema): string => {
    const headers: string[] = []
    const path = require('path')
    const schemaDeclarationName = buildInterfaceName(schema)
    let declarations = [`export interface ${schemaDeclarationName} {`]
    for (const key of schema.keys) {
        const field = schema.getFieldDefinition(key)
        const optional = isRequired(field) || key === 'id' ? '' : '?'
        const fieldType = getDeclarationType(field.type, key);
        let schemaName: string = ""
        if (Array.isArray(field.type) && typeof field.type[0] === 'string') {
            schemaName = <string>field.type[0]
        }
        if (typeof field.type === 'string') schemaName = field.type
        if (schemaName) {
            const childSchema = Schema.getInstance(schemaName)
            const interfaceName = buildInterfaceName(schemaName)
            let dir = path.relative(schema.getFilePath(), childSchema.getFilePath())
            if (!dir) {
                dir = '.'
            } else if (dir.indexOf('.') !== 0) {
                dir = './' + dir
            }
            headers.push(`import { ${interfaceName} } from "${dir}/${interfaceName}"`);
        }
        field.description && declarations.push(`// ${field.description}`);
        declarations.push(`    ${key}${optional}: ${fieldType} ${optional ? ' | null' : ''}`);
    }
    declarations.push('}')
    return headers.concat(declarations).join('\n')
}
 */