import React from "react";
import { StyleSheet, css } from "aphrodite";
import CircularProgress from "@mui/material/CircularProgress";

const styles = StyleSheet.create({
  loader: {
    marginRight: "auto",
    marginLeft: "auto",
    marginTop: 50,
    textAlign: "center"
  }
});

export default () => (
  <div className={css(styles.loader)}>
    <CircularProgress />
  </div>
);
