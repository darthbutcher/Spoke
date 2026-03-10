import PropTypes from "prop-types";
import React from "react";

import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import { withRouter } from "react-router";
import _ from "lodash";
import { dataTest, camelCase } from "../lib/attributes";
import { StyleSheet, css } from "aphrodite";

const styles = StyleSheet.create({
  sideBarWithMenu: {
    width: 256,
    height: "100%"
  },
  sideBarWithoutMenu: {
    padding: "5px",
    paddingTop: "20px"
  }
});

const Navigation = function Navigation(props) {
  const { sections, switchListItem } = props;

  if (props.showMenu) {
    return (
      <div className={css(styles.sideBarWithMenu)}>
        <Paper
          elevation={3}
          style={{
            height: "100%"
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={props.onToggleMenu} size="large">
              <CloseIcon />
            </IconButton>
          </div>

          <List>
            {sections.map(section => (
              <ListItem
                {...dataTest(_.camelCase(`nav ${section.path}`))}
                button
                key={section.name}
                onClick={() => props.router.push(section.url)}
              >
                <ListItemText primary={section.name} />
              </ListItem>
            ))}
            <Divider />
            {switchListItem}
          </List>
        </Paper>
      </div>
    );
  } else {
    return (
      <IconButton onClick={props.onToggleMenu} size="large">
        <MenuIcon />
      </IconButton>
    );
  }
};

Navigation.defaultProps = {
  showMenu: true
};

Navigation.propTypes = {
  sections: PropTypes.array,
  switchListItem: PropTypes.object,
  router: PropTypes.object,
  onToggleMenu: PropTypes.func.isRequired,
  showMenu: PropTypes.bool
};

export default withRouter(Navigation);
