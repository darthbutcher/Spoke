import React from "react";
import GSFormField from "./GSFormField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import theme from "../../styles/mui-theme";

export default class GSDateField extends GSFormField {
  state = { open: false };

  render() {
    // Destructure known form-field props; pass value/onChange to DatePicker directly.
    const { value, onChange, name, ...rest } = this.props;
    return (
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DatePicker
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
          onOpen={() => this.setState({ open: true })}
          format="MM/dd/yyyy"
          label={this.floatingLabelText()}
          value={value || null}
          onChange={onChange}
          slotProps={{
            textField: {
              fullWidth: true,
              name,
              onKeyPress: evt => {
                this.setState({ open: true });
                evt.preventDefault();
              },
              style: { marginBottom: theme.spacing(2) }
            }
          }}
        />
      </LocalizationProvider>
    );
  }
}
