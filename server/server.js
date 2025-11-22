(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory(
        require("http"),
        require("fs"),
        require("crypto")
      ))
    : typeof define === "function" && define.amd
    ? define(["http", "fs", "crypto"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      (global.Server = factory(global.http, global.fs, global.crypto)));
})(this, function (http, fs, crypto) {
  "use strict";

  function _interopDefaultLegacy(e) {
    return e && typeof e === "object" && "default" in e ? e : { default: e };
  }

  var http__default = /*#__PURE__*/ _interopDefaultLegacy(http);
  var fs__default = /*#__PURE__*/ _interopDefaultLegacy(fs);
  var crypto__default = /*#__PURE__*/ _interopDefaultLegacy(crypto);

  class ServiceError extends Error {
    constructor(message = "Service Error") {
      super(message);
      this.name = "ServiceError";
    }
  }

  class NotFoundError extends ServiceError {
    constructor(message = "Resource not found") {
      super(message);
      this.name = "NotFoundError";
      this.status = 404;
    }
  }

  class RequestError extends ServiceError {
    constructor(message = "Request error") {
      super(message);
      this.name = "RequestError";
      this.status = 400;
    }
  }

  class ConflictError extends ServiceError {
    constructor(message = "Resource conflict") {
      super(message);
      this.name = "ConflictError";
      this.status = 409;
    }
  }

  class AuthorizationError extends ServiceError {
    constructor(message = "Unauthorized") {
      super(message);
      this.name = "AuthorizationError";
      this.status = 401;
    }
  }

  class CredentialError extends ServiceError {
    constructor(message = "Forbidden") {
      super(message);
      this.name = "CredentialError";
      this.status = 403;
    }
  }

  var errors = {
    ServiceError,
    NotFoundError,
    RequestError,
    ConflictError,
    AuthorizationError,
    CredentialError,
  };

  const { ServiceError: ServiceError$1 } = errors;

  function createHandler(plugins, services) {
    return async function handler(req, res) {
      const method = req.method;
      console.info(`<< ${req.method} ${req.url}`);

      // Redirect fix for admin panel relative paths
      if (req.url.slice(-6) == "/admin") {
        res.writeHead(302, {
          Location: `http://${req.headers.host}/admin/`,
        });
        return res.end();
      }

      let status = 200;
      let headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      };
      let result = "";
      let context;

      // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
      if (method == "OPTIONS") {
        Object.assign(headers, {
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Credentials": false,
          "Access-Control-Max-Age": "86400",
          "Access-Control-Allow-Headers":
            "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin",
        });
      } else {
        try {
          context = processPlugins();
          await handle(context);
        } catch (err) {
          if (err instanceof ServiceError$1) {
            status = err.status || 400;
            result = composeErrorObject(err.code || status, err.message);
          } else {
            // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
            // If it happens, it must be debugged in a future version of the server
            console.error(err);
            status = 500;
            result = composeErrorObject(500, "Server Error");
          }
        }
      }

      res.writeHead(status, headers);
      if (
        context != undefined &&
        context.util != undefined &&
        context.util.throttle
      ) {
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
      }
      res.end(result);

      function processPlugins() {
        const context = { params: {} };
        plugins.forEach((decorate) => decorate(context, req));
        return context;
      }

      async function handle(context) {
        const { serviceName, tokens, query, body } = await parseRequest(req);
        if (serviceName == "admin") {
          return ({ headers, result } = services["admin"](
            method,
            tokens,
            query,
            body
          ));
        } else if (serviceName == "favicon.ico") {
          return ({ headers, result } = services["favicon"](
            method,
            tokens,
            query,
            body
          ));
        }

        const service = services[serviceName];

        if (service === undefined) {
          status = 400;
          result = composeErrorObject(
            400,
            `Service "${serviceName}" is not supported`
          );
          console.error("Missing service " + serviceName);
        } else {
          result = await service(context, { method, tokens, query, body });
        }

        // NOTE: logout does not return a result
        // in this case the content type header should be omitted, to allow checks on the client
        if (result !== undefined) {
          result = JSON.stringify(result);
        } else {
          status = 204;
          delete headers["Content-Type"];
        }
      }
    };
  }

  function composeErrorObject(code, message) {
    return JSON.stringify({
      code,
      message,
    });
  }

  async function parseRequest(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tokens = url.pathname.split("/").filter((x) => x.length > 0);
    const serviceName = tokens.shift();
    const queryString = url.search.split("?")[1] || "";
    const query = queryString
      .split("&")
      .filter((s) => s != "")
      .map((x) => x.split("="))
      .reduce(
        (p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v) }),
        {}
      );
    const body = await parseBody(req);

    return {
      serviceName,
      tokens,
      query,
      body,
    };
  }

  function parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          resolve(body);
        }
      });
    });
  }

  var requestHandler = createHandler;

  class Service {
    constructor() {
      this._actions = [];
      this.parseRequest = this.parseRequest.bind(this);
    }

    /**
     * Handle service request, after it has been processed by a request handler
     * @param {*} context Execution context, contains result of middleware processing
     * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
     */
    async parseRequest(context, request) {
      for (let { method, name, handler } of this._actions) {
        if (
          method === request.method &&
          matchAndAssignParams(context, request.tokens[0], name)
        ) {
          return await handler(
            context,
            request.tokens.slice(1),
            request.query,
            request.body
          );
        }
      }
    }

    /**
     * Register service action
     * @param {string} method HTTP method
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    registerAction(method, name, handler) {
      this._actions.push({ method, name, handler });
    }

    /**
     * Register GET action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    get(name, handler) {
      this.registerAction("GET", name, handler);
    }

    /**
     * Register POST action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    post(name, handler) {
      this.registerAction("POST", name, handler);
    }

    /**
     * Register PUT action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    put(name, handler) {
      this.registerAction("PUT", name, handler);
    }

    /**
     * Register PATCH action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    patch(name, handler) {
      this.registerAction("PATCH", name, handler);
    }

    /**
     * Register DELETE action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    delete(name, handler) {
      this.registerAction("DELETE", name, handler);
    }
  }

  function matchAndAssignParams(context, name, pattern) {
    if (pattern == "*") {
      return true;
    } else if (pattern[0] == ":") {
      context.params[pattern.slice(1)] = name;
      return true;
    } else if (name == pattern) {
      return true;
    } else {
      return false;
    }
  }

  var Service_1 = Service;

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        let r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  var util = {
    uuid,
  };

  const uuid$1 = util.uuid;

  const data = fs__default["default"].existsSync("./data")
    ? fs__default["default"].readdirSync("./data").reduce((p, c) => {
        const content = JSON.parse(
          fs__default["default"].readFileSync("./data/" + c)
        );
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
          p[collection][endpoint] = content[endpoint];
        }
        return p;
      }, {})
    : {};

  const actions = {
    get: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      let responseData = data;
      for (let token of tokens) {
        if (responseData !== undefined) {
          responseData = responseData[token];
        }
      }
      return responseData;
    },
    post: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      console.log("Request body:\n", body);

      // TODO handle collisions, replacement
      let responseData = data;
      for (let token of tokens) {
        if (responseData.hasOwnProperty(token) == false) {
          responseData[token] = {};
        }
        responseData = responseData[token];
      }

      const newId = uuid$1();
      responseData[newId] = Object.assign({}, body, { _id: newId });
      return responseData[newId];
    },
    put: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      console.log("Request body:\n", body);

      let responseData = data;
      for (let token of tokens.slice(0, -1)) {
        if (responseData !== undefined) {
          responseData = responseData[token];
        }
      }
      if (
        responseData !== undefined &&
        responseData[tokens.slice(-1)] !== undefined
      ) {
        responseData[tokens.slice(-1)] = body;
      }
      return responseData[tokens.slice(-1)];
    },
    patch: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      console.log("Request body:\n", body);

      let responseData = data;
      for (let token of tokens) {
        if (responseData !== undefined) {
          responseData = responseData[token];
        }
      }
      if (responseData !== undefined) {
        Object.assign(responseData, body);
      }
      return responseData;
    },
    delete: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      let responseData = data;

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (responseData.hasOwnProperty(token) == false) {
          return null;
        }
        if (i == tokens.length - 1) {
          const body = responseData[token];
          delete responseData[token];
          return body;
        } else {
          responseData = responseData[token];
        }
      }
    },
  };

  const dataService = new Service_1();
  dataService.get(":collection", actions.get);
  dataService.post(":collection", actions.post);
  dataService.put(":collection", actions.put);
  dataService.patch(":collection", actions.patch);
  dataService.delete(":collection", actions.delete);

  var jsonstore = dataService.parseRequest;

  /*
   * This service requires storage and auth plugins
   */

  const { AuthorizationError: AuthorizationError$1 } = errors;

  const userService = new Service_1();

  userService.get("me", getSelf);
  userService.post("register", onRegister);
  userService.post("login", onLogin);
  userService.get("logout", onLogout);

  function getSelf(context, tokens, query, body) {
    if (context.user) {
      const result = Object.assign({}, context.user);
      delete result.hashedPassword;
      return result;
    } else {
      throw new AuthorizationError$1();
    }
  }

  function onRegister(context, tokens, query, body) {
    return context.auth.register(body);
  }

  function onLogin(context, tokens, query, body) {
    return context.auth.login(body);
  }

  function onLogout(context, tokens, query, body) {
    return context.auth.logout();
  }

  var users = userService.parseRequest;

  const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } =
    errors;

  var crud = {
    get,
    post,
    put,
    patch,
    delete: del,
  };

  function validateRequest(context, tokens, query) {
    /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
    if (tokens.length > 1) {
      throw new RequestError$1();
    }
  }

  function parseWhere(query) {
    const operators = {
      "<=": (prop, value) => (record) => record[prop] <= JSON.parse(value),
      "<": (prop, value) => (record) => record[prop] < JSON.parse(value),
      ">=": (prop, value) => (record) => record[prop] >= JSON.parse(value),
      ">": (prop, value) => (record) => record[prop] > JSON.parse(value),
      "=": (prop, value) => (record) => record[prop] == JSON.parse(value),
      " like ": (prop, value) => (record) =>
        record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
      " in ": (prop, value) => (record) =>
        JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
    };
    const pattern = new RegExp(
      `^(.+?)(${Object.keys(operators).join("|")})(.+?)$`,
      "i"
    );

    try {
      let clauses = [query.trim()];
      let check = (a, b) => b;
      let acc = true;
      if (query.match(/ and /gi)) {
        // inclusive
        clauses = query.split(/ and /gi);
        check = (a, b) => a && b;
        acc = true;
      } else if (query.match(/ or /gi)) {
        // optional
        clauses = query.split(/ or /gi);
        check = (a, b) => a || b;
        acc = false;
      }
      clauses = clauses.map(createChecker);

      return (record) => clauses.map((c) => c(record)).reduce(check, acc);
    } catch (err) {
      throw new Error("Could not parse WHERE clause, check your syntax.");
    }

    function createChecker(clause) {
      let [match, prop, operator, value] = pattern.exec(clause);
      [prop, value] = [prop.trim(), value.trim()];

      return operators[operator.toLowerCase()](prop, value);
    }
  }

  function get(context, tokens, query, body) {
    validateRequest(context, tokens);

    let responseData;

    try {
      if (query.where) {
        responseData = context.storage
          .get(context.params.collection)
          .filter(parseWhere(query.where));
      } else if (context.params.collection) {
        responseData = context.storage.get(
          context.params.collection,
          tokens[0]
        );
      } else {
        // Get list of collections
        return context.storage.get();
      }

      if (query.sortBy) {
        const props = query.sortBy
          .split(",")
          .filter((p) => p != "")
          .map((p) => p.split(" ").filter((p) => p != ""))
          .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

        // Sorting priority is from first to last, therefore we sort from last to first
        for (let i = props.length - 1; i >= 0; i--) {
          let { prop, desc } = props[i];
          responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
            if (typeof propA == "number" && typeof propB == "number") {
              return (propA - propB) * (desc ? -1 : 1);
            } else {
              return propA.localeCompare(propB) * (desc ? -1 : 1);
            }
          });
        }
      }

      if (query.offset) {
        responseData = responseData.slice(Number(query.offset) || 0);
      }
      const pageSize = Number(query.pageSize) || 10;
      if (query.pageSize) {
        responseData = responseData.slice(0, pageSize);
      }

      if (query.distinct) {
        const props = query.distinct.split(",").filter((p) => p != "");
        responseData = Object.values(
          responseData.reduce((distinct, c) => {
            const key = props.map((p) => c[p]).join("::");
            if (distinct.hasOwnProperty(key) == false) {
              distinct[key] = c;
            }
            return distinct;
          }, {})
        );
      }

      if (query.count) {
        return responseData.length;
      }

      if (query.select) {
        const props = query.select.split(",").filter((p) => p != "");
        responseData = Array.isArray(responseData)
          ? responseData.map(transform)
          : transform(responseData);

        function transform(r) {
          const result = {};
          props.forEach((p) => (result[p] = r[p]));
          return result;
        }
      }

      if (query.load) {
        const props = query.load.split(",").filter((p) => p != "");
        props.map((prop) => {
          const [propName, relationTokens] = prop.split("=");
          const [idSource, collection] = relationTokens.split(":");
          console.log(
            `Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`
          );
          const storageSource =
            collection == "users" ? context.protectedStorage : context.storage;
          responseData = Array.isArray(responseData)
            ? responseData.map(transform)
            : transform(responseData);

          function transform(r) {
            const seekId = r[idSource];
            const related = storageSource.get(collection, seekId);
            delete related.hashedPassword;
            r[propName] = related;
            return r;
          }
        });
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes("does not exist")) {
        throw new NotFoundError$1();
      } else {
        throw new RequestError$1(err.message);
      }
    }

    context.canAccess(responseData);

    return responseData;
  }

  function post(context, tokens, query, body) {
    console.log("Request body:\n", body);

    validateRequest(context, tokens);
    if (tokens.length > 0) {
      throw new RequestError$1("Use PUT to update records");
    }
    context.canAccess(undefined, body);

    body._ownerId = context.user._id;
    let responseData;

    try {
      responseData = context.storage.add(context.params.collection, body);
    } catch (err) {
      throw new RequestError$1();
    }

    return responseData;
  }

  function put(context, tokens, query, body) {
    console.log("Request body:\n", body);

    validateRequest(context, tokens);
    if (tokens.length != 1) {
      throw new RequestError$1("Missing entry ID");
    }

    let responseData;
    let existing;

    try {
      existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
      throw new NotFoundError$1();
    }

    context.canAccess(existing, body);

    try {
      responseData = context.storage.set(
        context.params.collection,
        tokens[0],
        body
      );
    } catch (err) {
      throw new RequestError$1();
    }

    return responseData;
  }

  function patch(context, tokens, query, body) {
    console.log("Request body:\n", body);

    validateRequest(context, tokens);
    if (tokens.length != 1) {
      throw new RequestError$1("Missing entry ID");
    }

    let responseData;
    let existing;

    try {
      existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
      throw new NotFoundError$1();
    }

    context.canAccess(existing, body);

    try {
      responseData = context.storage.merge(
        context.params.collection,
        tokens[0],
        body
      );
    } catch (err) {
      throw new RequestError$1();
    }

    return responseData;
  }

  function del(context, tokens, query, body) {
    validateRequest(context, tokens);
    if (tokens.length != 1) {
      throw new RequestError$1("Missing entry ID");
    }

    let responseData;
    let existing;

    try {
      existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
      throw new NotFoundError$1();
    }

    context.canAccess(existing);

    try {
      responseData = context.storage.delete(
        context.params.collection,
        tokens[0]
      );
    } catch (err) {
      throw new RequestError$1();
    }

    return responseData;
  }

  /*
   * This service requires storage and auth plugins
   */

  const dataService$1 = new Service_1();
  dataService$1.get(":collection", crud.get);
  dataService$1.post(":collection", crud.post);
  dataService$1.put(":collection", crud.put);
  dataService$1.patch(":collection", crud.patch);
  dataService$1.delete(":collection", crud.delete);

  var data$1 = dataService$1.parseRequest;

  const imgdata =
    "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Td4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC";
  const img = Buffer.from(imgdata, "base64");

  var favicon = (method, tokens, query, body) => {
    console.log("serving favicon...");
    const headers = {
      "Content-Type": "image/png",
      "Content-Length": img.length,
    };
    let result = img;

    return {
      headers,
      result,
    };
  };

  var require$$0 =
    '<!DOCTYPE html>\r\n<html lang="en">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>SUPS Admin Panel</title>\r\n    <style>\r\n        * {\r\n            padding: 0;\r\n            margin: 0;\r\n        }\r\n\r\n        body {\r\n            padding: 32px;\r\n            font-size: 16px;\r\n        }\r\n\r\n        .layout::after {\r\n            content: \'\';\r\n            clear: both;\r\n            display: table;\r\n        }\r\n\r\n        .col {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        p {\r\n            padding: 8px 16px;\r\n        }\r\n\r\n        table {\r\n            border-collapse: collapse;\r\n        }\r\n\r\n        caption {\r\n            font-size: 120%;\r\n            text-align: left;\r\n            padding: 4px 8px;\r\n            font-weight: bold;\r\n            background-color: #ddd;\r\n        }\r\n\r\n        table, tr, th, td {\r\n            border: 1px solid #ddd;\r\n        }\r\n\r\n        th, td {\r\n            padding: 4px 8px;\r\n        }\r\n\r\n        ul {\r\n            list-style: none;\r\n        }\r\n\r\n        .collection-list a {\r\n            display: block;\r\n            width: 120px;\r\n            padding: 4px 8px;\r\n            text-decoration: none;\r\n            color: black;\r\n            background-color: #ccc;\r\n        }\r\n        .collection-list a:hover {\r\n            background-color: #ddd;\r\n        }\r\n        .collection-list a:visited {\r\n            color: black;\r\n        }\r\n    </style>\r\n    <script type="module">\nimport { html, render } from \'https://unpkg.com/lit-html?module\';\nimport { until } from \'https://unpkg.com/lit-html/directives/until?module\';\n\nconst api = {\r\n    async get(url) {\r\n        return json(url);\r\n    },\r\n    async post(url, body) {\r\n        return json(url, {\r\n            method: \'POST\',\r\n            headers: { \'Content-Type\': \'application/json\' },\r\n            body: JSON.stringify(body)\r\n        });\r\n    }\r\n};\r\n\r\nasync function json(url, options) {\r\n    return await (await fetch(\'/\' + url, options)).json();\r\n}\r\n\r\nasync function getCollections() {\r\n    return api.get(\'data\');\r\n}\r\n\r\nasync function getRecords(collection) {\r\n    return api.get(\'data/\' + collection);\r\n}\r\n\r\nasync function getThrottling() {\r\n    return api.get(\'util/throttle\');\r\n}\r\n\r\nasync function setThrottling(throttle) {\r\n    return api.post(\'util\', { throttle });\r\n}\n\nasync function collectionList(onSelect) {\r\n    const collections = await getCollections();\r\n\r\n    return html`\r\n    <ul class="collection-list">\r\n        ${collections.map(collectionLi)}\r\n    </ul>`;\r\n\r\n    function collectionLi(name) {\r\n        return html`<li><a href="javascript:void(0)" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\r\n    }\r\n}\n\nasync function recordTable(collectionName) {\r\n    const records = await getRecords(collectionName);\r\n    const layout = getLayout(records);\r\n\r\n    return html`\r\n    <table>\r\n        <caption>${collectionName}</caption>\r\n        <thead>\r\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\r\n        </thead>\r\n        <tbody>\r\n            ${records.map(r => recordRow(r, layout))}\r\n        </tbody>\r\n    </table>`;\r\n}\r\n\r\nfunction getLayout(records) {\r\n    const result = new Set([\'_id\']);\r\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\r\n\r\n    return [...result.keys()];\r\n}\r\n\r\nfunction recordRow(record, layout) {\r\n    return html`\r\n    <tr>\r\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\r\n    </tr>`;\r\n}\n\nasync function throttlePanel(display) {\r\n    const active = await getThrottling();\r\n\r\n    return html`\r\n    <p>\r\n        Request throttling: </span>${active}</span>\r\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\r\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\r\n    </p>`;\r\n\r\n    async function set(ev, state) {\r\n        ev.target.disabled = true;\r\n        await setThrottling(state);\r\n        display();\r\n    }\r\n}\n\n//import page from \'//unpkg.com/page/page.mjs\';\r\n\r\n\r\nfunction start() {\r\n    const main = document.querySelector(\'main\');\r\n    editor(main);\r\n}\r\n\r\nasync function editor(main) {\r\n    let list = html`<div class="col">Loading&hellip;</div>`;\r\n    let viewer = html`<div class="col">\r\n    <p>Select collection to view records</p>\r\n</div>`;\r\n    display();\r\n\r\n    list = html`<div class="col">${await collectionList(onSelect)}</div>`;\r\n    display();\r\n\r\n    async function display() {\r\n        render(html`\r\n        <section class="layout">\r\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\r\n        </section>\r\n        <section class="layout">\r\n            ${list}\r\n            ${viewer}\r\n        </section>`, main);\r\n    }\r\n\r\n    async function onSelect(ev, name) {\r\n        ev.preventDefault();\r\n        viewer = html`<div class="col">${await recordTable(name)}</div>`;\r\n        display();\r\n    }\r\n}\r\n\r\nstart();\n\n</script>\r\n</head>\r\n<body>\r\n    <main>\r\n        Loading&hellip;\r\n    </main>\r\n</body>\r\n</html>';

  const mode = process.argv[2] == "-dev" ? "dev" : "prod";

  const files = {
    index:
      mode == "prod"
        ? require$$0
        : fs__default["default"].readFileSync("./client/index.html", "utf-8"),
  };

  var admin = (method, tokens, query, body) => {
    const headers = {
      "Content-Type": "text/html",
    };
    let result = "";

    const resource = tokens.join("/");
    if (resource && resource.split(".").pop() == "js") {
      headers["Content-Type"] = "application/javascript";

      files[resource] =
        files[resource] ||
        fs__default["default"].readFileSync("./client/" + resource, "utf-8");
      result = files[resource];
    } else {
      result = files.index;
    }

    return {
      headers,
      result,
    };
  };

  /*
   * This service requires util plugin
   */

  const utilService = new Service_1();

  utilService.post("*", onRequest);
  utilService.get(":service", getStatus);

  function getStatus(context, tokens, query, body) {
    return context.util[context.params.service];
  }

  function onRequest(context, tokens, query, body) {
    Object.entries(body).forEach(([k, v]) => {
      console.log(`${k} ${v ? "enabled" : "disabled"}`);
      context.util[k] = v;
    });
    return "";
  }

  var util$1 = utilService.parseRequest;

  var services = {
    jsonstore,
    users,
    data: data$1,
    favicon,
    admin,
    util: util$1,
  };

  const { uuid: uuid$2 } = util;

  function initPlugin(settings) {
    const storage = createInstance(settings.seedData);
    const protectedStorage = createInstance(settings.protectedData);

    return function decoreateContext(context, request) {
      context.storage = storage;
      context.protectedStorage = protectedStorage;
    };
  }

  /**
   * Create storage instance and populate with seed data
   * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
   */
  function createInstance(seedData = {}) {
    const collections = new Map();

    // Initialize seed data from file
    for (let collectionName in seedData) {
      if (seedData.hasOwnProperty(collectionName)) {
        const collection = new Map();
        for (let recordId in seedData[collectionName]) {
          if (seedData.hasOwnProperty(collectionName)) {
            collection.set(recordId, seedData[collectionName][recordId]);
          }
        }
        collections.set(collectionName, collection);
      }
    }

    // Manipulation

    /**
     * Get entry by ID or list of all entries from collection or list of all collections
     * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
     * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
     * @return {Object} Matching entry.
     */
    function get(collection, id) {
      if (!collection) {
        return [...collections.keys()];
      }
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      if (!id) {
        const entries = [...targetCollection.entries()];
        let result = entries.map(([k, v]) => {
          return Object.assign(deepCopy(v), { _id: k });
        });
        return result;
      }
      if (!targetCollection.has(id)) {
        throw new ReferenceError("Entry does not exist: " + id);
      }
      const entry = targetCollection.get(id);
      return Object.assign(deepCopy(entry), { _id: id });
    }

    /**
     * Add new entry to collection. ID will be auto-generated
     * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
     * @param {Object} data Value to store.
     * @return {Object} Original value with resulting ID under _id property.
     */
    function add(collection, data) {
      const record = assignClean({ _ownerId: data._ownerId }, data);

      let targetCollection = collections.get(collection);
      if (!targetCollection) {
        targetCollection = new Map();
        collections.set(collection, targetCollection);
      }
      let id = uuid$2();
      // Make sure new ID does not match existing value
      while (targetCollection.has(id)) {
        id = uuid$2();
      }

      record._createdOn = Date.now();
      targetCollection.set(id, record);
      return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Replace entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @param {Object} data Value to store. Record will be replaced!
     * @return {Object} Updated entry.
     */
    function set(collection, id, data) {
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      if (!targetCollection.has(id)) {
        throw new ReferenceError("Entry does not exist: " + id);
      }

      const existing = targetCollection.get(id);
      const record = assignSystemProps(deepCopy(data), existing);
      record._updatedOn = Date.now();
      targetCollection.set(id, record);
      return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Modify entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @param {Object} data Value to store. Shallow merge will be performed!
     * @return {Object} Updated entry.
     */
    function merge(collection, id, data) {
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      if (!targetCollection.has(id)) {
        throw new ReferenceError("Entry does not exist: " + id);
      }

      const existing = deepCopy(targetCollection.get(id));
      const record = assignClean(existing, data);
      record._updatedOn = Date.now();
      targetCollection.set(id, record);
      return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Delete entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @return {{_deletedOn: number}} Server time of deletion.
     */
    function del(collection, id) {
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      if (!targetCollection.has(id)) {
        throw new ReferenceError("Entry does not exist: " + id);
      }
      targetCollection.delete(id);

      return { _deletedOn: Date.now() };
    }

    /**
     * Search in collection by query object
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {Object} query Query object. Format {prop: value}.
     * @return {Object[]} Array of matching entries.
     */
    function query(collection, query) {
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      const result = [];
      // Iterate entries of target collection and compare each property with the given query
      for (let [key, entry] of [...targetCollection.entries()]) {
        let match = true;
        for (let prop in entry) {
          if (query.hasOwnProperty(prop)) {
            const targetValue = query[prop];
            // Perform lowercase search, if value is string
            if (
              typeof targetValue === "string" &&
              typeof entry[prop] === "string"
            ) {
              if (
                targetValue.toLocaleLowerCase() !==
                entry[prop].toLocaleLowerCase()
              ) {
                match = false;
                break;
              }
            } else if (targetValue != entry[prop]) {
              match = false;
              break;
            }
          }
        }

        if (match) {
          result.push(Object.assign(deepCopy(entry), { _id: key }));
        }
      }

      return result;
    }

    return { get, add, set, merge, delete: del, query };
  }

  function assignSystemProps(target, entry, ...rest) {
    const whitelist = ["_id", "_createdOn", "_updatedOn", "_ownerId"];
    for (let prop of whitelist) {
      if (entry.hasOwnProperty(prop)) {
        target[prop] = deepCopy(entry[prop]);
      }
    }
    if (rest.length > 0) {
      Object.assign(target, ...rest);
    }

    return target;
  }

  function assignClean(target, entry, ...rest) {
    const blacklist = ["_id", "_createdOn", "_updatedOn", "_ownerId"];
    for (let key in entry) {
      if (blacklist.includes(key) == false) {
        target[key] = deepCopy(entry[key]);
      }
    }
    if (rest.length > 0) {
      Object.assign(target, ...rest);
    }

    return target;
  }

  function deepCopy(value) {
    if (Array.isArray(value)) {
      return value.map(deepCopy);
    } else if (typeof value == "object") {
      return [...Object.entries(value)].reduce(
        (p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }),
        {}
      );
    } else {
      return value;
    }
  }

  var storage = initPlugin;

  const {
    ConflictError: ConflictError$1,
    CredentialError: CredentialError$1,
    RequestError: RequestError$2,
  } = errors;

  function initPlugin$1(settings) {
    const identity = settings.identity;

    return function decorateContext(context, request) {
      context.auth = {
        register,
        login,
        logout,
      };

      const userToken = request.headers["x-authorization"];
      if (userToken !== undefined) {
        let user;
        const session = findSessionByToken(userToken);
        if (session !== undefined) {
          const userData = context.protectedStorage.get(
            "users",
            session.userId
          );
          if (userData !== undefined) {
            console.log("Authorized as " + userData[identity]);
            user = userData;
          }
        }
        if (user !== undefined) {
          context.user = user;
        } else {
          throw new CredentialError$1("Invalid access token");
        }
      }

      function register(body) {
        if (
          body.hasOwnProperty(identity) === false ||
          body.hasOwnProperty("password") === false ||
          body[identity].length == 0 ||
          body.password.length == 0
        ) {
          throw new RequestError$2("Missing fields");
        } else if (
          context.protectedStorage.query("users", {
            [identity]: body[identity],
          }).length !== 0
        ) {
          throw new ConflictError$1(
            `A user with the same ${identity} already exists`
          );
        } else {
          const newUser = Object.assign({}, body, {
            [identity]: body[identity],
            hashedPassword: hash(body.password),
          });
          const result = context.protectedStorage.add("users", newUser);
          delete result.hashedPassword;

          const session = saveSession(result._id);
          result.accessToken = session.accessToken;

          return result;
        }
      }

      function login(body) {
        const targetUser = context.protectedStorage.query("users", {
          [identity]: body[identity],
        });
        if (targetUser.length == 1) {
          if (hash(body.password) === targetUser[0].hashedPassword) {
            const result = targetUser[0];
            delete result.hashedPassword;

            const session = saveSession(result._id);
            result.accessToken = session.accessToken;

            return result;
          } else {
            throw new CredentialError$1("Login or password don't match");
          }
        } else {
          throw new CredentialError$1("Login or password don't match");
        }
      }

      function logout() {
        if (context.user !== undefined) {
          const session = findSessionByUserId(context.user._id);
          if (session !== undefined) {
            context.protectedStorage.delete("sessions", session._id);
          }
        } else {
          throw new CredentialError$1("User session does not exist");
        }
      }

      function saveSession(userId) {
        let session = context.protectedStorage.add("sessions", { userId });
        const accessToken = hash(session._id);
        session = context.protectedStorage.set(
          "sessions",
          session._id,
          Object.assign({ accessToken }, session)
        );
        return session;
      }

      function findSessionByToken(userToken) {
        return context.protectedStorage.query("sessions", {
          accessToken: userToken,
        })[0];
      }

      function findSessionByUserId(userId) {
        return context.protectedStorage.query("sessions", { userId })[0];
      }
    };
  }

  const secret = "This is not a production server";

  function hash(string) {
    const hash = crypto__default["default"].createHmac("sha256", secret);
    hash.update(string);
    return hash.digest("hex");
  }

  var auth = initPlugin$1;

  function initPlugin$2(settings) {
    const util = {
      throttle: false,
    };

    return function decoreateContext(context, request) {
      context.util = util;
    };
  }

  var util$2 = initPlugin$2;

  /*
   * This plugin requires auth and storage plugins
   */

  const {
    RequestError: RequestError$3,
    ConflictError: ConflictError$2,
    CredentialError: CredentialError$2,
    AuthorizationError: AuthorizationError$2,
  } = errors;

  function initPlugin$3(settings) {
    const actions = {
      GET: ".read",
      POST: ".create",
      PUT: ".update",
      PATCH: ".update",
      DELETE: ".delete",
    };
    const rules = Object.assign(
      {
        "*": {
          ".create": ["User"],
          ".update": ["Owner"],
          ".delete": ["Owner"],
        },
      },
      settings.rules
    );

    return function decorateContext(context, request) {
      // special rules (evaluated at run-time)
      const get = (collectionName, id) => {
        return context.storage.get(collectionName, id);
      };
      const isOwner = (user, object) => {
        return user._id == object._ownerId;
      };
      context.rules = {
        get,
        isOwner,
      };
      const isAdmin = request.headers.hasOwnProperty("x-admin");

      context.canAccess = canAccess;

      function canAccess(data, newData) {
        const user = context.user;
        const action = actions[request.method];
        let { rule, propRules } = getRule(
          action,
          context.params.collection,
          data
        );

        if (Array.isArray(rule)) {
          rule = checkRoles(rule, data);
        } else if (typeof rule == "string") {
          rule = !!eval(rule);
        }
        if (!rule && !isAdmin) {
          throw new CredentialError$2();
        }
        propRules.map((r) => applyPropRule(action, r, user, data, newData));
      }

      function applyPropRule(action, [prop, rule], user, data, newData) {
        // NOTE: user needs to be in scope for eval to work on certain rules
        if (typeof rule == "string") {
          rule = !!eval(rule);
        }

        if (rule == false) {
          if (action == ".create" || action == ".update") {
            delete newData[prop];
          } else if (action == ".read") {
            delete data[prop];
          }
        }
      }

      function checkRoles(roles, data, newData) {
        if (roles.includes("Guest")) {
          return true;
        } else if (!context.user && !isAdmin) {
          throw new AuthorizationError$2();
        } else if (roles.includes("User")) {
          return true;
        } else if (context.user && roles.includes("Owner")) {
          return context.user._id == data._ownerId;
        } else {
          return false;
        }
      }
    };

    function getRule(action, collection, data = {}) {
      let currentRule = ruleOrDefault(true, rules["*"][action]);
      let propRules = [];

      // Top-level rules for the collection
      const collectionRules = rules[collection];
      if (collectionRules !== undefined) {
        // Top-level rule for the specific action for the collection
        currentRule = ruleOrDefault(currentRule, collectionRules[action]);

        // Prop rules
        const allPropRules = collectionRules["*"];
        if (allPropRules !== undefined) {
          propRules = ruleOrDefault(
            propRules,
            getPropRule(allPropRules, action)
          );
        }

        // Rules by record id
        const recordRules = collectionRules[data._id];
        if (recordRules !== undefined) {
          currentRule = ruleOrDefault(currentRule, recordRules[action]);
          propRules = ruleOrDefault(
            propRules,
            getPropRule(recordRules, action)
          );
        }
      }

      return {
        rule: currentRule,
        propRules,
      };
    }

    function ruleOrDefault(current, rule) {
      return rule === undefined || rule.length === 0 ? current : rule;
    }

    function getPropRule(record, action) {
      const props = Object.entries(record)
        .filter(([k]) => k[0] != ".")
        .filter(([k, v]) => v.hasOwnProperty(action))
        .map(([k, v]) => [k, v[action]]);

      return props;
    }
  }
  var rules = initPlugin$3;
  var identity = "email";

  var protectedData = {
    users: {
      "35c62d76-8152-4626-8712-eeb96381bea8": {
        email: "peter@abv.bg",
        hashedPassword:
          "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1",
      },
      "847ec027-f659-4086-8032-5173e2f9c93a": {
        email: "john@abv.bg",
        hashedPassword:
          "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1",
      },
    },
    sessions: {},
  };

  // Seed data трябва да е отделно от protectedData
  var seedData = {
    books: {
      "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p": {
        _id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        title: "A Game of Thrones",
        genre: "Epic Fantasy",
        pages: 694,
        date: "1996-08-06",
        imageUrl:
          "data:image/jpeg;base64,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",
        summary:
          "The first book in the A Song of Ice and Fire series. Noble families vie for control of the Iron Throne while dark forces stir beyond the Wall.",
      },
      "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q": {
        _id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        title: "Fire & Blood",
        genre: "Fantasy History",
        pages: 736,
        date: "2018-11-20",
        imageUrl: "/images/fireandblood.png",
        summary:
          "A detailed history of House Targaryen from Aegon the Conqueror to the regency of Aegon III, full of dragons, wars, and political intrigue.",
      },
      "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r": {
        _id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        title: "The Winds of Winter",
        genre: "Epic Fantasy",
        pages: 1024,
        date: "2025-12-01",
        imageUrl: "/images/winds-of-winter.png",
        summary:
          "The anticipated next book in the A Song of Ice and Fire series, continuing the story of Westeros and its battle for the Iron Throne.",
      },
    },
    comments: {},
  };

  var rules$1 = {
    users: {
      ".create": false,
      ".read": ["Owner"],
      ".update": false,
      ".delete": false,
    },
    books: {
      ".read": true, // всички могат да четат, независимо от роли
      ".create": ["User"],
      ".update": ["Owner"],
      ".delete": ["Owner"],
    },
  };

  var settings = {
    identity: "email",
    protectedData: protectedData,
    seedData: seedData,
    rules: rules$1,
  };

  const plugins = [
    storage(settings),
    auth(settings),
    util$2(),
    rules(settings),
  ];

  const server = http__default["default"].createServer(
    requestHandler(plugins, services)
  );

  const port = 3030;
  server.listen(port);
  console.log(
    `Server started on port ${port}. You can make requests to http://localhost:${port}/`
  );
  console.log(`Admin panel located at http://localhost:${port}/admin`);

  var softuniPracticeServer = {};

  return softuniPracticeServer;
});
