const { GraphQLServer } = require('graphql-yoga')
require('dotenv').config()
const { prisma } = require('./src/generated/prisma-client')
const Query = require('./src/resolvers/Query')
const Mutation = require('./src/resolvers/Mutation')
const Link = require('./src/resolvers/Link')
const User = require('./src/resolvers/User')
const Subscription = require('./src/resolvers/Subscription')
const Vote = require('./src/resolvers/Vote')


const resolvers = {
  Query,
  Mutation,
  User,
  Link,
  Subscription,
  Vote
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: request => {
    return {
      ...request,
      prisma,
    }
  }
})

server.start(() => console.log(`Server is running on http://localhost:4000`))
