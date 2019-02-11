import {Schema} from "mandarina";
import {capitalize, isRequired} from "mandarina/build/Schema/utils";
import {CustomAction, Table} from "mandarina-server";
import path from "path";
import fs from "fs";
import {getParents} from "mandarina/build/utils";

export const getDeclarationType = (type: any, key: string): string => {

    let typeName = type
    if (type.name) typeName = type.name
    if (Array.isArray(type)) typeName = 'Array'
    switch (typeName) {
        case 'String':
            return `string`;

        case 'Boolean':
            return `boolean`;

        case 'Number':
            return `number`;

        case 'Integer':
            return `number`;

        case 'Array':
            if (typeof type[0] === 'string') {
                const schema = Schema.getInstance(type[0])
                const interfaceName = buildInterfaceName(schema)

                return `${interfaceName}[]`
            }
            const scalarName = getDeclarationType(type[0], key)
            return `${scalarName}[]`
        case 'Object':
            throw new Error(`Error in field definition ${key}. Fields Table definitions do not accept objects, please use composite tables`)

        case 'Date':
            return `Date`;
        default:
            if (typeof type === 'string') {
                const schema = Schema.getInstance(type)
                const interfaceName = buildInterfaceName(schema)
                return `${interfaceName}`
            }
            throw new Error(`Error in field definition ${key}. Fields Table definitions do not accept objects, please use composite tables`)
    }
}

export const getGraphQLType = (type: any, key: string, required: '' | '!' = '',isInput:boolean=false): string => {
    //if (isBrowser) throw new Error('_functionCreator is not avaiblabe on browser')
    const input=isInput ? 'Input' : ''
    let typeName = type
    if (type.name) typeName = type.name
    if (Array.isArray(type)) typeName = 'Array'
    switch (typeName) {
        case 'String':
            return `String${required}`;

        case 'Boolean':
            return `Boolean${required}`;

        case 'Number':
            return `Float${required}`;

        case 'Integer':
            return `Int${required}`;

        case 'Array':

            if (typeof type[0] === 'string') {
                const schemaName = Schema.getInstance(type[0]).name
                return `[${schemaName}${input}!]!`
            }
            const scalarName = getGraphQLType(type[0], key)
            return `[${scalarName}!]${required}`
        case 'Object':
            throw new Error(`Error in field definition ${key}. Fields Table definitions do not accept objects, please use composite tables`)

        case 'Date':
            return `DateTime`;
        default:
            return typeName + input;
    }
}

export const buildInterfaceName = (schema: Schema | string): string => schema instanceof Schema ? `${schema.name}Interface` : `${schema}Interface`

const getMainSchema = (schema: Schema, type: 'input' | 'type') => {
    let mainSchema = []
    for (const key of schema.keys) {
        if (key === 'id' && type === 'type') {
            if (!!Table.instances[schema.name]) {
                mainSchema.push(`id: ID! @unique`);
            }
            continue
        }
        const field = schema.getFieldDefinition(key)

        const required = isRequired(field) ? '!' : ''
        const unique = type === 'type' && field.table.unique ? '@unique' : ''
        let defaultValue = ''
        if (type === 'type' && field.table.default !== undefined) {
            const wrapper = (field.type === String) ? '"' : ''
            defaultValue = `@default(value: ${wrapper}${field.table.default}${wrapper})`
        }
        const rename = (type === 'type' && field.table.rename !== undefined) ? `@rename(oldName: "${field.table.default}")` : ''
        let relation = ''
        if (type === 'type' && field.table.relation !== undefined) {
            if (typeof field.table.relation === "string") {
                relation = `@relation(name: "${field.table.relation}")`
            } else {
                let name = '', onDelete = ''
                if (field.table.relation.name) {
                    name = `name: "${field.table.relation.name}"`
                }
                if (field.table.relation.onDelete) {
                    onDelete = `onDelete: ${field.table.relation.onDelete}`
                }
                if (name || onDelete) {
                    relation = `@relation(${name} ${onDelete})`
                }


            }
        }

        const fieldType = getGraphQLType(field.type, key, required,false);

        field.description && mainSchema.push(`# ${field.description}`);
        mainSchema.push(`${key}: ${fieldType} ${unique} ${defaultValue} ${relation} ${rename}`);
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

export const savePrismaYaml = (models:string[],dir: string,secret: string) => {
    const yaml: any = require("node-yaml")
    const prismaDir = path.join(process.cwd(), dir)
    const prismaYaml = path.join(prismaDir, `prisma.yml`)
    const prisma: { datamodel: string[], secret: string } = yaml.readSync(prismaYaml) || {};
    prisma.secret = secret
    prisma.datamodel = models;
    yaml.writeSync(prismaYaml, prisma);
}




export const getSubSchemas = (schema: Schema): string[] => {
    const subSchemas:string[]=[]
    const parents = getParents(schema.getFields())
    parents.forEach((field) => {
        const fieldDefinition = schema.getPathDefinition(field)
        if (typeof fieldDefinition.type === 'string') {
            const schemaName=fieldDefinition.type
            subSchemas.push(schemaName)
            subSchemas.push(...getSubSchemas(Schema.getInstance(schemaName)))
        }
        if (Array.isArray(fieldDefinition.type) && typeof fieldDefinition.type[0] === 'string') {
            const schemaName=<string>(fieldDefinition.type[0])
            subSchemas.push(schemaName)
            subSchemas.push(...getSubSchemas(Schema.getInstance(schemaName)))
        }
    })
    return subSchemas
}


export const getGraphQLOperation = (action: CustomAction,schema: Schema) => {
    let response=''
    const actions = action.actions;
    if (actions) {
        Object.keys(actions).forEach((actionName: string) => {
            const action = actions[actionName];
            const input=schema ? `(data: ${capitalize(actionName)}Input!)` : ''
            response += `extend type ${capitalize(action.type)} {\n\t${actionName} ${input}: ${action.result}\n}`;
        })
    }
    return response;
}



export const getAuthOperation = () => { //todo unify with Table save files
    return  `extend type Query {\n\tAuthFields(action: String!, table: String!) :  [String!]\n}`
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