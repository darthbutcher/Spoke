import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StyleSheet } from "aphrodite";
import errorCatcher from "./error-catcher";
import makeRoutes from "../routes";
import { ApolloProvider } from "@apollo/client";
import ApolloClientSingleton from "../network/apollo-client-singleton";
import { login, logout } from "./auth-service";

window.onerror = (msg, file, line, col, error) => {
  errorCatcher(error);
};
window.addEventListener("unhandledrejection", event => {
  errorCatcher(event.reason);
});
window.AuthService = {
  login,
  logout
};

StyleSheet.rehydrate(window.RENDERED_CLASS_NAMES);

const root = createRoot(document.getElementById("mount"));
root.render(
  <ApolloProvider client={ApolloClientSingleton}>
    <BrowserRouter>{makeRoutes()}</BrowserRouter>
  </ApolloProvider>
);
