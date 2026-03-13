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

const styles = StyleSheet.create({
  grow: {
    flexGrow: 1
  },
  topFlex: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    alignContent: "flex-start"
  },
  campaignData: {
    flex: "1 2 auto",
    maxWidth: "80%",
    "@media(max-width: 375px)": {
      maxWidth: "70%"
    }
  },
  contactData: {
    flex: "1 2 auto",
    maxWidth: "80%",
    "@media(max-width: 375px)": {
      maxWidth: "50%"
    }
  },
  titleArea: {
    maxWidth: "calc(100% - 100px)"
  },
  contactArea: {
    maxWidth: "calc(100% - 200px)"
  },
  campaignId: {
    fontSize: "12px",
    opacity: 0.6,
    lineHeight: "16px",
    paddingTop: "2px",
    paddingRight: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "95%"
  },
  campaignTitle: {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
    paddingRight: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  iconButton: {
    padding: "6px",
    height: "44px",
    width: "44px",
    "@media(max-width: 350px)": {
      width: "40px"
    }
  },
  navigationSideBox: {
    flexBasis: "24px",
    "@media(min-width: 575px)": {
      display: "none"
    }
  },
  navigation: {
    flexGrow: 0,
    flexShrink: 0,
    display: "flex"
  },
  navigationTitle: {
    width: "4em",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  shortcutKey: {
    backgroundColor: "#F3F4F6",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace",
    border: "1px solid #E5E7EB"
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
    <Toolbar
      style={{
        backgroundColor: "#1F2937",
        color: "#F3F4F6",
        padding: "0 8px",
        minHeight: "52px"
      }}
    >
      <Tooltip title="Return Home">
        <IconButton
          onClick={props.onExit}
          className={css(styles.iconButton)}
        >
          <HomeIcon style={{ width: 24 }} htmlColor="#F3F4F6" />
        </IconButton>
      </Tooltip>
      <div className={css(styles.titleArea)}>
        <div className={css(styles.campaignId)}>
          Campaign {props.campaign.id}
        </div>
        <div className={css(styles.campaignTitle)} title={props.campaign.title}>
          {props.campaign.title}
        </div>
      </div>
      <div className={css(styles.grow)}></div>
      <Tooltip title="Keyboard Shortcuts">
        <IconButton
          onClick={() => setShortcutsOpen(true)}
          className={css(styles.iconButton)}
        >
          <HelpOutlineIcon htmlColor="#9CA3AF" style={{ width: 20 }} />
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
              className={css(styles.iconButton)}
            >
              <BuildIcon htmlColor="#9CA3AF" />
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
                    <code className={css(styles.shortcutKey)}>
                      {shortcut.keys}
                    </code>
                  </TableCell>
                  <TableCell style={{ fontSize: "14px" }}>
                    {shortcut.action}
                  </TableCell>
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
