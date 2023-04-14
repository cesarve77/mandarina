import { Context } from "./Table/Table";
export default class Mandarina {
    static load(): void;
    static config: MandarinaConfigDefault;
    static configure: (options: MandarinaConfigOptions) => void;
    static getQuery(): {};
    static getMutation(): {};
}
declare type GetUser = (context: Context) => Promise<UserType | null | undefined> | UserType | null | undefined;
export interface MandarinaConfigOptions {
    getUser?: GetUser;
}
export interface MandarinaConfigDefault extends MandarinaConfigOptions {
    getUser: GetUser;
}
export declare type UserType = {
    id: string;
    roles: string[];
    [otherProperties: string]: any;
};
export {};
