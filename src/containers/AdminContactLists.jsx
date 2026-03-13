import React from "react";
import { gql } from "@apollo/client";
import { withRouter } from "react-router";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Fab from "@material-ui/core/Fab";
import IconButton from "@material-ui/core/IconButton";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Snackbar from "@material-ui/core/Snackbar";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import PeopleIcon from "@material-ui/icons/People";

import theme from "../styles/theme";
import loadData from "./hoc/load-data";
import { parseCSV } from "../lib/parse_csv";
import { topLevelUploadFields } from "../lib/parse_csv";
import ContactExplorer from "../components/ContactExplorer";

class AdminContactLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      uploadDialogOpen: false,
      deleteDialogOpen: false,
      viewDialogOpen: false,
      selectedListId: null,
      listName: "",
      listDescription: "",
      fileName: "",
      parsedContacts: null,
      customFields: [],
      validationStats: null,
      parseError: null,
      uploading: false,
      snackbarMessage: ""
    };
  }

  handleTabChange = (event, newValue) => {
    this.setState({ activeTab: newValue });
  };

  handleOpenUpload = () => {
    this.setState({
      uploadDialogOpen: true,
      listName: "",
      listDescription: "",
      fileName: "",
      parsedContacts: null,
      customFields: [],
      validationStats: null,
      parseError: null
    });
  };

  handleCloseUpload = () => {
    this.setState({ uploadDialogOpen: false });
  };

  handleFileChange = event => {
    const file = event.target.files[0];
    if (!file) return;

    this.setState({ fileName: file.name, parseError: null });

    const headerTransformer = header => {
      for (const [standardName, aliases] of Object.entries(
        topLevelUploadFields
      )) {
        if (
          aliases.includes(header) ||
          aliases.includes(header.toLowerCase().trim())
        ) {
          return standardName;
        }
      }
      return header;
    };

    parseCSV(
      file,
      result => {
        if (result.error) {
          this.setState({ parseError: result.error, parsedContacts: null });
        } else {
          const rows = result.contacts.map(c => {
            const customFields = c.custom_fields
              ? JSON.parse(c.custom_fields)
              : {};
            return {
              firstName: c.first_name,
              lastName: c.last_name,
              cell: c.cell,
              zip: c.zip,
              external_id: c.external_id,
              ...customFields
            };
          });
          this.setState({
            parsedContacts: rows,
            customFields: result.customFields,
            validationStats: result.validationStats,
            listName: this.state.listName || file.name.replace(/\.csv$/i, "")
          });
        }
      },
      { headerTransformer }
    );
  };

  handleCreateList = async () => {
    const { listName, listDescription, fileName, parsedContacts } = this.state;
    if (!parsedContacts || !listName) return;

    this.setState({ uploading: true });
    try {
      await this.props.mutations.createContactList(
        this.props.params.organizationId,
        listName,
        listDescription || null,
        fileName || null,
        JSON.stringify(parsedContacts)
      );
      await this.props.data.refetch();
      this.setState({
        uploadDialogOpen: false,
        uploading: false,
        snackbarMessage: `Contact list "${listName}" created successfully`
      });
    } catch (err) {
      this.setState({
        uploading: false,
        parseError: err.message || "Failed to create contact list"
      });
    }
  };

  handleOpenDelete = listId => {
    this.setState({ deleteDialogOpen: true, selectedListId: listId });
  };

  handleCloseDelete = () => {
    this.setState({ deleteDialogOpen: false, selectedListId: null });
  };

  handleDelete = async () => {
    const { selectedListId } = this.state;
    try {
      await this.props.mutations.deleteContactList(
        this.props.params.organizationId,
        selectedListId
      );
      await this.props.data.refetch();
      this.setState({
        deleteDialogOpen: false,
        selectedListId: null,
        snackbarMessage: "Contact list deleted"
      });
    } catch (err) {
      this.setState({
        snackbarMessage: "Failed to delete contact list"
      });
    }
  };

  handleOpenView = listId => {
    this.setState({ viewDialogOpen: true, selectedListId: listId });
  };

  handleCloseView = () => {
    this.setState({ viewDialogOpen: false, selectedListId: null });
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

  renderContactListsTab() {
    const {
      uploadDialogOpen,
      deleteDialogOpen,
      viewDialogOpen,
      selectedListId,
      listName,
      listDescription,
      parsedContacts,
      validationStats,
      parseError,
      uploading
    } = this.state;

    const contactLists =
      (this.props.data.contactLists &&
        this.props.data.contactLists.contactLists) ||
      [];

    const selectedList = selectedListId
      ? contactLists.find(cl => cl.id === selectedListId)
      : null;

    return (
      <div>
        {contactLists.length === 0 ? (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <PeopleIcon
              style={{ fontSize: 64, color: "#9CA3AF", marginBottom: 16 }}
            />
            <Typography variant="h6" gutterBottom>
              No contact lists yet
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              style={{ marginBottom: 24 }}
            >
              Upload a CSV file to create a reusable contact list for your
              campaigns.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={this.handleOpenUpload}
            >
              Upload Contact List
            </Button>
          </Card>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contacts</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contactLists.map(cl => (
                <TableRow key={cl.id}>
                  <TableCell>
                    <Typography variant="subtitle1">{cl.name}</Typography>
                    {cl.description && (
                      <Typography variant="body2" color="textSecondary">
                        {cl.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${cl.contactCount} contacts`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {cl.fileName || "\u2014"}
                    </Typography>
                  </TableCell>
                  <TableCell>{this.formatDate(cl.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => this.handleOpenView(cl.id)}
                      title="View contacts"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => this.handleOpenDelete(cl.id)}
                      title="Delete list"
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Fab
          color="primary"
          style={theme.components.floatingButton}
          onClick={this.handleOpenUpload}
        >
          <AddIcon />
        </Fab>

        {/* Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onClose={this.handleCloseUpload}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Upload Contact List</DialogTitle>
          <DialogContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Button variant="outlined" component="label">
                Choose CSV File
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={this.handleFileChange}
                />
              </Button>

              {parseError && (
                <Typography color="error" variant="body2">
                  {parseError}
                </Typography>
              )}

              {validationStats && (
                <div>
                  <Typography variant="body2" color="textSecondary">
                    {parsedContacts.length} valid contacts
                    {validationStats.dupeCount > 0 &&
                      ` (${validationStats.dupeCount} duplicates removed)`}
                    {validationStats.invalidCellCount > 0 &&
                      ` (${validationStats.invalidCellCount} invalid numbers)`}
                    {validationStats.missingCellCount > 0 &&
                      ` (${validationStats.missingCellCount} missing numbers)`}
                  </Typography>
                </div>
              )}

              <TextField
                label="List Name"
                value={listName}
                onChange={e => this.setState({ listName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Description (optional)"
                value={listDescription}
                onChange={e =>
                  this.setState({ listDescription: e.target.value })
                }
                fullWidth
                multiline
                rows={2}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseUpload}>Cancel</Button>
            <Button
              onClick={this.handleCreateList}
              color="primary"
              variant="contained"
              disabled={!parsedContacts || !listName || uploading}
            >
              {uploading ? "Uploading..." : "Create List"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={this.handleCloseDelete}>
          <DialogTitle>Delete Contact List</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{" "}
              <strong>{selectedList ? selectedList.name : ""}</strong>? This
              action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDelete}>Cancel</Button>
            <Button onClick={this.handleDelete} style={{ color: "#E53935" }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={this.handleCloseView}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {selectedList ? selectedList.name : "Contact List"}
          </DialogTitle>
          <DialogContent>
            {selectedList && (
              <div>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginBottom: 16 }}
                >
                  {selectedList.contactCount} contacts
                  {selectedList.description &&
                    ` \u2014 ${selectedList.description}`}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Contact details are available when using this list in a
                  campaign.
                </Typography>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseView}>Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  render() {
    const { activeTab, snackbarMessage } = this.state;
    const organizationId = this.props.params.organizationId;

    return (
      <div>
        <Tabs
          value={activeTab}
          onChange={this.handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          style={{ marginBottom: 16 }}
        >
          <Tab label="Contact Explorer" />
          <Tab label="Contact Lists" />
        </Tabs>

        {activeTab === 0 && (
          <ContactExplorer organizationId={organizationId} />
        )}

        {activeTab === 1 && this.renderContactListsTab()}

        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={4000}
          onClose={() => this.setState({ snackbarMessage: "" })}
          message={snackbarMessage}
        />
      </div>
    );
  }
}

AdminContactLists.propTypes = {
  data: PropTypes.object,
  params: PropTypes.object,
  mutations: PropTypes.object
};

const queries = {
  data: {
    query: gql`
      query getContactLists(
        $organizationId: String!
        $cursor: OffsetLimitCursor
      ) {
        contactLists(organizationId: $organizationId, cursor: $cursor) {
          contactLists {
            id
            organizationId
            name
            description
            fileName
            contactCount
            customFields
            createdAt
          }
          pageInfo {
            offset
            limit
            total
          }
        }
      }
    `,
    options: ownProps => ({
      variables: {
        organizationId: ownProps.params.organizationId
      },
      fetchPolicy: "network-only"
    })
  }
};

const mutations = {
  createContactList: ownProps => (
    organizationId,
    name,
    description,
    fileName,
    contacts
  ) => ({
    mutation: gql`
      mutation createContactList(
        $organizationId: String!
        $name: String!
        $description: String
        $fileName: String
        $contacts: String!
      ) {
        createContactList(
          organizationId: $organizationId
          name: $name
          description: $description
          fileName: $fileName
          contacts: $contacts
        ) {
          id
          name
          contactCount
        }
      }
    `,
    variables: {
      organizationId,
      name,
      description,
      fileName,
      contacts
    }
  }),
  deleteContactList: ownProps => (organizationId, contactListId) => ({
    mutation: gql`
      mutation deleteContactList(
        $organizationId: String!
        $contactListId: String!
      ) {
        deleteContactList(
          organizationId: $organizationId
          contactListId: $contactListId
        )
      }
    `,
    variables: {
      organizationId,
      contactListId
    }
  })
};

export default loadData({ queries, mutations })(
  withRouter(AdminContactLists)
);
