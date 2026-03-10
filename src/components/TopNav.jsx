import PropTypes from "prop-types";
import React from "react";

import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import UserMenu from "../containers/UserMenu";
import withMuiTheme from "./../containers/hoc/withMuiTheme";

export function TopNavBase(props) {
  const { backToURL, orgId, title, muiTheme } = props;
  return (
    <AppBar position="static">
      <Toolbar sx={{ flexGrow: 1 }}>
        {backToURL && (
          <RouterLink to={backToURL}>
            <IconButton size="large">
              <ArrowBackIcon
                style={{ fill: muiTheme.palette.primary.contrastText }}
              />
            </IconButton>
          </RouterLink>
        )}
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <UserMenu orgId={orgId} />
      </Toolbar>
    </AppBar>
  );
}

TopNavBase.propTypes = {
  backToURL: PropTypes.string,
  title: PropTypes.string.isRequired,
  orgId: PropTypes.string
};

export default withMuiTheme(TopNavBase);
