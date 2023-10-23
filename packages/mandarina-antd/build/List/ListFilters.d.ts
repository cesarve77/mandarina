import { FieldDefinitionNative, FilterComponent } from "mandarina/build/Schema/Schema";
import { Where } from "./ListFilter";
import { Schema } from "mandarina";
export declare const AllOperators: {
    [subfix: string]: {
        description: string;
        symbol: string;
    };
};
export declare const getDefaultFilterMethod: (field: string, schema: Schema) => Where;
export declare const getDefaultComponent: (fieldDefinition: FieldDefinitionNative) => FilterComponent;
export declare const unsetDeep: (obj: object, path: string[]) => void;
