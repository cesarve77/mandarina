import { ErrorFromServerMapper, Permission, Schema } from "mandarina/build/Schema/Schema";
import { Hook } from "../Table/Table";
export declare class CustomAction {
    static instances: {
        [actionName: string]: CustomAction;
    };
    schema?: Schema;
    name: string;
    options: ActionOptions;
    actions: ActionInterface;
    protected static hook: Hook;
    static setGlobalHook: (hook: Hook) => void;
    /**
     *
     *
     * @param schema
     * @param actionOptions
     */
    constructor(schema: Schema | string, actionOptions: ActionOptions);
    static getInstance(name: string): CustomAction;
    getFields(): string[] | undefined;
    getActions(): {};
}
export interface ActionOptions {
    name?: string;
    actions: ActionInterface;
    errorFromServerMapper?: ErrorFromServerMapper;
}
export interface ActionInterface {
    [name: string]: {
        permission?: Permission;
        action: (_: any, args: any, context: any, info: any) => any | Promise<any>;
        fields?: string[] | {
            [field: string]: Permission;
        };
        result: string;
    };
}
