import { GraphQLClient } from 'graphql-request'

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || ''

export const graphQLClient = new GraphQLClient(SUBGRAPH_URL)
