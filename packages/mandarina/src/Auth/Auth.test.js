"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Auth_1 = require("./Auth");
describe('Auth', function () {
    test("addToSet", function () {
        var array1 = [1, 2, 3, 4];
        Auth_1.addToSet(array1, [1, 2, 3, 4, 5]);
        expect(array1).toMatchObject([1, 2, 3, 4, 5]);
        Auth_1.addToSet(array1, [1, 2, 6, 3, 4, 5]);
        expect(array1).toMatchObject([1, 2, 3, 4, 5, 6]);
        Auth_1.addToSet(array1, [5, 2, 3, 4, 1, 6, 7, 7, 7, 8]);
        expect(array1).toMatchObject([1, 2, 3, 4, 5, 6, 7, 8]);
    });
});
