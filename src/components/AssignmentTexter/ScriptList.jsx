import PropTypes from "prop-types";
import React from "react";

import Button from "@mui/material/Button";
import CreateIcon from "@mui/icons-material/Create";
import ClearIcon from "@mui/icons-material/Clear";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import CannedResponseForm from "../CannedResponseForm";
import { log } from "../../lib";

const styles = {
  dialog: {
    zIndex: 10001
  }
};

class ScriptList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false
    };
  }

  handleOpenDialog = () => {
    this.setState({
      dialogOpen: true
    });
    // hack so mobile onclick doesn't close immediately
    setTimeout(() => {
      this.setState({ dialogReady: true });
    }, 200);
  };

  handleCloseDialog = () => {
    if (this.state.dialogReady) {
      this.setState({
        dialogOpen: false,
        dialogReady: false
      });
    }
  };

  render() {
    const {
      subheader,
      scripts = [],
      onSelectCannedResponse,
      onCreateCannedResponse,
      showAddScriptButton,
      currentCannedResponseScript,
      customFields
    } = this.props;
    const { dialogOpen } = this.state;

    const onSaveCannedResponse = async cannedResponse => {
      this.setState({ dialogOpen: false });
      try {
        await onCreateCannedResponse({ cannedResponse });
      } catch (err) {
        log.error(err);
      }
    };

    const rightIconButton = null;
    const listItems = scripts.map(script => (
      <ListItem
        button
        value={script.text}
        onClick={() => onSelectCannedResponse(script)}
        onKeyPress={evt => {
          if (evt.key === "Enter") {
            onSelectCannedResponse(script);
          }
        }}
        key={script.id}
      >
        <ListItemText primary={script.title} secondary={script.text} />
        {currentCannedResponseScript &&
          currentCannedResponseScript.id === script.id && (
            <ListItemIcon>
              <ClearIcon />
            </ListItemIcon>
          )}
      </ListItem>
    ));

    const list =
      scripts.length === 0 ? null : (
        <List>
          {subheader ? <ListSubheader>{subheader}</ListSubheader> : ""}
          {listItems}
          <Divider />
        </List>
      );

    return (
      <div>
        {list}
        {showAddScriptButton ? (
          <Button startIcon={<CreateIcon />} onClick={this.handleOpenDialog}>
            Add new canned response
          </Button>
        ) : null}

        <Dialog
          style={styles.dialog}
          open={dialogOpen}
          onClose={this.handleCloseDialog}
        >
          <DialogContent>
            <CannedResponseForm
              onSaveCannedResponse={onSaveCannedResponse}
              handleCloseDialog={this.handleCloseDialog}
              customFields={customFields}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

ScriptList.propTypes = {
  script: PropTypes.object,
  scripts: PropTypes.arrayOf(PropTypes.object),
  subheader: PropTypes.node,
  currentCannedResponseScript: PropTypes.object,
  onSelectCannedResponse: PropTypes.func,
  onCreateCannedResponse: PropTypes.func,
  showAddScriptButton: PropTypes.bool,
  customFields: PropTypes.array
};

export default ScriptList;
