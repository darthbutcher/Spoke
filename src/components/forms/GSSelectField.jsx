import React from "react";

import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import theme from "../../styles/mui-theme";

import GSFormField from "./GSFormField";

export default class GSSelectField extends GSFormField {
  createMenuItems() {
    return this.props.choices.map(({ value, label }) => (
      <MenuItem value={value} key={value}>
        {label}
      </MenuItem>
    ));
  }

  render() {
    const { name, label, onChange, style, disabled } = this.props;
    let { value } = this.props;
    const dataTest = { "data-test": this.props["data-test"] };

    // can't be undefined or react throw uncontroled component error
    if (!value) {
      value = "";
    }

    return (
      <FormControl style={style}>
        <InputLabel>{label}</InputLabel>
        <Select
          fullWidth
          {...dataTest}
          name={name}
          value={value}
          disabled={disabled}
          onChange={event => {
            onChange(event.target.value);
          }}
          style={{
            marginBottom: theme.spacing(2)
          }}
        >
          {this.createMenuItems()}
        </Select>
      </FormControl>
    );
  }
}
