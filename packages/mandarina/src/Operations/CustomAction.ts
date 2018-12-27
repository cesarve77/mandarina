import {ErrorFromServerMapper, Schema} from "../Schema/Schema";
import {TableInstanceNotFound} from "../Errors/TableInstanceNotFound";
import {UniqueActionError} from "../Errors/UniqueActionError";
import {Hook, operationType, Permission} from "../Table/Table";

/**
 *
 * A Table instance is the representation of the one of several of the followings:
 * Physic table in the data base
 * Form
 * List of results
 */

export class CustomAction {
    // An object with all table instances created
    static instances: { [name: string]: CustomAction };


    public schema?: Schema;
    public name: string;
    public options: ActionOptions
    public actions: ActionInterface
    public permissions: string[];


    /**
     *
     *
     * @param schema
     * @param actionOptions
     */
    constructor(schema: Schema | string, actionOptions: ActionOptions) {
        CustomAction.instances = CustomAction.instances || {};
        if (schema instanceof Schema) {
            this.schema = schema
            this.name = this.schema.name;
        } else {
            this.name = schema;
        }

        if (CustomAction.instances[this.name]) {
            throw new UniqueActionError(this.name);
        }
        this.permissions = actionOptions.permissions || ['everyone']
        this.actions = actionOptions.actions
        CustomAction.instances[this.name] = this;
    }


    static getInstance(name: string): CustomAction {
        if (!CustomAction.instances[name]) {
            throw new TableInstanceNotFound(name);
        }

        return CustomAction.instances[name];
    }

    getFields() {
        return this.schema && this.schema.getFields();
    }


    getActions(type: operationType) {
        const actions = this.actions || {};
        let result = {};

        Object.keys(actions).forEach((action) => {
            if (actions[action].type === type) {
                result[action] = async (_: any, args: any, context: any, info: any): Promise<any> => {
                    //todo: check permissions

                    return await actions[action].action(_, args, context, info)
                    // console.error('Actions permissions are not checked', this.permissions)
                    // if (this.options.onBefore) {
                    //     await this.options.onBefore(action, _, args, context, info)
                    // }
                    // const result = await actions[action].action(_, args, context, info)
                    // if (this.options.onAfter) {
                    //     this.options.onAfter(action, _, args, context, info)
                    // }
                    // return result
                }
                ;
            }
        });

        return result;
    }
}

export interface ActionOptions {
    actions: ActionInterface
    permissions?: Permission[]
    onBefore?: Hook
    onAfter?: Hook
    errorFromServerMapper?: ErrorFromServerMapper

}


export interface ActionInterface {
    [name: string]: {
        permissions?: Permission
        action: (_: any, args: any, context: any, info: any) => any | Promise<any>
        fields?: string[] | {
            [field: string]: Permission
        }
        type: operationType
        result: string
    }
}
