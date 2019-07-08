import {EqualityFn} from "memoize-one";

export const equalityFn: EqualityFn = (
    newArgs: any[],
    lastArgs: any[],
): boolean =>
    newArgs.length === lastArgs.length &&
    newArgs.every(
        (newArg: any, index: number): boolean =>
            newArg === lastArgs[index],
    );
