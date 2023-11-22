import {
  unstable_loadViteServerBuild,
} from "@remix-run/dev";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import express from "express";
import http from "node:http";
import { createServer } from "vite";

installGlobals();

const app = express();

const server = http.createServer(app);

let vite = await createServer({
  server: {
    middlewareMode: true,
    hmr: {
      server,
    },
  }
})

// handle asset requests
if (vite) {
  app.use(vite.middlewares);
} else {
  app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
  );
}
app.use(express.static("public", { maxAge: "1h" }));

// handle SSR requests
app.all(
  "*",
  createRequestHandler({
    build: vite
      ? () => unstable_loadViteServerBuild(vite)
      : await import("./build/index.js"),
  })
);

const port = 3000;
server.listen(port, () => console.log("http://localhost:" + port));
