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
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";

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
          customBodyRender: (value, tableMeta, updateValue) => {
            const orgId = tableMeta.rowData[0];
            return (
              <div style={{ margin: "6px 0" }}>
                <Link
                  component={RouterLink}
                  target="_blank"
                  to={`/admin/${orgId}/campaigns`}
                >
                  {value}
                </Link>
              </div>
            );
          }
        },
        render: (columnKey, organizations) => {
          return (
            <div style={{ margin: "6px 0" }}>
              <Link
                component={RouterLink}
                target="_blank"
                to={`/admin/${organizations.id}/campaigns`}
              >
                {columnKey}
              </Link>
            </div>
          );
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
        key: "actions",
        name: "actions",
        label: "Actions",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta) => {
            const orgId = tableMeta.rowData[0];
            return (
              <IconButton
                onClick={() => this.handleDeleteOrg(orgId)}
                size="small"
                title="Delete organization"
              >
                <DeleteIcon color="error" />
              </IconButton>
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
