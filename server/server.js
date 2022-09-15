const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const { authMiddleware } = require("./utils/auth");
const path = require('path');

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//maybe inside of  startApollo???????
//serve up static assets
if(process.env.NODE_ENV ==='production'){
  app.use(express.static(path.join(__dirname, '../client/build')));
}
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
})
//create a new instance of an apollo server with graphql schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  //integrate our apollo server with the express application as middleware
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      //log where we can go to test our GQL API
      console.log(
        `Use GraphQl at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

//call the async function to start the server
startApolloServer(typeDefs, resolvers);
