import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import { fileLoader, mergeResolvers } from "merge-graphql-schemas";
import morgan from "morgan";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import connectionOptions from "../ormconfig";
import decodeJWT from "./utils/decodeJWT";

const resolverFiles: any[] = fileLoader(
  path.join(__dirname, "./api/**/*.resolvers.*")
);
const mergedResolvers = mergeResolvers(resolverFiles);

async function main() {
  await createConnection(connectionOptions);

  const schema = await buildSchema({
    resolvers: [
      mergedResolvers.UserResolver,
      mergedResolvers.PostResolver,
      mergedResolvers.CategoryResolver,
      mergedResolvers.CommentResolver
    ]
  });

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const token = req.get("X-JWT");
      if (token) {
        const user = decodeJWT(token);
        if (user) {
          return user;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  });
  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));

  await server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`✅ Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}
main();
