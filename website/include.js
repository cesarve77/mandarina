var path = require('path'),
    fs = require('fs');

var INCLUDE_RE = /\!{1}\s*inc\s*\(\s*(.+?)\s*\)\s*\!{1}/i;


module.exports = function include_plugin(md, options) {
    var root = '.',
        includeRe = INCLUDE_RE;

    if (options) {
        if (typeof options === 'string') {
            root = options;
        } else {
            root = options.root || root;
            includeRe = options.includeRe || includeRe;
        }
    }

    function _replaceIncludeByContent(src, rootdir, parentFilePath, filesProcessed) {
        filesProcessed = filesProcessed ? filesProcessed.slice() : []; // making a copy
        var cap, filePath, mdSrc, indexOfCircularRef;

        // store parent file path to check circular references
        if (parentFilePath) {
            filesProcessed.push(parentFilePath);
        }
        while ((cap = includeRe.exec(src))) {
            filePath = path.resolve(rootdir, cap[1].trim());

            // check if circular reference
            indexOfCircularRef = filesProcessed.indexOf(filePath);
            if (indexOfCircularRef !== -1) {
                throw new Error('Circular reference between ' + filePath + ' and ' + filesProcessed[indexOfCircularRef]);
            }

            // replace include by file content
            mdSrc = fs.readFileSync(filePath, 'utf8');
            mdSrc = _replaceIncludeByContent(mdSrc, path.dirname(filePath), filePath, filesProcessed);
            src = src.slice(0, cap.index) + mdSrc + src.slice(cap.index + cap[0].length, src.length);
        }
        const includeRe2 = /#{1,5} (\d.?){1,5} (\w*)\n/gim
        while ((cap = includeRe2.exec(src))) {
            filePath = path.resolve(rootdir, cap[2].trim()) + '.md'
            if (fs.existsSync(filePath)) {
                // check if circular reference
                indexOfCircularRef = filesProcessed.indexOf(filePath);
                if (indexOfCircularRef !== -1) {
                    throw new Error('Circular reference between ' + filePath + ' and ' + filesProcessed[indexOfCircularRef]);
                }

                // replace include by file content
                mdSrc = fs.readFileSync(filePath, 'utf8');
                mdSrc = cap[0] + _replaceIncludeByContent(mdSrc, path.dirname(filePath), filePath, filesProcessed);
                src = src.slice(0, cap.index) + mdSrc + src.slice(cap.index + cap[0].length, src.length);
            }

        }
        return src;
    }

    function _includeFileParts(state) {
        state.src = _replaceIncludeByContent(state.src, root);
    }

    md.core.ruler.before('block', 'include', _includeFileParts);
};