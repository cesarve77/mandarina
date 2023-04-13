declare module 'node-yaml'

declare module 'browser-or-node' {
    export function isBrowser(): boolean
}
declare module 'activity-detector' {
    const x: any;
    export default  x
}

interface FlatObj {
    [key: string]: any
}

interface FlatOptions {
    delimiter?: string
    safe?: boolean
    object?: boolean
    overwrite?: boolean
    maxDepth?: number

}

declare module 'flat' {
    export function flatten(original: any, options?: FlatOptions): FlatObj

    export function unflatten(original: FlatObj, options?: FlatOptions): any
}
