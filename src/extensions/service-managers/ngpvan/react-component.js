/* eslint no-console: 0 */
import PropTypes from "prop-types";
import React from "react";
import Form from "react-formal";
import * as yup from "yup";
import GSForm from "../../../components/forms/GSForm";
import GSTextField from "../../../components/forms/GSTextField";
import GSSelectField from "../../../components/forms/GSSelectField";
import GSSubmitButton from "../../../components/forms/GSSubmitButton";

export class OrgConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const formSchema = yup.object({
      NGP_VAN_API_KEY_ENCRYPTED: yup
        .string()
        .max(64)
        .notRequired()
        .nullable(),
      NGP_VAN_APP_NAME: yup
        .string()
        .max(32)
        .notRequired()
        .nullable(),
      NGP_VAN_DATABASE_MODE: yup
        .number()
        .oneOf([0, 1, null])
        .nullable()
        .transform(val => (isNaN(val) ? null : val)),
      NGP_VAN_WEBHOOK_BASE_URL: yup
        .string()
        .notRequired()
        .nullable(),
      NGP_VAN_CAUTIOUS_CELL_PHONE_SELECTION: yup
        .string()
        .oneOf(["true", "false", "", null])
        .notRequired()
        .nullable(),
      NGP_VAN_ELECTION_CYCLE_FILTER: yup
        .string()
        .notRequired()
        .nullable(),
      NGP_VAN_CONTACT_TYPE: yup
        .string()
        .notRequired()
        .nullable()
    });
    return (
      <div>
        <GSForm
          schema={formSchema}
          defaultValue={this.props.serviceManagerInfo.data}
          onSubmit={x => {
            this.props.onSubmit(x);
          }}
        >
          <Form.Field
            as={GSTextField}
            label="NGPVAN API Key"
            name="NGP_VAN_API_KEY_ENCRYPTED"
            fullWidth
          />
          <Form.Field
            as={GSTextField}
            label="NGPVAN App Name"
            name="NGP_VAN_APP_NAME"
            fullWidth
          />
          <Form.Field
            as={GSSelectField}
            label="NGP VAN Database Mode"
            name="NGP_VAN_DATABASE_MODE"
            choices={[
              { value: "", label: "" },
              { value: "0", label: "My Voters" },
              { value: "1", label: "My Campaign" }
            ]}
            style={{ width: "100%" }}
          />
          <Form.Field
            as={GSTextField}
            label="Webhook Base URL (required for contact loading)"
            name="NGP_VAN_WEBHOOK_BASE_URL"
            fullWidth
          />
          <Form.Field
            as={GSSelectField}
            label="Cautious Cell Phone Selection"
            name="NGP_VAN_CAUTIOUS_CELL_PHONE_SELECTION"
            choices={[
              { value: "", label: "Default (true)" },
              { value: "true", label: "True – only import verified cell phones" },
              { value: "false", label: "False – import all phone types" }
            ]}
            style={{ width: "100%" }}
          />
          <Form.Field
            as={GSTextField}
            label="Election Cycle Filter (e.g. 2024)"
            name="NGP_VAN_ELECTION_CYCLE_FILTER"
            fullWidth
          />
          <Form.Field
            as={GSTextField}
            label="Contact Type (default: SMS Text)"
            name="NGP_VAN_CONTACT_TYPE"
            fullWidth
          />
          <Form.Submit
            as={GSSubmitButton}
            label="Save"
            style={this.props.inlineStyles.dialogButton}
          />
        </GSForm>
      </div>
    );
  }
}

OrgConfig.propTypes = {
  organizationId: PropTypes.string,
  serviceManagerInfo: PropTypes.object,
  inlineStyles: PropTypes.object,
  styles: PropTypes.object,
  saveLabel: PropTypes.string,
  onSubmit: PropTypes.func
};
