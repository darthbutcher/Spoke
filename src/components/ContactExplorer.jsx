import React from "react";
import { gql } from "@apollo/client";
import PropTypes from "prop-types";
import apolloClient from "../network/apollo-client-singleton";

import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import BlockIcon from "@material-ui/icons/Block";
import ErrorIcon from "@material-ui/icons/Error";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

import loadData from "../containers/hoc/load-data";

const STATUS_LABELS = {
  needsMessage: "Needs Message",
  needsResponse: "Needs Response",
  convo: "Active Convo",
  messaged: "Messaged",
  closed: "Closed"
};

const STATUS_COLORS = {
  needsMessage: "#1E88E5",
  needsResponse: "#E53935",
  convo: "#F9A825",
  messaged: "#2E7D52",
  closed: "#9CA3AF"
};

class ContactExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      searchInput: "",
      campaignFilter: [],
      statusFilter: [],
      optOutFilter: "",
      sortBy: "lastMessageAt",
      sortOrder: "desc",
      page: 0,
      pageSize: 25,
      drawerOpen: false,
      selectedContactId: null,
      detailLoading: false,
      detailData: null
    };
    this.searchTimeout = null;
  }

  handleSearchChange = e => {
    const val = e.target.value;
    this.setState({ searchInput: val });
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.setState({ searchText: val, page: 0 }, this.refetchData);
    }, 400);
  };

  handleCampaignFilter = e => {
    this.setState({ campaignFilter: e.target.value, page: 0 }, this.refetchData);
  };

  handleStatusFilter = e => {
    this.setState({ statusFilter: e.target.value, page: 0 }, this.refetchData);
  };

  handleOptOutFilter = e => {
    this.setState({ optOutFilter: e.target.value, page: 0 }, this.refetchData);
  };

  handleSort = column => {
    this.setState(
      prev => ({
        sortBy: column,
        sortOrder:
          prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
        page: 0
      }),
      this.refetchData
    );
  };

  handlePageChange = newPage => {
    this.setState({ page: newPage }, this.refetchData);
  };

  refetchData = () => {
    const {
      searchText,
      campaignFilter,
      statusFilter,
      optOutFilter,
      sortBy,
      sortOrder,
      page,
      pageSize
    } = this.state;

    const filter = {
      sortBy,
      sortOrder
    };
    if (searchText) filter.searchText = searchText;
    if (campaignFilter.length > 0)
      filter.campaignIds = campaignFilter.map(String);
    if (statusFilter.length > 0) filter.messageStatus = statusFilter;
    if (optOutFilter === "true") filter.isOptedOut = true;
    if (optOutFilter === "false") filter.isOptedOut = false;

    this.props.explorerData.refetch({
      organizationId: this.props.organizationId,
      cursor: { offset: page * pageSize, limit: pageSize },
      filter
    });
  };

  handleOpenDetail = async contactId => {
    this.setState({
      drawerOpen: true,
      selectedContactId: contactId,
      detailLoading: true,
      detailData: null
    });

    try {
      const result = await apolloClient.query({
        query: CONTACT_DETAIL_QUERY,
        variables: {
          organizationId: this.props.organizationId,
          campaignContactId: String(contactId)
        },
        fetchPolicy: "network-only"
      });
      this.setState({
        detailData: result.data.contactDetail,
        detailLoading: false
      });
    } catch (err) {
      this.setState({ detailLoading: false });
    }
  };

  handleCloseDrawer = () => {
    this.setState({ drawerOpen: false, selectedContactId: null });
  };

  formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  formatShortDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  }

  renderStatusChip(status) {
    return (
      <Chip
        label={STATUS_LABELS[status] || status}
        size="small"
        style={{
          backgroundColor: STATUS_COLORS[status] || "#9CA3AF",
          color: "#fff",
          fontWeight: 500,
          fontSize: "0.75rem"
        }}
      />
    );
  }

  renderFilters() {
    const { searchInput, campaignFilter, statusFilter, optOutFilter } =
      this.state;
    const campaigns =
      (this.props.campaignData &&
        this.props.campaignData.campaigns &&
        this.props.campaignData.campaigns.campaigns) ||
      [];

    return (
      <Box
        display="flex"
        flexWrap="wrap"
        style={{ gap: 12, marginBottom: 16 }}
        alignItems="center"
      >
        <TextField
          placeholder="Search name, phone, or ID..."
          value={searchInput}
          onChange={this.handleSearchChange}
          variant="outlined"
          size="small"
          style={{ minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            )
          }}
        />
        <FormControl variant="outlined" size="small" style={{ minWidth: 180 }}>
          <InputLabel>Campaign</InputLabel>
          <Select
            multiple
            value={campaignFilter}
            onChange={this.handleCampaignFilter}
            label="Campaign"
            renderValue={selected =>
              selected.length === 1
                ? campaigns.find(c => c.id == selected[0])?.title || "1 selected"
                : `${selected.length} selected`
            }
          >
            {campaigns.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small" style={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={statusFilter}
            onChange={this.handleStatusFilter}
            label="Status"
            renderValue={selected =>
              selected.map(s => STATUS_LABELS[s] || s).join(", ")
            }
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small" style={{ minWidth: 130 }}>
          <InputLabel>Opt-out</InputLabel>
          <Select
            value={optOutFilter}
            onChange={this.handleOptOutFilter}
            label="Opt-out"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="false">Active</MenuItem>
            <MenuItem value="true">Opted Out</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }

  renderTable() {
    const explorerResult =
      this.props.explorerData && this.props.explorerData.contactExplorer;

    if (!explorerResult) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    const { contacts, pageInfo } = explorerResult;
    const { sortBy, sortOrder, page, pageSize } = this.state;

    if (!contacts || contacts.length === 0) {
      return (
        <Box textAlign="center" p={4}>
          <Typography variant="body1" color="textSecondary">
            No contacts found matching your filters.
          </Typography>
        </Box>
      );
    }

    const columns = [
      { id: "name", label: "Contact", sortable: true },
      { id: "cell", label: "Phone", sortable: false },
      { id: "campaign", label: "Campaign", sortable: false },
      { id: "status", label: "Status", sortable: true },
      { id: "messageCount", label: "Messages", sortable: true },
      { id: "lastMessageAt", label: "Last Message", sortable: true },
      { id: "tags", label: "Tags", sortable: false }
    ];

    const totalPages = Math.ceil((pageInfo.total || 0) / pageSize);

    return (
      <div>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.id}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortOrder : "asc"}
                      onClick={() => this.handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map(contact => (
              <TableRow
                key={contact.id}
                hover
                style={{ cursor: "pointer" }}
                onClick={() => this.handleOpenDetail(contact.id)}
              >
                <TableCell>
                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                    {contact.firstName} {contact.lastName}
                  </Typography>
                  {contact.texterFirstName && (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      style={{ display: "block" }}
                    >
                      Texter: {contact.texterFirstName}{" "}
                      {contact.texterLastName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {contact.cell}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{contact.campaignTitle}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" style={{ gap: 4 }}>
                    {this.renderStatusChip(contact.messageStatus)}
                    {contact.isOptedOut && (
                      <BlockIcon
                        fontSize="small"
                        style={{ color: "#E53935" }}
                        titleAccess="Opted out"
                      />
                    )}
                    {contact.errorCode && (
                      <ErrorIcon
                        fontSize="small"
                        style={{ color: "#F9A825" }}
                        titleAccess={`Error: ${contact.errorCode}`}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {contact.messagesSent + contact.messagesReceived}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {contact.messagesSent} sent / {contact.messagesReceived}{" "}
                    recv
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {this.formatShortDate(contact.lastMessageAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {(contact.tags || []).map(tag => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                      style={{ marginRight: 4, marginBottom: 2 }}
                    />
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={1}
        >
          <Typography variant="body2" color="textSecondary">
            {pageInfo.total.toLocaleString()} contacts total
          </Typography>
          <Box display="flex" alignItems="center" style={{ gap: 8 }}>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => this.handlePageChange(page - 1)}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="body2">
              Page {page + 1} of {totalPages || 1}
            </Typography>
            <IconButton
              size="small"
              disabled={page + 1 >= totalPages}
              onClick={() => this.handlePageChange(page + 1)}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
      </div>
    );
  }

  renderDetailDrawer() {
    const { drawerOpen, detailLoading, detailData } = this.state;

    return (
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={this.handleCloseDrawer}
        PaperProps={{ style: { width: 480, maxWidth: "90vw" } }}
      >
        <Box p={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Contact Detail</Typography>
            <IconButton onClick={this.handleCloseDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {detailLoading && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}

          {detailData && this.renderDetailContent(detailData)}
        </Box>
      </Drawer>
    );
  }

  renderDetailContent(d) {
    return (
      <div>
        {/* Contact Info */}
        <Box mb={2}>
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            {d.firstName} {d.lastName}
          </Typography>
          <Typography
            variant="body2"
            style={{ fontFamily: "monospace" }}
            color="textSecondary"
          >
            {d.cell}
          </Typography>
          <Box mt={1} display="flex" style={{ gap: 8 }} flexWrap="wrap">
            {this.renderStatusChip(d.messageStatus)}
            {d.isOptedOut && (
              <Chip
                label={`Opted out${
                  d.optOutDate ? ` ${this.formatShortDate(d.optOutDate)}` : ""
                }`}
                size="small"
                style={{ backgroundColor: "#E53935", color: "#fff" }}
              />
            )}
            {d.errorCode && (
              <Chip
                label={`Error: ${d.errorCode}`}
                size="small"
                style={{ backgroundColor: "#F9A825", color: "#fff" }}
              />
            )}
          </Box>
        </Box>

        <Divider />

        {/* Campaign & Assignment */}
        <Box my={2}>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            gutterBottom
          >
            Campaign
          </Typography>
          <Typography variant="body2">{d.campaignTitle}</Typography>
          {d.texterFirstName && (
            <Typography variant="body2" color="textSecondary">
              Texter: {d.texterFirstName} {d.texterLastName}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Custom Fields */}
        {d.customFields && (
          <Box my={2}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              gutterBottom
            >
              Custom Fields
            </Typography>
            {(() => {
              try {
                const fields =
                  typeof d.customFields === "string"
                    ? JSON.parse(d.customFields)
                    : d.customFields;
                const entries = Object.entries(fields).filter(
                  ([, v]) => v !== "" && v !== null && v !== undefined
                );
                if (entries.length === 0) {
                  return (
                    <Typography variant="body2" color="textSecondary">
                      None
                    </Typography>
                  );
                }
                return entries.map(([key, val]) => (
                  <Box
                    key={key}
                    display="flex"
                    justifyContent="space-between"
                    mb={0.5}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {key}
                    </Typography>
                    <Typography variant="body2">{String(val)}</Typography>
                  </Box>
                ));
              } catch {
                return null;
              }
            })()}
          </Box>
        )}

        <Divider />

        {/* Tags */}
        <Box my={2}>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            gutterBottom
          >
            Tags
          </Typography>
          {d.tags && d.tags.length > 0 ? (
            <Box display="flex" flexWrap="wrap" style={{ gap: 4 }}>
              {d.tags.map((tag, i) => (
                <Chip
                  key={i}
                  label={tag.name || tag.value || tag.id}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No tags
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Survey Responses */}
        {d.questionResponseValues && d.questionResponseValues.length > 0 && (
          <Box my={2}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              gutterBottom
            >
              Survey Responses
            </Typography>
            {d.questionResponseValues.map((qr, i) => (
              <Box key={i} mb={0.5}>
                <Typography variant="body2" style={{ fontWeight: 500 }}>
                  {qr.value}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {qr.interactionStepId}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {d.questionResponseValues && d.questionResponseValues.length > 0 && (
          <Divider />
        )}

        {/* Conversation History */}
        <Box my={2}>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            gutterBottom
          >
            Conversation ({(d.messages || []).length} messages)
          </Typography>
          <List dense disablePadding>
            {(d.messages || []).map(msg => (
              <ListItem
                key={msg.id}
                style={{
                  flexDirection: "column",
                  alignItems: msg.isFromContact ? "flex-start" : "flex-end",
                  paddingLeft: 0,
                  paddingRight: 0
                }}
              >
                <Box
                  style={{
                    backgroundColor: msg.isFromContact
                      ? "#F3F4F6"
                      : "#2E7D52",
                    color: msg.isFromContact ? "#1A1A2E" : "#fff",
                    borderRadius: msg.isFromContact
                      ? "18px 18px 18px 4px"
                      : "18px 18px 4px 18px",
                    padding: "8px 14px",
                    maxWidth: "85%"
                  }}
                >
                  <Typography variant="body2" style={{ fontSize: "0.85rem" }}>
                    {msg.text}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  style={{ fontSize: "0.7rem", marginTop: 2 }}
                >
                  {this.formatDate(msg.createdAt)}
                </Typography>
              </ListItem>
            ))}
            {(!d.messages || d.messages.length === 0) && (
              <Typography variant="body2" color="textSecondary">
                No messages yet
              </Typography>
            )}
          </List>
        </Box>

        {/* Campaign History */}
        {d.campaignHistory && d.campaignHistory.length > 1 && (
          <>
            <Divider />
            <Box my={2}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Campaign History ({d.campaignHistory.length} campaigns)
              </Typography>
              {d.campaignHistory.map((ch, i) => (
                <Box
                  key={i}
                  mb={1}
                  p={1}
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8
                  }}
                >
                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                    {ch.campaignTitle}
                  </Typography>
                  <Box display="flex" style={{ gap: 8 }} flexWrap="wrap">
                    {this.renderStatusChip(ch.messageStatus)}
                    <Typography variant="caption" color="textSecondary">
                      {ch.messagesSent} sent / {ch.messagesReceived} recv
                    </Typography>
                    {ch.lastMessageAt && (
                      <Typography variant="caption" color="textSecondary">
                        Last: {this.formatShortDate(ch.lastMessageAt)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderFilters()}
        {this.renderTable()}
        {this.renderDetailDrawer()}
      </div>
    );
  }
}

ContactExplorer.propTypes = {
  organizationId: PropTypes.string.isRequired,
  explorerData: PropTypes.object,
  campaignData: PropTypes.object
};

const CONTACT_DETAIL_QUERY = gql`
  query contactDetail(
    $organizationId: String!
    $campaignContactId: String!
  ) {
    contactDetail(
      organizationId: $organizationId
      campaignContactId: $campaignContactId
    ) {
      id
      firstName
      lastName
      cell
      zip
      externalId
      customFields
      messageStatus
      isOptedOut
      errorCode
      campaignId
      campaignTitle
      texterFirstName
      texterLastName
      optOutDate
      messages {
        id
        text
        isFromContact
        createdAt
      }
      tags {
        id
        name
        campaignContactId
        value
      }
      questionResponseValues {
        value
        interactionStepId
      }
      campaignHistory {
        campaignId
        campaignTitle
        messageStatus
        messagesSent
        messagesReceived
        lastMessageAt
      }
    }
  }
`;

const queries = {
  explorerData: {
    query: gql`
      query contactExplorer(
        $organizationId: String!
        $cursor: OffsetLimitCursor
        $filter: ContactExplorerFilter
      ) {
        contactExplorer(
          organizationId: $organizationId
          cursor: $cursor
          filter: $filter
        ) {
          contacts {
            id
            firstName
            lastName
            cell
            externalId
            messageStatus
            isOptedOut
            errorCode
            campaignId
            campaignTitle
            assignmentId
            texterFirstName
            texterLastName
            messagesSent
            messagesReceived
            lastMessageAt
            updatedAt
            tags {
              id
              name
              value
            }
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
        organizationId: ownProps.organizationId,
        cursor: { offset: 0, limit: 25 }
      },
      fetchPolicy: "network-only"
    })
  },
  campaignData: {
    query: gql`
      query getCampaignsForFilter($organizationId: String!) {
        campaigns(
          organizationId: $organizationId
          campaignsFilter: { isArchived: false }
        ) {
          ... on PaginatedCampaigns {
            campaigns {
              id
              title
            }
          }
          ... on CampaignsList {
            campaigns {
              id
              title
            }
          }
        }
      }
    `,
    options: ownProps => ({
      variables: {
        organizationId: ownProps.organizationId
      }
    })
  }
};

export default loadData({ queries })(ContactExplorer);
