"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exportFnc = function (_a) {
    var query = _a.query, client = _a.client, where = _a.where;
    return new Promise(function (resolve, reject) {
        client.query({
            // @ts-ignore
            query: query,
            variables: {
                where: where
            }
        }).then(function (res) {
        }).catch(reject);
    });
};
exports.default = exportFnc;
//# sourceMappingURL=Export.js.map