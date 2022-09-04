import * as typeorm from "typeorm";

export const AppDataSource = new typeorm.DataSource({
  type: "mysql",
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [__dirname + "/../**/*.mo.{js,ts}"],
  synchronize: process.env.NODE_ENV === "dev" ? true : false,
});
