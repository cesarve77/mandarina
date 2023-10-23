import { Schema } from "mandarina";
import { CustomAction } from "../../";
import { FieldDefinition } from "mandarina/build/Schema/Schema";
export declare const getGraphQLType: (def: FieldDefinition, key: string, required?: '' | '!', isInput?: boolean) => string;
export declare const getGraphQLModel: (schema: Schema) => string;
export declare const getGraphQLInput: (schema: Schema) => string;
export declare const sleep: (ms: number) => Promise<unknown>;
export declare const createDir: (dir: string) => void;
export declare const saveFile: (dir: string, fileName: string, content: string, fileType: 'model' | 'input' | 'operation') => void;
export declare const resetDir: (dir: string) => void;
export declare const savePrismaYaml: (datamodel: Set<string>, dir: string, endpoint: string, secret?: string) => void;
export declare const saveDockerComposeYaml: (dir: string, port: string) => void;
export declare const getSubSchemas: (schema: Schema, processedSchemas?: string[]) => string[];
export declare const getGraphQLOperation: (action: CustomAction, schema: Schema) => string;
export declare const getAuthOperation: () => string;
