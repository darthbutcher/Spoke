import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, css } from "aphrodite";

import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Button from "@mui/material/Button";
import ErrorIcon from "@mui/icons-material/Error";

import CampaignFormSectionHeading from "../components/CampaignFormSectionHeading";

const styles = StyleSheet.create({
  buttonDiv: {
    marginTop: "10px"
  }
});

export default class AdminScriptImport extends Component {
  static propTypes = {
    startImport: PropTypes.func,
    hasPendingJob: PropTypes.bool,
    jobError: PropTypes.bool,
    onSubmit: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      ...(!!props.jobError && {
        error: `Error from last attempt: ${props.jobError}`
      })
    };
  }

  startImport = async () => {
    const res = await this.props.startImport(this.state.url);
    if (res.errors) {
      this.setState({ error: res.errors.message });
    }
    this.props.onSubmit();
  };

  handleUrlChange = ({ target }) => this.setState({ url: target.value });

  renderErrors = () =>
    this.state.error && (
      <List>
        <ListItem>
          <ListItemIcon>
            <ErrorIcon color="error" />
          </ListItemIcon>
          <ListItemText primary={this.state.error} />
        </ListItem>
      </List>
    );

  renderGoogleClientEmail = () => 
    window.GOOGLE_CLIENT_EMAIL ? (
      <span>
        Please share your Google Doc with <b>{window.GOOGLE_CLIENT_EMAIL}</b> before importing to Spoke
      </span>
    ) : (
      <span>
        <b>ERROR</b>: Bad BASE64_GOOGLE_SECRET<br/> Please contact your Administrator.
      </span>
    )
  

  render() {
    const url =
      "https://github.com/StateVoicesNational/Spoke/blob/main/docs/HOWTO_IMPORT_GOOGLE_DOCS_SCRIPTS_TO_IMPORT.md";
    return (
      <div>
        <CampaignFormSectionHeading
          title="Script Import"
          subtitle={
            <span>
              You can import interactions and canned responses from a properly
              formatted Google Doc. Please refer to{" "}
              <a target="_blank" href={url}>
                {" "}
                this document
              </a>{" "}
              for more details.
              <br/><br/>
              {this.renderGoogleClientEmail()}
            </span>
          }
        />
        <TextField
          variant="outlined"
          label="Google Doc URL"
          fullWidth
          onChange={this.handleUrlChange}
        />
        {this.renderErrors()}
        <div className={css(styles.buttonDiv)}>
          <Button
            variant="contained"
            disabled={this.props.hasPendingJob}
            color="primary"
            onClick={this.startImport}
          >
            Import
          </Button>
        </div>
      </div>
    );
  }
}
