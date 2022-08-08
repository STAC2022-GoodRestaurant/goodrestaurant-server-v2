import http from "http";
import { initApp } from "./init";
import { logger } from "./utils/logger";
import { connectMongo } from "./utils/mongo";
import { AppDataSource } from "./utils/rds";

const port = process.env.PORT || 3000;

const app = initApp();

const server = async () => {
  try {
    const server = http.createServer(app);

    AppDataSource.initialize();

    server.listen(port, () => {
      logger.info(`Server is running on port : ${port}`);
    });
  } catch (err) {
    logger.error(err);
  }
};

server();
