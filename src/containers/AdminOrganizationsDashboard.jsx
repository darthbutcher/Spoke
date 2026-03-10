import PropTypes from "prop-types";
import React from "react";
import TopNav from "../components/TopNav";
import { gql } from "@apollo/client";
import loadData from "./hoc/load-data";
import { withRouter, Link as RouterLink } from "react-router";

import MUIDataTable from "mui-datatables";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import ArchiveIcon from "@material-ui/icons/Archive";
import UnarchiveIcon from "@material-ui/icons/Unarchive";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Link from "@material-ui/core/Link";
import Chip from "@material-ui/core/Chip";

import { StyleSheet, css } from "aphrodite";
import theme from "../styles/theme";

const styles = StyleSheet.create({
  loginPage: {
    display: "flex",
    "justify-content": "center",
    "align-items": "flex-start",
    height: "100vh",
    width: "100%",
    "padding-top": "10vh"
  },
  fullWidth: {
    width: "100%"
  }
});

class AdminOrganizationsDashboard extends React.Component {
  componentDidMount = () => {
    const {
      location: {
        query: { nextUrl }
      }
    } = this.props;
  };

  handleToggleArchive = async orgId => {
    const orgData = this.props.data.organizations.find(
      o => o.id.toString() === orgId.toString()
    );
    if (!orgData) return;
    const action = orgData.is_archived ? "unarchive" : "archive";
    if (
      !window.confirm(
        `Are you sure you want to ${action} organization "${orgData.name}"?`
      )
    ) {
      return;
    }
    try {
      const mutation = orgData.is_archived
        ? this.props.mutations.unarchiveOrganization
        : this.props.mutations.archiveOrganization;
      const result = await mutation(orgId);
      if (result.errors) {
        alert(`Error: ${result.errors[0].message}`);
      } else {
        this.props.data.refetch();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  handleDeleteOrg = async orgId => {
    const orgData = this.props.data.organizations.find(
      o => o.id.toString() === orgId.toString()
    );
    const orgName = orgData ? orgData.name : `ID ${orgId}`;
    if (
      !window.confirm(
        `Are you sure you want to delete organization "${orgName}" and ALL of its data? This cannot be undone.`
      )
    ) {
      return;
    }
    if (
      !window.confirm(
        `FINAL WARNING: This will permanently delete all campaigns, contacts, messages, and assignments for "${orgName}". Type OK to confirm.`
      )
    ) {
      return;
    }
    try {
      const result = await this.props.mutations.deleteOrganization(orgId);
      if (result.errors) {
        alert("Error deleting organization: " + result.errors[0].message);
      } else {
        this.props.data.refetch();
      }
    } catch (err) {
      alert("Error deleting organization: " + err.message);
    }
  };

  handleCreateOrgClick = async e => {
    e.preventDefault();
    const newInvite = await this.props.mutations.createInvite({
      is_valid: true
    });
    if (newInvite.errors) {
      alert("There was an error creating your invite");
      throw new Error(newInvite.errors);
    } else {
      this.props.router.push(
        `/addOrganization/${newInvite.data.createInvite.hash}`
      );
    }
  };

  sortFunc(key) {
    const sorts = {
      id: (a, b) => b.id - a.id,
      name: (a, b) => (b.name > a.name ? 1 : -1),
      campaignsCount: (a, b) => b.id - a.id,
      numTextsInLastDay: (a, b) => b.id - a.id
    };
    return sorts[key];
  }

  renderActionButton() {
    return (
      <Fab
        color="primary"
        style={theme.components.floatingButton}
        onClick={this.handleCreateOrgClick}
      >
        <AddIcon />
      </Fab>
    );
  }

  render() {
    // Note: when adding new columns, make sure to update the sortFunc to include that column
    var columns = [
      {
        key: "id",
        name: "id",
        label: "id",
        sortable: true
      },
      {
        key: "name",
        name: "name",
        label: "Name",
        sortable: true,
        options: {
          customBodyRender: (value, tableMeta) => {
            const orgId = tableMeta.rowData[0];
            const isArchived = tableMeta.rowData[3];
            return (
              <div style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <Link
                  component={RouterLink}
                  target="_blank"
                  to={`/admin/${orgId}/campaigns`}
                >
                  {value}
                </Link>
                {isArchived && (
                  <Chip label="Archived" size="small" color="default" />
                )}
              </div>
            );
          }
        }
      },
      // note that 'active' is defined as 'not archived'.
      // campaigns that have not yet started are included here.
      // is this what we want?
      {
        key: "campaignsCount",
        name: "campaignsCount",
        label: "Number of Active Campaigns",
        sortable: true,
        style: {
          width: "5em"
        }
      },
      {
        key: "is_archived",
        name: "is_archived",
        label: "Archived",
        options: {
          display: "excluded"
        }
      },
      {
        key: "actions",
        name: "actions",
        label: "Actions",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta) => {
            const orgId = tableMeta.rowData[0];
            const isArchived = tableMeta.rowData[3];
            return (
              <div style={{ display: "flex", gap: 4 }}>
                <Tooltip title={isArchived ? "Unarchive organization" : "Archive organization"}>
                  <IconButton
                    onClick={() => this.handleToggleArchive(orgId)}
                    size="small"
                  >
                    {isArchived ? <UnarchiveIcon color="primary" /> : <ArchiveIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete organization">
                  <IconButton
                    onClick={() => this.handleDeleteOrg(orgId)}
                    size="small"
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </div>
            );
          }
        }
      }
    ];

    const options = {
      filterType: "checkbox",
      selectableRows: "none",
      elevation: 0,
      download: false,
      print: false,
      searchable: false,
      filter: false,
      sort: true,
      search: false,
      viewColumns: false,
      responsive: "standard"
    };

    if (!this.props.userData.currentUser.is_superadmin) {
      return (
        <div>You do not have access to the Manage Organizations page.</div>
      );
    }

    return (
      <div>
        <TopNav title={"Manage Organizations"} />
        <div className={css(styles.loginPage)}>
          <MUIDataTable
            className={css(styles.fullWidth)}
            data={this.props.data.organizations}
            columns={columns}
            options={options}
          />
        </div>
        {this.renderActionButton()}
      </div>
    );
  }
}

const mutations = {
  createInvite: ownProps => invite => ({
    mutation: gql`
      mutation createInvite($invite: InviteInput!) {
        createInvite(invite: $invite) {
          hash
        }
      }
    `,
    variables: { invite }
  }),
  deleteOrganization: ownProps => organizationId => ({
    mutation: gql`
      mutation deleteOrganization($organizationId: String!) {
        deleteOrganization(organizationId: $organizationId)
      }
    `,
    variables: { organizationId }
  }),
  archiveOrganization: ownProps => organizationId => ({
    mutation: gql`
      mutation archiveOrganization($organizationId: String!) {
        archiveOrganization(organizationId: $organizationId) {
          id
          is_archived
        }
      }
    `,
    variables: { organizationId }
  }),
  unarchiveOrganization: ownProps => organizationId => ({
    mutation: gql`
      mutation unarchiveOrganization($organizationId: String!) {
        unarchiveOrganization(organizationId: $organizationId) {
          id
          is_archived
        }
      }
    `,
    variables: { organizationId }
  })
};

AdminOrganizationsDashboard.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  router: PropTypes.object,
  mutations: PropTypes.object,
  userData: PropTypes.object
};

const queries = {
  data: {
    query: gql`
      query getOrganizations {
        organizations {
          id
          name
          campaignsCount
          is_archived
          theme
        }
      }
    `,
    options: ownProps => ({
      fetchPolicy: "network-only"
    })
  },
  userData: {
    query: gql`
      query getCurrentUser {
        currentUser {
          id
          is_superadmin
        }
      }
    `,
    options: () => ({
      fetchPolicy: "network-only"
    })
  }
};

export default loadData({ queries, mutations })(
  withRouter(AdminOrganizationsDashboard)
);
