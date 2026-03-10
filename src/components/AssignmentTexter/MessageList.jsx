import PropTypes from "prop-types";
import React from "react";
import { Link as RouterLink } from "react-router";
import moment from "moment";

import HeadsetIcon from "@mui/icons-material/Headset";
import ImageIcon from "@mui/icons-material/Image";
import TvIcon from "@mui/icons-material/Tv";
import AttachmentIcon from "@mui/icons-material/Attachment";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import withMuiTheme from "../../containers/hoc/withMuiTheme";

const defaultStyles = {
  optOut: {
    fontSize: "13px",
    fontStyle: "italic"
  },
  sent: {
    fontSize: "13px",
    textAlign: "right",
    marginLeft: "24px"
  },
  received: {
    fontSize: "13px",
    marginRight: "24px"
  },
  mediaItem: {
    marginTop: "5px",
    backgroundColor: "rgba(255,255,255,.5)"
  }
};

function SecondaryText(props) {
  const { message, review, currentUser, organizationId } = props;

  // Add link to account info page for sender if currentUser is an admin in
  // "review mode" (as indicated by URL param)
  if (
    review === "1" &&
    currentUser.roles.includes("ADMIN") &&
    !message.isFromContact
  ) {
    return (
      <span style={{ fontSize: "90%", display: "block", paddingTop: "5px" }}>
        Sent {moment.utc(message.createdAt).fromNow()} by{" "}
        <RouterLink
          target="_blank"
          to={`/app/${organizationId}/account/${message.userId}`}
        >
          User {message.userId}
        </RouterLink>
      </span>
    );
  }

  return (
    <span style={{ fontSize: "90%", display: "block", paddingTop: "5px" }}>
      {moment.utc(message.createdAt).fromNow()}
    </span>
  );
}

export class MessageList extends React.Component {
  state = {
    expanded: false
  };

  optOutItem = optOut =>
    !optOut ? null : (
      <div>
        <Divider />
        <ListItem style={defaultStyles.optOut} key={"optout-item"}>
          <ListItemIcon>
            <NotInterestedIcon color="error" />
          </ListItemIcon>
          <ListItemText
            primary={`${this.props.contact.firstName} opted out of texts`}
            secondary={moment(optOut.createdAt).fromNow()}
          />
        </ListItem>
      </div>
    );

  renderMsg(message) {
    const { hideMedia } = this.props;
    return (
      <div key={message.id || message.text}>
        <div>{message.text}</div>
        {!hideMedia &&
          message.media &&
          message.media.map(media => {
            let type, icon, embed, subtitle;
            if (media.type.startsWith("image")) {
              type = "Image";
              icon = <ImageIcon />;
              embed = <img src={media.url} alt="Media" />;
            } else if (media.type.startsWith("video")) {
              type = "Video";
              icon = <TvIcon />;
              embed = (
                <video controls>
                  <source src={media.url} type={media.type} />
                  Your browser can&rsquo;t play this file
                </video>
              );
            } else if (media.type.startsWith("audio")) {
              type = "Audio";
              icon = <HeadsetIcon />;
              embed = (
                <audio controls>
                  <source src={media.url} type={media.type} />
                  Your browser can&rsquo;t play this file
                </audio>
              );
            } else {
              type = "Unsupprted media";
              icon = <AttachmentIcon />;
              subtitle = `Type: ${media.type}`;
            }
            return (
              <Card style={defaultStyles.mediaItem} key={`media${media.url}`}>
                <CardHeader
                  title={`${type} attached`}
                  subtitle={subtitle || "View media at your own risk"}
                  avatar={<Avatar>{icon}</Avatar>}
                  onClick={() => {
                    this.setState({ expanded: !this.state.expanded });
                  }}
                />
                <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                  {embed && <CardMedia>{embed}</CardMedia>}
                </Collapse>
              </Card>
            );
          })}
      </div>
    );
  }

  render() {
    const {
      contact,
      styles,
      review,
      currentUser,
      organizationId,
      muiTheme
    } = this.props;
    let received = defaultStyles.received;
    let sent = defaultStyles.sent;
    if (styles) {
      received = Object.assign({}, styles.messageReceived, {
        color: muiTheme.palette.common.white,
        backgroundColor: muiTheme.palette.info.main
      });
      sent = Object.assign({}, styles.messageSent, {
        color: muiTheme.palette.text.primary,
        backgroundColor: muiTheme.palette.background.default
      });
    }

    const listStyle = (styles && styles.messageList) || {};
    const { optOut, messages } = contact;

    return (
      <List style={listStyle}>
        {messages.map(message => (
          <ListItem
            style={message.isFromContact ? received : sent}
            key={message.id}
            primary={this.renderMsg(message)}
            secondary={
              <SecondaryText
                message={message}
                review={review}
                currentUser={currentUser}
                organizationId={organizationId}
              />
            }
          >
            <ListItemText
              primary={this.renderMsg(message)}
              secondary={
                <SecondaryText
                  message={message}
                  review={review}
                  currentUser={currentUser}
                  organizationId={organizationId}
                />
              }
            />
          </ListItem>
        ))}
        {this.optOutItem(optOut)}
      </List>
    );
  }
}

MessageList.propTypes = {
  contact: PropTypes.object,
  currentUser: PropTypes.object,
  organizationId: PropTypes.string,
  review: PropTypes.string,
  styles: PropTypes.object,
  hideMedia: PropTypes.bool
};

export default withMuiTheme(MessageList);
