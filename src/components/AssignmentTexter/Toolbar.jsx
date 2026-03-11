import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, css } from "aphrodite";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import HomeIcon from "@material-ui/icons/Home";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import BuildIcon from "@material-ui/icons/Build";

const inlineStyles = {
  toolbar: {
    backgroundColor: "rgb(81, 82, 89)",
    color: "white",
    padding: 0,
    minHeight: "inherit"
  }
};

const styles = StyleSheet.create({
  grow: {
    flexGrow: 1
  },
  topFlex: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    alignContent: "flex-start"
    // marginLeft: "-24px"
  },
  campaignData: {
    flex: "1 2 auto",
    maxWidth: "80%",
    "@media(max-width: 375px)": {
      maxWidth: "70%" // iphone 5 and X
    }
  },
  contactData: {
    flex: "1 2 auto",
    maxWidth: "80%",
    "@media(max-width: 375px)": {
      maxWidth: "50%" // iphone 5 and X
    }
  },
  titleArea: {
    // give room for the wrench sideboxes icon
    maxWidth: "calc(100% - 100px)"
  },
  contactArea: {
    // give room for prev/next arrows
    maxWidth: "calc(100% - 200px)"
  },
  titleSmall: {
    height: "18px",
    lineHeight: "18px",
    paddingTop: "4px",
    paddingRight: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "95%"
  },
  titleBig: {
    height: "34px",
    lineHeight: "34px",
    paddingRight: "10px",
    fontWeight: "bold",
    color: "white",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  contactToolbarIconButton: {
    padding: "3px",
    height: "56px",
    "@media(max-width: 350px)": {
      width: "50px"
    }
  },
  navigationSideBox: {
    flexBasis: "24px",
    // width also in Controls.jsx::getSideboxDialogOpen
    "@media(min-width: 575px)": {
      display: "none"
    }
  },
  navigation: {
    flexGrow: 0,
    flexShrink: 0,
    display: "flex"
    // flexDirection: "column",
    // flexWrap: "wrap"
  },
  navigationTitle: {
    width: "4em",
    // height: "100%",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
});

const keyboardShortcuts = [
  { keys: "Ctrl + Enter", action: "Send message" },
  { keys: "Ctrl + Y", action: "Skip contact" },
  { keys: "Ctrl + >", action: "Next contact" },
  { keys: "Ctrl + <", action: "Previous contact" },
  { keys: "Escape", action: "Close dialogs" },
  { keys: "Enter / Space", action: "Send (initial messages only)" }
];

const CampaignToolbar = props => {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <Toolbar style={inlineStyles.toolbar}>
      <Tooltip title="Return Home">
        <IconButton
          onClick={props.onExit}
          className={css(styles.contactToolbarIconButton)}
        >
          <HomeIcon style={{ width: 42 }} htmlColor="white" />
        </IconButton>
      </Tooltip>
      <div className={css(styles.titleArea)}>
        <div className={css(styles.titleSmall)} style={{ color: "#B0B0B0" }}>
          Campaign ID: {props.campaign.id}
        </div>
        <div className={css(styles.titleBig)} title={props.campaign.title}>
          {props.campaign.title}
        </div>
      </div>
      <div className={css(styles.grow)}></div>
      <Tooltip title="Keyboard Shortcuts">
        <IconButton
          onClick={() => setShortcutsOpen(true)}
          className={css(styles.contactToolbarIconButton)}
          style={{ width: "36px", padding: "3px" }}
        >
          <HelpOutlineIcon htmlColor="white" style={{ width: 20 }} />
        </IconButton>
      </Tooltip>
      {props.onSideboxButtonClick && (
        <div
          className={`${css(styles.navigation)} ${css(
            styles.navigationSideBox
          )}`}
        >
          <Tooltip title="Open Details">
            <IconButton
              onClick={props.onSideboxButtonClick}
              className={css(styles.contactToolbarIconButton)}
              style={{ flex: "0 0 56px", width: "45px" }}
            >
              <BuildIcon htmlColor="white" />
            </IconButton>
          </Tooltip>
        </div>
      )}
      <Dialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableBody>
              {keyboardShortcuts.map(shortcut => (
                <TableRow key={shortcut.keys}>
                  <TableCell>
                    <code
                      style={{
                        backgroundColor: "#f5f5f5",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "13px"
                      }}
                    >
                      {shortcut.keys}
                    </code>
                  </TableCell>
                  <TableCell>{shortcut.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </Toolbar>
  );
};

CampaignToolbar.propTypes = {
  campaign: PropTypes.object,
  onSideboxButtonClick: PropTypes.func,
  onExit: PropTypes.func
};

export default CampaignToolbar;
