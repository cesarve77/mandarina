import React, {PureComponent} from "react";
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import {onError} from 'apollo-link-error';
import {ApolloLink} from 'apollo-link';
import {ApolloProvider} from "react-apollo";
import fetch from 'unfetch'
import '../tables/User'
import '../tables/Address'
import '../tables/Category'
import '../tables/Post'


export const client = new ApolloClient({
    link: ApolloLink.from([
        onError(({graphQLErrors, networkError}) => {
            if (graphQLErrors)
                graphQLErrors.map(({message, locations, path, ...rest}) =>
                    console.log(`[GraphQL error]: Message:`, message, rest))
            if (networkError) console.log(`[Network' error]: ${networkError}`);
        }),
        new HttpLink({
            fetch,
            uri: 'http://localhost:7000',
            credentials: 'same-origin'
        })
    ]),
    cache: new InMemoryCache()
});

class App extends PureComponent {
    render() {
        return (
            <ApolloProvider client={client}>
                {this.props.children}
            </ApolloProvider>
        )
    }
}


export default App