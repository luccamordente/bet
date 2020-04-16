import * as http from "http";
import { Heart } from "./heart";

export default function createHeartBeatServer(heart: Heart) {
  const listener = (req: http.IncomingMessage, res: http.ServerResponse) => {
    let status: 503 | 200 | 404;

    if (req.method === "GET" && req.url === "/healthz") {
      status = heart.isHealthy() ? 200 : 503;
    } else {
      status = 404;
    }

    res.writeHead(status);
    res.end();
  };

  return http.createServer(listener);
}
