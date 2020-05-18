import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { BookResolver } from "./resolvers/bookResolver";
import { buildSchema } from "type-graphql";

async function main() {
  await createConnection();
  const schema = await buildSchema({
    resolvers: [BookResolver]
  });
  const server = new ApolloServer({ schema });
  await server.listen(4000);
  console.log("✅ Server has started! http://localhost:4000/");
}
main();
