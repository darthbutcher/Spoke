import PropTypes from "prop-types";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router";
import moment from "moment";

import Empty from "../Empty";
import { SORTS, TIMEZONE_SORT } from "./SortBy";

import MUIDataTable from "mui-datatables";
import WarningIcon from "@material-ui/icons/Warning";
import ArchiveIcon from "@material-ui/icons/Archive";
import UnarchiveIcon from "@material-ui/icons/Unarchive";
import DeleteIcon from "@material-ui/icons/Delete";
import SpeakerNotesIcon from "@material-ui/icons/SpeakerNotes";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Link from "@material-ui/core/Link";

const inlineStyles = {
  campaignInfo: {
    whiteSpace: "nowrap"
  }
};
 
const CampaignTable = ({
  data,
  campaignsToArchive,
  campaignsWithChangingStatus,
  currentSortBy,
  onNextPageClick,
  onPreviousPageClick,
  onRowSizeChange,
  adminPerms,
  selectMultiple,
  organizationId,
  handleChecked,
  archiveCampaign,
  unarchiveCampaign,
  deleteCampaign
 }) => {

  const [campaigns, setCampaigns] = useState(data.organization.campaigns.campaigns.map((campaign) => ({...campaign})));

  const [state, setState] = useState({
    dataTableKey: "initial"
  });

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    step: 1,
    campaign: null,
    deleting: false
  });

  const { limit, offset, total } = data.organization.campaigns.pageInfo;
  const displayPage = Math.floor(offset / limit) + 1;
  let rowSizeList = [10, 20, 50, 100];

  const statusIsChanging = campaign => {
    return campaignsWithChangingStatus.includes(campaign.id);
  };

  const renderArchiveIcon = campaign => {
    if (statusIsChanging(campaign)) {
      return <CircularProgress size={25} />;
    }
    if (campaign.isArchived) {
      if (campaign.isArchivedPermanently) {
        return null;
      }
      return (
        <IconButton
          tooltip="Unarchive"
          onClick={async () => {
            await unarchiveCampaign(campaign.id);
            setCampaigns(campaigns.filter(e => e.id != campaign.id));
          }}
        >
          <UnarchiveIcon />
        </IconButton>
      );
    }
    return (
      <IconButton
        tooltip="Archive"
        onClick={async () => {
          await archiveCampaign(campaign.id);
          setCampaigns(campaigns.filter(e => e.id != campaign.id));
        }}
      >
        <ArchiveIcon />
      </IconButton>
    );
  }

  const handleDeleteClick = campaign => {
    setDeleteConfirm({
      open: true,
      step: 1,
      campaign,
      deleting: false
    });
  };

  const handleDeleteConfirmStep2 = () => {
    setDeleteConfirm(prev => ({ ...prev, step: 2 }));
  };

  const handleDeleteConfirmed = async () => {
    setDeleteConfirm(prev => ({ ...prev, deleting: true }));
    await deleteCampaign(deleteConfirm.campaign.id);
    setCampaigns(campaigns.filter(c => c.id !== deleteConfirm.campaign.id));
    setDeleteConfirm({ open: false, step: 1, campaign: null, deleting: false });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, step: 1, campaign: null, deleting: false });
  };

  const renderDeleteIcon = campaign => {
    if (!campaign.isArchived) {
      return null;
    }
    return (
      <IconButton
        tooltip="Delete Campaign"
        onClick={() => handleDeleteClick(campaign)}
      >
        <DeleteIcon color="error" />
      </IconButton>
    );
  };

  const sortFunc = key => {
    const sorts = {
      id: (a, b) => b.id - a.id,
      title: (a, b) => (b.title > a.title ? 1 : -1),
      unassigned: (a, b) =>
        (b.completionStats.contactsCount - b.completionStats.assignedCount ||
          b.hasUnassignedContacts) -
        (a.completionStats.contactsCount - a.completionStats.assignedCount ||
          a.hasUnassignedContacts),
      messaging: (a, b) =>
        (b.completionStats.contactsCount - b.completionStats.messagedCount ||
          b.isStarted * 2 + b.hasUnsentInitialMessages) -
        (a.completionStats.contactsCount - a.completionStats.messagedCount ||
          a.isStarted * 2 + a.hasUnsentInitialMessages)
    };
    return sorts[key];
  }

  const prepareTableColumns = (organization, campaigns) => {
    const extraRows = [];
    const needsResponseCol = campaigns.some(
      c => c.completionStats.needsResponseCount
    );
    if (needsResponseCol) {
      extraRows.push({
        label: "Needs Response",
        name: "needs_response",
        options: {
          customBodyRender: (value, tableMeta) => {
            const campaign = campaigns.find(c => c.id === tableMeta.rowData[0]);
            return campaign.completionStats.needsResponseCount || "";
          }
        },
        style: {
          width: "5em"
        }
      });
    }
    if (adminPerms) {
      extraRows.push({
        label: "Archive",
        name: "archive",
        options: {
          customBodyRender: (value, tableMeta) => {
            const campaign = campaigns.find(c => c.id === tableMeta.rowData[0]);
            return renderArchiveIcon(campaign);
          },
          sort: false
        },
        style: {
          width: "5em"
        }
      });
      extraRows.push({
        label: "Delete",
        name: "delete",
        options: {
          customBodyRender: (value, tableMeta) => {
            const campaign = campaigns.find(c => c.id === tableMeta.rowData[0]);
            return renderDeleteIcon(campaign);
          },
          sort: false
        },
        style: {
          width: "5em"
        }
      });
    }

    const timezoneColumn = [];
    // only show the timezone column when we're currently sorting by timezone
    if (currentSortBy === TIMEZONE_SORT.value) {
      timezoneColumn.push({
        key: "timezone",
        name: "timezone",
        label: "Timezone",
        sortable: false,
        style: {
          width: "5em"
        }
      });
    }

    return [
      // id, timezone (if current sort), title, user, contactcount, unassigned, unmessaged, due date, archive
      {
        key: "id",
        name: "id",
        label: "id",
        sortable: true,
        style: {
          width: "5em"
        },
        options: {
          customBodyRender: (value, tableMeta) => {
            const campaign = campaigns.find(c => c.id === tableMeta.rowData[0]);
            let org = "";
            if (organizationId != campaign.organization.id) {
              org = ` (${campaign.organization.id})`;
            }
            return `${campaign.id}${org}`;
          }
        }
      },
      ...timezoneColumn,
      {
        key: "title",
        name: "title",
        label: "Campaign",
        sortable: true,
        style: {
          whiteSpace: "normal"
        },
        options: {
          customBodyRender: (value, tableMeta) => {
            const campaign = campaigns.find(c => c.id === tableMeta.rowData[0]);
            const editLink = campaign.isStarted ? "" : "/edit";
            return (
              <div style={{ margin: "6px 0" }}>
                <Link
                  component={RouterLink}
                  to={`/admin/${campaign.organization.id}/campaigns/${campaign.id}${editLink}`}
                >
                  {campaign.title}
                </Link>
                {campaign.creator && (
                  <span style={inlineStyles.campaignInfo}>
                    {" "}
                    &mdash; Created by {campaign.creator.displayName}
                  </span>
                )}
                <div style={inlineStyles.campaignInfo}>
                  {campaign.dueBy && (
                    <span key={`due${campaign.id}`}>
                      Due by: {moment(campaign.dueBy).format("MMM D, YYYY")}
                    </span>
                  )}
                  {(campaign.ingestMethod &&
                    (campaign.ingestMethod.contactsCount ? (
                      <span>
                        {" "}
                        Contacts: {campaign.ingestMethod.contactsCount}
                      </span>
                    ) : (
                      campaign.ingestMethod.success === false && (
                        <span> Contact loading failed</span>
                      )
                    ))) ||
                    ""}
                  {campaign.completionStats.errorCount &&
                    campaign.completionStats.errorCount > 50 && (
                      <span>
                        {" "}
                        Errors: {campaign.completionStats.errorCount}{" "}
                      </span>
                    )}
                </div>
              </div>
            );
          }
        }
      },
      {
        key: "unassigned",
        name: "unassigned",
        label: "Unassigned",
        sortable: true,
        style: {
          width: "7em"
        },
        options: {
          customBodyRender: (value, tableMeta) => {
            const campaign = campaigns.find(c => c.id === tableMeta.rowData[0]);
            return organization.cacheable > 1 &&
              campaign.completionStats.assignedCount !== null ? (
              <RouterLink
                to={`/admin/${campaign.organization.id}/campaigns/${campaign.id}/edit`}
              >
                {campaign.completionStats.contactsCount -
                  campaign.completionStats.assignedCount}
              </RouterLink>
            ) : campaign.hasUnassignedContacts ? (
              <IconButton
                tooltip="Has unassigned contacts"
                href={`/admin/${campaign.organization.id}/campaigns/${campaign.id}/edit`}
              >
                <WarningIcon color="primary" />
              </IconButton>
            ) : null;
          }
        }
      },
      {
        key: "messaging",
        name: "messaging",
        label: organization.cacheable > 1 ? "Unmessaged" : "Messaging",
        sortable: true,
        style: {
          whiteSpace: "normal",
          width: "10em"
        },
        options: {
          customBodyRender: (value, tableMeta) => {
            const campaign = campaigns.find(c => c.id === tableMeta.rowData[0]);
            return organization.cacheable > 1 &&
              campaign.completionStats.messagedCount !== null
              ? campaign.completionStats.contactsCount -
                  campaign.completionStats.messagedCount || ""
              : !campaign.isStarted
              ? "Not started"
              : campaign.hasUnsentInitialMessages
              ? "Unsent initial messages"
              : "";
          }
        }
      },
      ...extraRows
    ];
  }

  const getSelectedRowIndexes = () => {
    const campaignIds = campaigns.map(
      c => c.id
    );
    const indexes = campaignsToArchive.map(campaignId =>
      campaignIds.indexOf(campaignId)
    );
    if (indexes.includes(-1)) {
      // this is a programming error unless we decide it's an experience we want to support
      console.warn(
        "Some campaigns to archive are not visible in the campaign list"
      );
      return indexes.filter(idx => idx === -1);
    }
    return indexes;
  };

  const clearCampaignSelection = () => {
    handleChecked([]);
    // Terrible hack around buggy DataTables: we have to force the component
    // to remount if we want clear the "select all" status
    setState({
      dataTableKey: new Date().getTime()
    });
  };

  const options = {
    filterType: "checkbox",
    selectableRows: "multiple", // selectMultiple ? "multiple" : "none",
    elevation: 0,
    download: false,
    print: false,
    searchable: false,
    filter: false,
    sort: true,
    search: false,
    viewColumns: false,
    page: displayPage - 1,
    count: total,
    rowsPerPage: limit,
    rowsPerPageOptions: rowSizeList,
    serverSide: true,
    rowsSelected: getSelectedRowIndexes(),
    customToolbarSelect: () => null,
    onTableChange: (action, tableState) => {
      switch (action) {
        case "changePage":
          if (tableState.page > displayPage - 1) {
            clearCampaignSelection();
            onNextPageClick();
          } else {
            clearCampaignSelection();
            onPreviousPageClick();
          }
          break;
        case "changeRowsPerPage":
          clearCampaignSelection();
          const _ = undefined;
          onRowSizeChange(_, tableState.rowsPerPage);
          break;
        case "sort":
          clearCampaignSelection();
          campaigns.sort(sortFunc(tableState.sortOrder.name));
          if (tableState.sortOrder.direction === "desc") {
            campaigns.reverse()
          }
          break;
        case "rowSelectionChange":
          const ids = tableState.selectedRows.data.map(({ index }) => {
            return campaigns[index].id;
          });
          handleChecked(ids);
          break;
        case "propsUpdate":
          break;
        default:
          break;
      }
    }
  };

  return campaigns.length === 0 ? (
    <Empty title="No campaigns" icon={<SpeakerNotesIcon />} />
  ) : (
    <div>
      <br />
      <br />
      <MUIDataTable
        data={campaigns}
        columns={prepareTableColumns(
          data.organization,
          campaigns
        )}
        options={options}
      />
      {/* make space for Floating Action Button */}
      <br />
      <br />
      <br />
      <Dialog
        open={deleteConfirm.open}
        onClose={handleDeleteCancel}
      >
        {deleteConfirm.step === 1 ? (
          <React.Fragment>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to permanently delete campaign{" "}
                <strong>
                  {deleteConfirm.campaign && deleteConfirm.campaign.title}
                </strong>
                ? This will remove all associated data including contacts,
                messages, assignments, and survey responses. This action cannot
                be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancel</Button>
              <Button
                onClick={handleDeleteConfirmStep2}
                color="secondary"
              >
                Yes, Delete
              </Button>
            </DialogActions>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <DialogTitle>Confirm Permanent Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                This is your final confirmation. Campaign{" "}
                <strong>
                  {deleteConfirm.campaign && deleteConfirm.campaign.title}
                </strong>{" "}
                and ALL of its data will be permanently deleted. Are you
                absolutely sure?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancel</Button>
              <Button
                onClick={handleDeleteConfirmed}
                color="secondary"
                variant="contained"
                disabled={deleteConfirm.deleting}
              >
                {deleteConfirm.deleting
                  ? "Deleting..."
                  : "Permanently Delete"}
              </Button>
            </DialogActions>
          </React.Fragment>
        )}
      </Dialog>
    </div>
  );
}

CampaignTable.propTypes = {
  adminPerms: PropTypes.bool,
  selectMultiple: PropTypes.bool,
  organizationId: PropTypes.string,
  data: PropTypes.object,
  handleChecked: PropTypes.func,
  archiveCampaign: PropTypes.func,
  unarchiveCampaign: PropTypes.func,
  deleteCampaign: PropTypes.func,
  onNextPageClick: PropTypes.func,
  onPreviousPageClick: PropTypes.func,
  onRowSizeChange: PropTypes.func,
  campaignsToArchive: PropTypes.array,
  campaignsWithChangingStatus: PropTypes.array,
  currentSortBy: PropTypes.oneOf(SORTS.map(s => s.value))
}

export default CampaignTable;
