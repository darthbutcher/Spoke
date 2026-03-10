import React, { useRef, useMemo } from "react";
import { useQuery, useSubscription, useApolloClient } from "@apollo/client";
import { flowRight as compose } from "lodash";
import { useParams, useLocation } from "react-router-dom";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

import LoadingIndicator from "../../components/LoadingIndicator";

function parseLocationQuery(search) {
  const q = {};
  new URLSearchParams(search).forEach((v, k) => {
    q[k] = v;
  });
  return q;
}

/**
 * Wraps Component with useQuery hooks for each named query.
 *
 * Queries are processed in insertion order. Each query's `options` function
 * receives props merged with all previously-resolved query results, matching
 * the behaviour of the old Apollo graphql() HOC compose chain where later
 * HOCs could read the results of earlier ones via ownProps.
 *
 * Route params (from useParams) and a v3-compatible location.query object
 * are automatically merged into ownProps so that query option functions that
 * reference ownProps.params.xxx continue to work without requiring every
 * component to be wrapped with withRouter.
 *
 * Result props injected per query:
 *   props[name] = { loading, error, refetch, startPolling, stopPolling, networkStatus, ...data }
 *
 * Additionally injects:
 *   loading  – true if ANY query is still loading
 *   errors   – array of ApolloError objects from all errored queries
 */
export const withQueries = (queryDefs = {}) => {
  const queryEntries = Object.entries(queryDefs);

  return Component => {
    function WithQueries(props) {
      // Pull URL params from the router so ownProps.params.xxx works in query
      // option functions even for components not wrapped with withRouter.
      const routeParams = useParams();
      const routeLocation = useLocation();
      const routeQuery = useMemo(
        () => parseLocationQuery(routeLocation.search),
        [routeLocation.search]
      );

      // Merge URL params with any explicitly-passed params (explicit wins).
      const mergedParams = { ...routeParams, ...(props.params || {}) };
      const mergedLocation = props.location || {
        ...routeLocation,
        query: routeQuery
      };

      // Accumulate resolved query results in order so later queries can read
      // earlier ones via their options(combinedProps) function.
      const accumulated = {};
      let anyLoading = false;
      const allErrors = [];

      for (const [name, { query, options }] of queryEntries) {
        const combinedProps = {
          ...props,
          params: mergedParams,
          location: mergedLocation,
          ...accumulated
        };
        const resolvedOptions =
          typeof options === "function" ? options(combinedProps) : options || {};

        // useQuery is called inside a for-of loop over a statically-defined
        // object. The iteration count and order never change between renders,
        // so the rules-of-hooks constraint (stable call order) is satisfied.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const result = useQuery(query, resolvedOptions);

        accumulated[name] = {
          loading: result.loading,
          error: result.error,
          refetch: result.refetch,
          startPolling: result.startPolling,
          stopPolling: result.stopPolling,
          networkStatus: result.networkStatus,
          ...(result.data || {})
        };

        if (result.loading) anyLoading = true;
        if (result.error) allErrors.push(result.error);
      }

      return (
        <Component
          {...props}
          params={mergedParams}
          location={mergedLocation}
          {...accumulated}
          loading={anyLoading}
          errors={allErrors}
        />
      );
    }

    WithQueries.displayName = `WithQueries(${Component.displayName ||
      Component.name ||
      "Component"})`;
    return WithQueries;
  };
};

/**
 * Wraps Component with Apollo mutation helpers exposed as props.mutations.
 *
 * Mutations are defined as curried constructors matching the existing pattern:
 *   mutationName: ownProps => (...args) => ({ mutation, variables, ... })
 *
 * The constructor is called with the *latest* props at invocation time (via
 * ref), so stale closures are never a concern.
 *
 * Also injects `client` (the Apollo client instance) for advanced use cases.
 */
const withMutations = (mutationDefs = {}) => {
  const mutationEntries = Object.entries(mutationDefs);

  if (!mutationEntries.length) {
    return Component => Component;
  }

  return Component => {
    function WithMutations(props) {
      const client = useApolloClient();

      // Always keep a ref to the latest props so mutation constructors that
      // reference ownProps don't capture stale values.
      const latestProps = useRef(props);
      latestProps.current = props;

      const mutations = useMemo(() => {
        return mutationEntries.reduce((acc, [name, constructor]) => {
          acc[name] = async (...args) => {
            const options = constructor(latestProps.current)(...args);
            return await client.mutate(options);
          };
          return acc;
        }, {});
        // mutationEntries is defined at HOC creation time and never changes.
        // client is stable for the lifetime of the ApolloProvider.
      }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

      return <Component {...props} client={client} mutations={mutations} />;
    }

    WithMutations.displayName = `WithMutations(${Component.displayName ||
      Component.name ||
      "Component"})`;
    return WithMutations;
  };
};

/**
 * Wraps Component with GraphQL subscription listeners.
 *
 * Each subscription entry:
 *   subscriptionName: {
 *     subscription: gql`...`,
 *     options: ownProps => ({ variables: { ... }, skip: false }),
 *     refetchQueries: ["queryPropName", ...]   // called on each event
 *   }
 *
 * When a subscription event arrives, every query name listed in
 * `refetchQueries` has its `refetch()` called via the latest props —
 * eliminating polling without changing the underlying query shape.
 */
const withSubscriptions = (subscriptionDefs = {}) => {
  const subscriptionEntries = Object.entries(subscriptionDefs);

  if (!subscriptionEntries.length) {
    return Component => Component;
  }

  return Component => {
    function WithSubscriptions(props) {
      // Always use the latest props in callbacks so refetch functions never go stale.
      const latestProps = useRef(props);
      latestProps.current = props;

      for (const [, { subscription, options, refetchQueries = [] }] of subscriptionEntries) {
        const resolvedOptions =
          typeof options === "function" ? options(props) : options || {};

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useSubscription(subscription, {
          ...resolvedOptions,
          onData: () => {
            for (const queryName of refetchQueries) {
              const queryProp = latestProps.current[queryName];
              if (queryProp && typeof queryProp.refetch === "function") {
                queryProp.refetch();
              }
            }
          }
        });
      }

      return <Component {...props} />;
    }

    WithSubscriptions.displayName = `WithSubscriptions(${Component.displayName ||
      Component.name ||
      "Component"})`;
    return WithSubscriptions;
  };
};

/**
 * Composes query, subscription, and mutation wrappers for a Component.
 */
const withOperations = ({ queries = {}, mutations = {}, subscriptions = {} }) =>
  compose(
    withQueries(queries),
    withSubscriptions(subscriptions),
    withMutations(mutations)
  );

const PrettyErrors = ({ errors }) => (
  <Card style={{ margin: "10px" }}>
    <CardHeader title="Encountered errors" />
    <CardContent>
      <ul>
        {errors.map((err, index) => (
          <li key={index}>{err.message}</li>
        ))}
      </ul>
    </CardContent>
    <CardActions>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </CardActions>
  </Card>
);

/**
 * Primary HOC. Wraps Component with GraphQL queries and mutations, showing a
 * loading indicator until all queries resolve and an error card on failure.
 *
 * Usage:
 *   export default loadData({ queries, mutations })(MyComponent);
 *
 * @param {Object} options  { queries, mutations } — same shape as before
 */
export default options =>
  compose(
    withOperations(options),
    Component => ({ loading, errors, ...props }) => {
      if (loading) {
        return <LoadingIndicator />;
      } else if (errors && errors.length > 0) {
        return <PrettyErrors errors={errors} />;
      } else {
        return <Component {...props} />;
      }
    }
  );
