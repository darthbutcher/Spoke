/* eslint-disable no-unused-vars */
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";
import FolderIcon from "@mui/icons-material/Folder";
import TextField from "@mui/material/TextField";
import Autocomplete from '@mui/material/Autocomplete';
import LoadingIndicator from "../../../components/LoadingIndicator";
import _ from "lodash";
import type from "prop-types";
import React from "react";
import * as yup from "yup";
import Form from "react-formal";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import GSForm from "../../../components/forms/GSForm";
import GSSubmitButton from "../../../components/forms/GSSubmitButton";
import fetch from "node-fetch";
import {
  CIVICRM_INTEGRATION_GROUPSEARCH_ENDPOINT,
  CIVICRM_MINQUERY_SIZE
} from "./const";
import CircularProgress from "@mui/material/CircularProgress";
import { log } from "../../../lib/log";

export default function CiviCRMLoaderField(props) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedGroups, setSelectedGroups] = React.useState([]);
  const [error, setError] = React.useState("");

  // See https://v4.mui.com/components/autocomplete/#controllable-states
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    let active = true;

    if (inputValue.length >= CIVICRM_MINQUERY_SIZE) {
      (async () => {
        try {
          const response = await fetch(
            `${CIVICRM_INTEGRATION_GROUPSEARCH_ENDPOINT}?query=${inputValue}`
          );
          const json = await response.json();

          if (active) {
            setOptions(json.groups);
          }
          setError("");
        } catch (err) {
          setError(err.message);
          log.error(error);
        }
      })();
    }

    setLoading(false);

    return () => {
      active = false;
    };
  }, [inputValue]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const removeId = id => {
    setSelectedGroups(selectedGroups.filter(item => item.id !== id));
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ padding: "5px", flexBasis: "50%" }}>
        <div style={{ display: "flex" }}>
          <Autocomplete
            value={value}
            inputValue={inputValue}
            id="civicrmloader"
            style={{ width: "100%" }}
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            isOptionEqualToValue={(option, theValue) =>
              theValue ? option.title === theValue.title : false
            }
            getOptionLabel={option => (option ? option.title : "")}
            options={options}
            loading={loading}
            disableClearable
            onInputChange={(_event, text) => {
              setInputValue(text);
            }}
            onChange={(_event, el, _reason) => {
              // Fired when the input value changes (i.e something is selected)
              if (el) {
                const elid = el.id;
                if (!selectedGroups.find(element => element.id === elid)) {
                  const newSelectedGroups = selectedGroups.concat([el]);
                  props.onChange(newSelectedGroups);
                  setSelectedGroups(newSelectedGroups);
                }
              }
              // Finally we clear the value, which is a bit counter
              // intuitive but how we want this to operate
              setValue(null);
              setInputValue("");
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="CiviCRM Groups"
                variant="outlined"
                error={error.length > 0}
                helperText={error}
                style={{ width: "100%" }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  )
                }}
              />
            )}
          />
          {loading && <LoadingIndicator />}
        </div>
        <h4>Selected Groups</h4>
        <div style={{ display: "flex" }}>
          <List style={{ flexBasis: "100%" }}>
            {selectedGroups.map(x => (
              <ListItem key={`listitem ${x.id}`}>
                <ListItemAvatar>
                  <Avatar>
                    <FolderIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={x.title} />
                <ListItemSecondaryAction onClick={() => removeId(x.id)}>
                  <IconButton edge="end" aria-label="delete" size="large">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}

export class CampaignContactsForm extends React.Component {
  state = {
    error: null,
    result: []
  };

  renderForm(resultMessage) {
    return (
      <GSForm
        schema={yup.object({
          groupIds: yup.array().of(
            yup.object().shape({
              count: yup.number(),
              id: yup.number(),
              title: yup.string()
            })
          )
        })}
        // initialValues={{ groupIds: [] }}
        onChange={formValues => {
          this.setState({ ...formValues });
          this.props.onChange(JSON.stringify(formValues));
        }}
        onSubmit={formValues => {
          // sets values locally
          this.setState({ ...formValues });
          // triggers the parent to update values
          this.props.onChange(JSON.stringify(formValues));
          // and now do whatever happens when clicking 'Next'
          this.props.onSubmit();
        }}
      >
        <Form.Field name="groupIds" as={CiviCRMLoaderField}></Form.Field>
        <List>
          {resultMessage ? (
            <ListItem>
              <ListItemIcon>{this.props.icons.check}</ListItemIcon>
              <ListItemText primary={resultMessage} />
            </ListItem>
          ) : null}
        </List>
        <Form.Submit
          as={GSSubmitButton}
          disabled={this.props.saveDisabled}
          label={this.props.saveLabel}
        />
      </GSForm>
    );
  }

  render() {
    let resultMessage = "";

    if (this.props.lastResult && this.props.lastResult.result) {
      try {
        const { message, finalCount } = JSON.parse(
          this.props.lastResult.result
        );
        resultMessage = message || `Loaded ${finalCount} contacts`;
      } catch (err) {
        resultMessage = err.message;
      }
    } else if (this.state.error) {
      resultMessage = `Error: ${JSON.stringify(this.state.error)}`;
    } else {
      resultMessage = "";
    }

    let subtitle = (
      <span>
        Please select one or more CiviCRM groups that contain contact
        information you wish to load.
      </span>
    );

    return (
      <div>
        {subtitle}
        {this.renderForm(resultMessage)}
      </div>
    );
  }
}

CampaignContactsForm.propTypes = {
  onChange: type.func,
  onSubmit: type.func,
  campaignIsStarted: type.bool,
  icons: type.object,
  saveDisabled: type.bool,
  saveLabel: type.string,
  clientChoiceData: type.string,
  jobResultMessage: type.string,
  lastResult: type.object
};

CiviCRMLoaderField.propTypes = {
  onChange: type.func
};
