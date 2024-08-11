import { Elysia } from "elysia";
import GlobalCache from "../utils/cacheService";

interface CacheOptions {
  ttl?: number;
}

const cachePlugin = (options: CacheOptions = {}) =>
  new Elysia()
    .onBeforeHandle({ as: "scoped" }, async ({ request, set }) => {
      const method = request.method;

      if (method === "GET") {
        const hash = Bun.hash(request.url);
        const isCached = await GlobalCache.has(hash);
        set.headers["Content-Type"] = "application/json";
        set.headers["x-powered-by"] = "Elysia";
        if (isCached) {
          set.headers["x-powered-by"] = "Elysia-cached";
        }
        if (isCached) {
          return GlobalCache.get(hash);
        }
      }
    })
    .onAfterHandle({ as: "scoped" }, async ({ request, set, response }) => {
      const method = request.method;
      const status = set.status;

      if (method === "GET" && status === 200) {
        const hash = Bun.hash(request.url);
        const isCached = await GlobalCache.has(hash);
        if (!isCached) {
          GlobalCache.set(hash, response, options.ttl);
        }
      }
    });

export default cachePlugin;
