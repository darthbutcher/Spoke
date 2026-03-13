import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, css } from "aphrodite";
import momenttz from "moment-timezone";
import Toolbar from "@material-ui/core/Toolbar";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FaceIcon from "@material-ui/icons/Face";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { getLocalTime, getContactTimezone } from "../../lib/timezones";
import { getProcessEnvDstReferenceTimezone } from "../../lib/tz-helpers";

const styles = StyleSheet.create({
  grow: {
    flexGrow: 1
  },
  contactName: {
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "24px",
    paddingRight: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  contactMeta: {
    fontSize: "12px",
    opacity: 0.7,
    lineHeight: "16px",
    paddingTop: "2px",
    paddingRight: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "95%"
  },
  iconButton: {
    padding: "6px",
    height: "44px",
    width: "44px",
    "@media(max-width: 350px)": {
      width: "40px"
    }
  },
  titleArea: {
    maxWidth: "calc(100% - 100px)"
  },
  contactArea: {
    maxWidth: "calc(100% - 200px)"
  },
  navigation: {
    flexGrow: 0,
    flexShrink: 0,
    display: "flex"
  },
  navigationTitle: {
    width: "4em",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 500
  },
  detailsPanel: {
    padding: "8px 16px 12px",
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 16px",
    fontSize: "13px"
  },
  detailLabel: {
    opacity: 0.6
  }
});

const ContactToolbar = function ContactToolbar(props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { campaignContact, navigationToolbarChildren } = props;

  const { location } = campaignContact;

  let city = "";
  let state = "";
  let timezone = null;
  let offset;
  let hasDST;

  if (location) {
    city = location.city;
    state = location.state;
    timezone = location.timezone;
    if (timezone) {
      offset = timezone.offset || offset;
      hasDST = timezone.hasDST || hasDST;
    }
    const adjustedLocationTZ = getContactTimezone(props.campaign, location);
    if (adjustedLocationTZ && adjustedLocationTZ.timezone) {
      offset = adjustedLocationTZ.timezone.offset;
      hasDST = adjustedLocationTZ.timezone.hasDST;
    }
  }

  let formattedLocation = `${state}`;
  if (city && state) {
    formattedLocation = `${formattedLocation}, `;
  }
  formattedLocation = `${formattedLocation}${city}`;

  const campaignTimezone =
    props.campaign.timezone || getProcessEnvDstReferenceTimezone();
  let formattedLocalTime;
  if (offset === undefined) {
    const zone = momenttz.tz.zone(campaignTimezone);
    offset = zone.parse(Date.now()) / -60;
    hasDST = false;
  }

  formattedLocalTime = getLocalTime(offset, hasDST, campaignTimezone).format(
    "LT"
  );

  let customFields = {};
  try {
    customFields = JSON.parse(campaignContact.customFields || "{}");
  } catch (e) {
    // ignore parse errors
  }
  const hasCustomFields = Object.keys(customFields).length > 0;

  return (
    <div>
      <Toolbar
        style={{
          backgroundColor: "#374151",
          color: "#F3F4F6",
          padding: "0 8px",
          minHeight: "52px"
        }}
      >
        <Tooltip
          title={global.ASSIGNMENT_CONTACTS_SIDEBAR ? "Toggle Contact List" : ""}
        >
          <IconButton
            className={css(styles.iconButton)}
            onClick={() => {
              global.ASSIGNMENT_CONTACTS_SIDEBAR
                ? props.toggleContactList()
                : null;
            }}
          >
            <FaceIcon style={{ width: 28 }} htmlColor="#F3F4F6" />
          </IconButton>
        </Tooltip>
        <div className={css(styles.contactArea)}>
          <div className={css(styles.contactMeta)}>
            {formattedLocalTime} - {formattedLocation}
          </div>
          <div className={css(styles.contactName)}>
            {campaignContact.firstName}{campaignContact.lastName ? ` ${campaignContact.lastName}` : ""}
          </div>
        </div>

        <div className={css(styles.grow)}></div>
        {hasCustomFields && (
          <Tooltip title={detailsOpen ? "Hide Details" : "Show Details"}>
            <IconButton
              className={css(styles.iconButton)}
              onClick={() => setDetailsOpen(!detailsOpen)}
            >
              {detailsOpen ? (
                <ExpandLessIcon htmlColor="#9CA3AF" />
              ) : (
                <ExpandMoreIcon htmlColor="#9CA3AF" />
              )}
            </IconButton>
          </Tooltip>
        )}
        <div className={css(styles.navigation)} style={{ flexBasis: "130px" }}>
          <Tooltip title="Previous Contact">
            <span>
              <IconButton
                onClick={navigationToolbarChildren.onPrevious}
                disabled={!navigationToolbarChildren.onPrevious}
                className={css(styles.iconButton)}
              >
                <ArrowBackIcon htmlColor="#F3F4F6" />
              </IconButton>
            </span>
          </Tooltip>
          <div className={css(styles.navigationTitle)}>
            {navigationToolbarChildren.title}
          </div>
          <Tooltip title="Next Contact">
            <span>
              <IconButton
                onClick={navigationToolbarChildren.onNext}
                disabled={!navigationToolbarChildren.onNext}
                className={css(styles.iconButton)}
              >
                <ArrowForwardIcon htmlColor="#F3F4F6" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </Toolbar>
      {hasCustomFields && (
        <Collapse in={detailsOpen}>
          <div
            className={css(styles.detailsPanel)}
            style={{
              backgroundColor: "#4B5563",
              color: "#F3F4F6"
            }}
          >
            {Object.entries(customFields).map(([key, value]) =>
              value ? (
                <span key={key}>
                  <span className={css(styles.detailLabel)}>{key}:</span> {value}
                </span>
              ) : null
            )}
          </div>
        </Collapse>
      )}
    </div>
  );
};

ContactToolbar.propTypes = {
  campaignContact: PropTypes.object,
  campaign: PropTypes.object,
  navigationToolbarChildren: PropTypes.object,
  toggleContactList: PropTypes.func
};

export default ContactToolbar;
