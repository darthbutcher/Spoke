/**
 * React Router v3 → v6 compatibility shim.
 *
 * All existing files that import from "react-router" are aliased here via
 * webpack resolve.alias. This shim re-exports the stable react-router-dom v6
 * API and provides a v3-compatible `withRouter` HOC so that class components
 * continue receiving props.params, props.location (with .query), and
 * props.router without requiring individual rewrites.
 */

import React from "react";
import {
  useNavigate,
  useParams,
  useLocation
} from "react-router-dom";

// Re-export the full react-router-dom surface so imports like
//   import { Link, NavLink, ... } from "react-router"
// continue to resolve correctly.
export * from "react-router-dom";

function parseQuery(search) {
  const result = {};
  new URLSearchParams(search).forEach((val, key) => {
    result[key] = val;
  });
  return result;
}

/**
 * v3-compatible withRouter HOC.
 *
 * Provides:
 *   props.params   – URL params from useParams()
 *   props.location – location object with an extra `.query` map (v3 compat)
 *   props.router   – navigation helpers: push, replace, goBack, go
 */
export function withRouter(Component) {
  function WithRouter(props) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();

    const router = {
      push: path => navigate(path),
      replace: path => navigate(path, { replace: true }),
      goBack: () => navigate(-1),
      go: n => navigate(n)
    };

    const enrichedLocation = {
      ...location,
      query: parseQuery(location.search)
    };

    return (
      <Component
        {...props}
        params={params}
        location={enrichedLocation}
        router={router}
      />
    );
  }

  WithRouter.displayName = `WithRouter(${Component.displayName ||
    Component.name ||
    "Component"})`;
  return WithRouter;
}
