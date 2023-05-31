import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { schemaFromExecutor, wrapSchema } from '@graphql-tools/wrap'
import express from 'express'
import { createYoga } from 'graphql-yoga'

require("greenlock-express")
  .init({
    packageRoot: __dirname,

    // contact for security and critical bug notices
    maintainerEmail: 'vanphandinh@outlook.com',

    // where to look for configuration
    configDir: "./greenlock.d",

    // whether or not to run at cloudscale
    cluster: true,
  })
  // Serves on 80 and 443
  // Get's SSL certificates magically!
  .ready(httpsWorker)
  .master(function() {
    console.log("master");
  });

async function httpsWorker(glx) {
  const executor = buildHTTPExecutor({
    endpoint: 'https://mina-mainnet-graphql.aurowallet.com/graphql'
  })

  const schema = await schemaFromExecutor(executor)

  const remoteSchema = wrapSchema({
    executor,
    schema
  })

  const yoga = createYoga({
    schema: remoteSchema,
    landingPage: false,
    graphiql: {
      defaultQuery: /* GraphQL */ `query {\n  syncStatus\n}`
    }
  })

  const app = express()
  app.use(yoga.graphqlEndpoint, yoga)

  app.get('/', (req, res) => {
    res.status(301).redirect('/graphql');
  });

  glx.serveApp(app);
}
