import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { etag } from "@bogeychan/elysia-etag";
import { cron, Patterns } from "@elysiajs/cron";
import { serverTiming } from "@elysiajs/server-timing";
import { ofetch } from "ofetch";
import { test, test2 } from "./controllers/worldstate";
import cacheService from "../plugins/cache";
import SentientOutpost from "warframe-worldstate-parser/types/lib/models/SentientOutpost";
var data1 = {
  ws: "",
  kuva: "",
  anomaly: "",
};

const requestws = async () => {
  const response = await fetch(
    "https://content.warframe.com/dynamic/worldState.php"
  );
  const json = await response.text();
  //console.log(json);
  return json;
};
const requestkuva = async () => {
  const response = await fetch("https://10o.io/arbitrations.json");
  const json = await response.json();
  //console.log(json);
  return json;
};
const requestanomaly = async () => {
  const response = await fetch("https://semlar.com/anomaly.json");
  const json = await response.json();
  return json;
};
const useRequest = async () => {
  data1.ws = await requestws();
  data1.kuva = await requestkuva();
  data1.anomaly = await requestanomaly();
};
// ts-ignore-next
useRequest();
const app = new Elysia()
  .use(
    cron({
      name: "heartbeat",
      pattern: Patterns.everyMinutes(1),
      run() {
        console.log("Heartbeat");
        useRequest();
      },
    })
  )
  .use(etag())
  .use(
    swagger({
      provider: "scalar",
      scalarConfig: {
        hideDarkModeToggle: true,
        hiddenClients: {
          php: true, // Example: Exclude all PHP clients
          python: true, // Example: Exclude all Python clients
          c: true, // Example: Exclude all C clients
          go: true, // Example: Exclude all Go clients
          ruby: true, // Example: Exclude all Ruby clients
          node: ["fetch"], // We expect the (browser) javascript fetch client to still be available
          javascript: ["jquery", "xhr"], // Exclude specific JavaScript clients
        },
      },
      documentation: {
        info: {
          title: "Tenno API  Documentation",
          version: "1.0.0",
        },
        tags: [
          { name: "App", description: "General endpoints" },
          { name: "WorldState", description: "WorldState endpoints" },
        ],
      },
      exclude: ["/swagger", "/swagger/json"],
    })
  )
  .get(
    "/status",
    ({ headers, set, error }) => {
      const lang = headers["accept-language"].substring(0, 2);
      set.headers["Content-Type"] = "application/json";
      set.headers["x-powered-by"] = "Elysia";
      return { status: "ok-" + lang };
    },
    {
      detail: {
        tags: ["App"],
        description: "Get the application's status",
      },
    }
  )
  .get(
    "/test",
    ({ headers, set, error }) => {
      const lang = headers["accept-language"].substring(0, 2);
      set.headers["Content-Type"] = "application/json";
      set.headers["x-powered-by"] = "Elysia";
      return { data1 };
    },
    {
      detail: {
        tags: ["App"],
        description: "Get the application's test",
      },
    }
  )
  .get(
    "/",
    ({ headers, set, error }) => {
      const lang = headers["accept-language"].substring(0, 2);
      set.headers["Content-Type"] = "application/json";
      set.headers["x-powered-by"] = "Elysia";
      return test(data1, lang);
    },
    {
      detail: {
        tags: ["WorldState"],
        description: "Get the application's status",
      },
    }
  )

  .get(
    "/:item",
    ({ headers, set, error, params: { item } }) => {
      const lang = headers["accept-language"].substring(0, 2);
      set.headers["Content-Type"] = "application/json";
      set.headers["x-powered-by"] = "Elysia";
      return test2(data1, item, lang);
    },
    {
      detail: {
        tags: ["WorldState"],
      },
    }
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
