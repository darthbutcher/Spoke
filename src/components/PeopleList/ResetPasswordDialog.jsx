import React from "react";
import PropTypes from "prop-types";

import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import PasswordResetLink from "../../components/PasswordResetLink";
import Button from "@mui/material/Button";
import { dataTest } from "../../lib/attributes";

const ResetPasswordDialog = props => (
  <Dialog open={props.open} onClose={props.requestClose}>
    <DialogTitle>Reset user password</DialogTitle>

    <DialogContent>
      {props.isAuth0 ? (
        <div>The user has been sent an Auth0 password reset link!</div>
      ) : (
        <PasswordResetLink passwordResetHash={props.passwordResetHash} />
      )}
    </DialogContent>
    <DialogActions>
      <Button
        {...dataTest("passResetOK")}
        color="primary"
        onClick={props.requestClose}
      >
        OK
      </Button>
    </DialogActions>
  </Dialog>
);

ResetPasswordDialog.propTypes = {
  open: PropTypes.bool,
  requestClose: PropTypes.func,
  passwordResetHash: PropTypes.string,
  isAuth0: PropTypes.bool
};

export default ResetPasswordDialog;
