var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { DB } from "./db";
var WorkerHandler = (function () {
    function WorkerHandler(workerSpace) {
        this.workerSpace = workerSpace;
    }
    WorkerHandler.prototype.init = function (settings, port) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this.settings = settings;
                        this.db = new DB(this.workerSpace.indexedDB, this.workerSpace.IDBKeyRange, this.settings);
                        _a = this;
                        return [4 /*yield*/, this.db.connect()];
                    case 1:
                        _a.models = _b.sent();
                        port.postMessage({ status: 'success' });
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        port.postMessage({ status: 'error', error: e_1.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WorkerHandler.prototype.action = function (port, modelName, action, queryBuilder, content) {
        return __awaiter(this, void 0, void 0, function () {
            var result, e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.models.hasOwnProperty(modelName)) {
                            port.postMessage({ status: 'error', error: 'Invalid model called' });
                            return [2 /*return*/, false];
                        }
                        if (!this.models[modelName][action]) {
                            console.log(action, queryBuilder, content);
                            port.postMessage({ status: 'error', error: 'Invalid action called' });
                            return [2 /*return*/, false];
                        }
                        this.models[modelName].indexBuilder = queryBuilder.indexBuilder;
                        this.models[modelName].builder = queryBuilder.normalBuilder;
                        this.models[modelName].relations = queryBuilder.relations;
                        this.models[modelName].tables = queryBuilder.tables;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (_a = this.models[modelName])[action].apply(_a, content)];
                    case 2:
                        result = _b.sent();
                        port.postMessage({ status: 'success', content: result });
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _b.sent();
                        port.postMessage({ status: 'error', error: e_2.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WorkerHandler.prototype.onMessage = function (e) {
        switch (e.data.command) {
            case 'init':
                this.init(e.data.settings, e.ports[0]);
                break;
            case 'action':
                this.action(e.ports[0], e.data.modelName, e.data.action, this.parse(e.data.query), this.parse(e.data.content));
                break;
            case 'test':
                console.info(e.data, e.ports);
                e.ports[0].close();
                break;
            default:
                debugger;
                e.ports[0].postMessage({ status: 'fail', error: 'Incorrect command given' });
                e.ports[0].close();
        }
    };
    WorkerHandler.prototype.parse = function (content) {
        return JSON.parse(content, function (key, value) {
            if (typeof value != 'string') {
                return value;
            }
            return (value.indexOf('function') >= 0 || value.indexOf('=>') >= 0) ? eval('(' + value + ')') : value;
        });
    };
    return WorkerHandler;
}());
var wh = new WorkerHandler(self);
self.onmessage = function (e) { wh.onMessage(e); };
// let db, models;
// let errorNamespace = '-error';
//
// self.addEventListener('message', (e) => {
//     "use strict";
//     JSON.parse(e.data.detail);
//     let data = JSON.parse(e.data.detail, (key, value) => {
//         if(typeof value != 'string'){
//             return value;
//         }
//         return ( value.indexOf('function') >= 0 || value.indexOf('=>') >= 0) ? eval('('+value+')') : value;
//     });
//     self.emit(data, e.data.timestamp, e.data.action, e.data.model);
// });
//
// self.addEventListener('idb:worker:initialize', (e) => {
//     "use strict";
//
//     let idb = self.indexedDB || self.mozIndexedDB || self.webkitIndexedDB || self.msIndexedDB;
//     let idbKey = self.IDBKeyRange || self.webkitIDBKeyRange || self.msIDBKeyRange;
//
//     db = new DB(idb, idbKey, e.detail.detail, false, '', self.Promise);
//
//     db.connect()
//         .then((m) => {
//             models = m;
//             self.send(true, e.detail.timestamp, e.detail.action);
//         })
//         .catch((e) => self.send(false, e.detail.timestamp, e.detail.action));
//
// });
//
// self.emit = function (data, timestamp, action, model) {
//     let ev = new self.CustomEvent('idb:worker:' + action, {
//         detail: {
//             detail: data,
//             timestamp: timestamp,
//             action: action,
//             model: model
//         }
//     });
//
//     self.dispatchEvent(ev);
// };
//
// self.send = function (data, timestamp, action) {
//     "use strict";
//
//     let ev = {
//         detail: data,
//         action: action,
//         timestamp: timestamp,
//     };
//
//     self.postMessage(ev);
// };
//
//
// self.addEventListener('idb:worker:create', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//
//     m.create(e.detail.detail)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:find', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//     m.builder = e.detail.detail.builder;
//     m.indexBuilder = e.detail.detail.indexBuilder;
//     m.tables = e.detail.detail.tables;
//     m.relations = e.detail.detail.relations;
//
//     m.find(e.detail.detail)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:createMultiple', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//     m.createMultiple(e.detail.detail)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:get', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//     m.builder = e.detail.detail.builder;
//     m.indexBuilder = e.detail.detail.indexBuilder;
//     m.tables = e.detail.detail.tables;
//     m.relations = e.detail.detail.relations;
//
//     m.get(e.detail.detail)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:first', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//     m.builder = e.detail.detail.builder;
//     m.indexBuilder = e.detail.detail.indexBuilder;
//     m.tables = e.detail.detail.tables;
//     m.relations = e.detail.detail.relations;
//
//     m.first(e.detail.detail)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(err => {
//             self.send(err, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:update', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//
//     m.update(e.detail.detail)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:save', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//
//     m.save(e.detail.detail.id, e.detail.detail.data)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:count', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//
//     m.count()
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:average', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//
//     m.average(e.detail.detail)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
//
// self.addEventListener('idb:worker:reduce', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//
//     m.reduce(e.detail.detail.func, e.detail.detail.defaultCarry)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:destroyId', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//
//     m.destroyId(e.detail.detail)
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// });
//
// self.addEventListener('idb:worker:destroy', (e) => {
//     "use strict";
//
//     let m = models[e.detail.model];
//
//     m.destroy()
//         .then((result) => {
//             self.send(result, e.detail.timestamp, e.detail.action);
//         })
//         .catch(er => {
//             self.send(er, e.detail.timestamp, e.detail.action + errorNamespace);
//         });
// }); 