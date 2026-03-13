import type from "prop-types";
import React from "react";
import * as yup from "yup";
import Form from "react-formal";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";

import GSForm from "../../../components/forms/GSForm";
import GSSubmitButton from "../../../components/forms/GSSubmitButton";
import { dataTest } from "../../../lib/attributes";

export class CampaignContactsFormBase extends React.Component {
  state = {
    selectedListId: null
  };

  getContactLists() {
    try {
      const data = JSON.parse(this.props.clientChoiceData || "{}");
      return data.contactLists || [];
    } catch (e) {
      return [];
    }
  }

  handleSelectList = event => {
    const listId = event.target.value;
    const contactLists = this.getContactLists();
    const selected = contactLists.find(cl => cl.id == listId);

    this.setState({ selectedListId: listId });

    if (selected) {
      this.props.onChange(
        JSON.stringify({
          contactListId: selected.id,
          contactListName: selected.name,
          contactsCount: selected.contactCount
        })
      );
    }
  };

  formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  render() {
    if (this.props.campaignIsStarted) {
      let data;
      try {
        data = JSON.parse(
          (this.props.lastResult && this.props.lastResult.result) || "{}"
        );
      } catch (err) {
        return null;
      }
      return data && data.contactListName ? (
        <div>Contact List: {data.contactListName}</div>
      ) : null;
    }

    const contactLists = this.getContactLists();
    const { selectedListId } = this.state;
    const selectedList = selectedListId
      ? contactLists.find(cl => cl.id == selectedListId)
      : null;

    return (
      <div>
        <Typography variant="body2" style={{ marginBottom: 16 }}>
          Select a saved contact list to use for this campaign. Contact lists
          can be managed in the People section of your organization.
        </Typography>

        {contactLists.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No contact lists available. Upload a contact list in the People
            section first.
          </Typography>
        ) : (
          <GSForm
            schema={yup.object({})}
            onSubmit={() => {
              this.props.onSubmit();
            }}
          >
            <FormControl fullWidth style={{ marginBottom: 16 }}>
              <InputLabel>Contact List</InputLabel>
              <Select
                value={selectedListId || ""}
                onChange={this.handleSelectList}
                fullWidth
              >
                {contactLists.map(cl => (
                  <MenuItem key={cl.id} value={cl.id}>
                    {cl.name} ({cl.contactCount.toLocaleString()} contacts)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedList && (
              <List dense>
                <ListItem>
                  <ListItemIcon>{this.props.icons.check}</ListItemIcon>
                  <ListItemText
                    primary={`${selectedList.contactCount.toLocaleString()} contacts`}
                  />
                </ListItem>
                {selectedList.createdAt && (
                  <ListItem>
                    <ListItemIcon>{this.props.icons.info}</ListItemIcon>
                    <ListItemText
                      primary={`Created ${this.formatDate(
                        selectedList.createdAt
                      )}`}
                    />
                  </ListItem>
                )}
              </List>
            )}

            {!!this.props.jobResultMessage && (
              <div style={{ marginTop: 16 }}>
                <Typography variant="body2">
                  {this.props.jobResultMessage}
                </Typography>
              </div>
            )}

            <Form.Submit
              as={GSSubmitButton}
              disabled={this.props.saveDisabled || !selectedListId}
              label={this.props.saveLabel}
              {...dataTest("submitContactsContactList")}
            />
          </GSForm>
        )}
      </div>
    );
  }
}

CampaignContactsFormBase.propTypes = {
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

export const CampaignContactsForm = CampaignContactsFormBase;

CampaignContactsForm.prototype.renderAfterStart = true;
