import PropTypes from "prop-types";
import React from "react";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import CreateIcon from "@material-ui/icons/Create";
import ClearIcon from "@material-ui/icons/Clear";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";

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
      dialogOpen: false,
      searchText: ""
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

    const { searchText } = this.state;
    const rightIconButton = null;

    const filteredScripts = searchText
      ? scripts.filter(
          script =>
            script.title.toLowerCase().includes(searchText.toLowerCase()) ||
            script.text.toLowerCase().includes(searchText.toLowerCase())
        )
      : scripts;

    const listItems = filteredScripts.map(script => (
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

    const searchInput =
      scripts.length > 5 ? (
        <TextField
          placeholder="Filter responses..."
          value={searchText}
          onChange={e => this.setState({ searchText: e.target.value })}
          size="small"
          fullWidth
          style={{ padding: "4px 16px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" style={{ opacity: 0.5 }} />
              </InputAdornment>
            ),
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => this.setState({ searchText: "" })}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
      ) : null;

    const list =
      scripts.length === 0 ? null : (
        <List>
          {subheader ? <ListSubheader>{subheader}</ListSubheader> : ""}
          {searchInput}
          {listItems}
          {filteredScripts.length === 0 && searchText && (
            <ListItem>
              <ListItemText
                secondary={`No responses matching "${searchText}"`}
              />
            </ListItem>
          )}
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
