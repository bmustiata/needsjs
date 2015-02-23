var fs = require("fs");

/**
 * NeedsExecutor - A class that allows executing stuff.
 * @return {void}
 */
function NeedsExecutor(_evalFn) {
	this._evalFn = _evalFn;
}

/**
 * needs - Requires another thing.
 * @param {} moduleName
 * @return {void}
 */
NeedsExecutor.prototype.needs = function(moduleName) {
    if (this.isNodeModule(moduleName)) {
        return require(moduleName); // simply use node to load it.
    } else {
        return this.localLoad(moduleName);
    }
}

/**
 * isNodeModule - Checks if the given name is a node module.
 * @param {} moduleName
 * @return {void}
 */
NeedsExecutor.prototype.isNodeModule = function(moduleName) {
    // if it starts with ./ or ../ then it's a local module
    if (/^\.\//.test(moduleName) || /^\.\/\//.test(moduleName)) {
        return false;
    }

    return true;
}

/**
 * localLoad - Loads the current module.
 * @param {} moduleName
 * @return {void}
 */
NeedsExecutor.prototype.localLoad = function(moduleName) {
    var code = fs.readFileSync(moduleName, {
        encoding : 'utf8'
    });

    code = code.replace(/(\W?)needs\((.*?)\);/g, "$1process._needs.needs($2);");

    this._evalFn(code);
}

/**
 * createNeeds - Create a needs function bounded to the given context
 * eval function.
 * @param {} evalFunction
 * @return {void}
 */
function createNeeds(evalFunction) {
    var needsObject = new NeedsExecutor(evalFunction);
    process._needs = needsObject;

    return needsObject.needs.bind(needsObject);
}

/**
 * Export the needs function.
 */
exports.createNeeds = createNeeds;

