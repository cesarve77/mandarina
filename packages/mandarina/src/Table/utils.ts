import * as inflection from "inflection";
import {Schema} from "../Schema/Schema";
import {isRequired} from "../Schema/utils";

/**
 * Upper case the first latter
 * @param  string - string to be upper cased
 */
export const capitalize = (string: string): string => {
    const result = string.trim()
    return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * Lower case the first latter
 * @param  string - string to be Lower cased
 */
export const lowerize = (string: string): string => {
    const result = string.trim()
    return result.charAt(0).toLowerCase() + result.slice(1)
}

export const pluralize = (str: string): string => {
    let result: string = inflection.underscore(str).trim()
    result = inflection.humanize(result)
    const resultSplit: string[] = result.split(' ')
    let lastWord = <string>resultSplit.pop();
    lastWord = inflection.pluralize(lastWord)
    return inflection.camelize([...resultSplit, lastWord].join('_'), true)
}

export const singularize = (str: string): string => {
    let result = inflection.underscore(str).trim()
    result = inflection.humanize(result)
    const resultSplit: string[] = result.split(' ')
    let lastWord = <string>resultSplit.pop()
    lastWord = inflection.singularize(lastWord)
    return inflection.camelize([...resultSplit, lastWord].join('_'), true)
}

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

export const getGraphQLType = (type: any, key: string, required: '' | '!' = ''): string => {
    //if (isBrowser) throw new Error('_functionCreator is not avaiblabe on browser')

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
                return `[${schemaName}!]!`
            }
            const scalarName = getGraphQLType(type[0], key)
            return `[${scalarName}!]${required}`
        case 'Object':
            throw new Error(`Error in field definition ${key}. Fields Table definitions do not accept objects, please use composite tables`)

        case 'Date':
            return `DateTime`;
        default:
            return typeName;
    }
}

export const buildInterfaceName = (schema: Schema | string): string => schema instanceof Schema ? `${schema.name}Interface` : `${schema}Interface`

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
            if (!dir){
                dir='.'
            }else if (dir.indexOf('.') !== 0) {
                dir = './' + dir
            }
            headers.push(`import { ${interfaceName} } from "${dir}/${interfaceName}"`);
        }
        field.description && declarations.push(`// ${field.description}`);
        declarations.push(`    ${key}${optional}: ${fieldType}`);
    }
    declarations.push('}')
    return headers.concat(declarations).join('\n')
}
const getMainSchema = (schema: Schema, type: 'input' | 'type') => {
    let mainSchema = []
    for (const key of schema.keys) {
        if (key === 'id' && !schema.options.virtual) {
            mainSchema.push(`id: ID! @unique`);
            continue
        }
        const field = schema.getFieldDefinition(key)
        const required = isRequired(field) ? '!' : ''
        const unique = type === 'type' && field.unique ? '@unique' : ''
        const fieldType = getGraphQLType(field.type, key, required);
        field.description && mainSchema.push(`# ${field.description}`);
        mainSchema.push(`${key}: ${fieldType} ${unique}`);
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
