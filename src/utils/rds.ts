import * as typeorm from "typeorm";

export const connectMysql = async () => {
  const AppDataSource = new typeorm.DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  AppDataSource.initialize()
    .then(() => {
      console.log("Connect to MysqlDB");
    })
    .catch((e) => {
      console.log("ERROR : Fail to Connect");
    });
};
