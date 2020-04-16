import { createHeartBeatServer } from "@bet/heart-beat-health";
import heart from "./heart";

const server = createHeartBeatServer(heart);
export default server;
