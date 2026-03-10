import PropTypes from "prop-types";
import React from "react";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: props.searchString
    };
  }

  handleSearchStringChanged = searchString => {
    const trimmedSearchString = searchString.trim();
    if (!!this.state.searchString && !trimmedSearchString) {
      this.props.onSearchRequested(undefined);
    }
    this.setState({ searchString });
  };

  handleSearchRequested = () => {
    this.props.onSearchRequested(this.state.searchString);
  };

  onCancelSearch = () => {
    this.handleSearchStringChanged("");
    this.props.onSearchRequested("");
  };

  render() {
    return (
      <Paper
        component="form"
        onSubmit={e => {
          e.preventDefault();
          this.handleSearchRequested();
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          px: 1
        }}
        elevation={1}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={this.props.hintText || this.props.placeholder || "Search"}
          value={this.state.searchString || ""}
          onChange={e => this.handleSearchStringChanged(e.target.value)}
          onKeyPress={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              this.handleSearchRequested();
            }
          }}
        />
        {this.state.searchString ? (
          <IconButton size="small" onClick={this.onCancelSearch} aria-label="clear">
            <ClearIcon />
          </IconButton>
        ) : null}
        <IconButton
          size="small"
          onClick={this.handleSearchRequested}
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
      </Paper>
    );
  }
}

Search.propTypes = {
  searchString: PropTypes.string,
  onSearchRequested: PropTypes.func.isRequired,
  hintText: PropTypes.string,
  placeholder: PropTypes.string
};

export default Search;
