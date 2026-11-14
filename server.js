import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const epoxyPath = join(__dirname, "node_modules/@mercuryworkshop/epoxy-transport/dist");

const app = express();
const server = createServer();

app.use((req, res, next) => {
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.static(join(__dirname, "public")));
app.use("/scram/", express.static(scramjetPath));
app.use("/baremux/", express.static(baremuxPath));
app.use("/epoxy/", express.static(epoxyPath));

server.on("request", (req, res) => {
  app.handle(req, res);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Scramjet proxy running at http://localhost:${PORT}`);
});
