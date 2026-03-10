import PropTypes from "prop-types";
import React from "react";
import Chart from "../components/Chart";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Collapse from "@mui/material/Collapse";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";

import withMuiTheme from "../containers/hoc/withMuiTheme";
import theme from "../styles/theme";


export class CollapsibleCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: !props.startCollapsed
    };
  }

  render() {
    const { children, title, colorTheme, muiTheme } = this.props;
    const { open } = this.state;
    const cardHeaderStyle = {};

    if (colorTheme === "warning") {
      cardHeaderStyle.backgroundColor = muiTheme.palette.warning.light;
      cardHeaderStyle.color = muiTheme.palette.warning.contrastText;
    } else {
      cardHeaderStyle.backgroundColor = muiTheme.palette.primary.main;
      cardHeaderStyle.color = muiTheme.palette.primary.contrastText;
    }

    return (
      <Card>
        <CardHeader
          title={title} 
          style={cardHeaderStyle}
          action={(
            <IconButton size="large">
              <ExpandMoreIcon />
            </IconButton>
          )}
          onClick={newExpandedState => {
            this.setState({ open: !open });
          }}
        />
        <Collapse
          in={open}
          unmountOnExit
          style={{
            margin: "20px"
          }}
        >
          {children}
        </Collapse>
      </Card>
    );
  }
}

CollapsibleCard.propTypes = {
  title: PropTypes.string,
  startCollapsed: PropTypes.bool,
  colorTheme: PropTypes.string
};

const ThemedCollapsibleCard = withMuiTheme(CollapsibleCard);

export default ThemedCollapsibleCard;
