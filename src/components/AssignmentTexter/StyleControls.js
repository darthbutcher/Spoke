import { StyleSheet, css } from "aphrodite";

export const messageListStyles = {
  messageList: {
    overflow: "hidden",
    overflow: "-moz-scrollbars-vertical",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    width: "100%"
  },
  messageSent: {
    textAlign: "left",
    alignSelf: "flex-end",
    marginLeft: "20%",
    marginRight: "8px",
    backgroundColor: "#2E7D52",
    color: "#FFFFFF",
    borderRadius: "18px 18px 4px 18px",
    marginBottom: "4px",
    fontSize: "15px",
    lineHeight: "1.4",
    width: "fit-content",
    maxWidth: "500px"
  },
  messageReceived: {
    alignSelf: "flex-start",
    marginRight: "20%",
    marginLeft: "8px",
    color: "#1A1A2E",
    backgroundColor: "#FFFFFF",
    borderRadius: "18px 18px 18px 4px",
    fontSize: "15px",
    lineHeight: "1.4",
    marginBottom: "4px",
    width: "fit-content",
    maxWidth: "500px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
  }
};

export const inlineStyles = {
  inlineBlock: {
    display: "inline-block"
  },
  exitTexterIconButton: {
    float: "left",
    padding: "3px",
    height: "48px",
    zIndex: 100,
    top: 0,
    left: "-12px"
  },
  flatButtonLabel: {
    textTransform: "none",
    fontWeight: 500
  }
};

export const flexStyles = StyleSheet.create({
  topContainer: {
    margin: 0,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  popoverSideboxesInner: {
    width: "100%",
    height: "100%",
    top: "50px",
    left: "18px",
    padding: "20px"
  },
  popover: {
    width: "85%",
    height: "85%",
    "@media(min-height: 800px)": {
      height: "50%"
    }
  },
  popoverLink: {
    float: "right",
    width: "4em",
    marginRight: "2em",
    fontWeight: 400,
    fontSize: "13px"
  },
  popoverLinkColor: {
    color: "#6B7280"
  },
  sectionHeaderToolbar: {
    flex: "0 0 auto"
  },
  sectionSideBox: {
    flex: "0 1 240px",
    overflowY: "scroll",
    textAlign: "center",
    overflow: "hidden scroll",
    maxWidth: "240px",
    "@media(max-width: 575px)": {
      display: "none"
    }
  },
  sectionSideBoxHeader: {
    height: 52,
    backgroundColor: "rgba(107, 114, 128, 0.15)"
  },
  sectionSideBoxContent: {
    padding: 24,
    borderLeft: "1px solid #E5E7EB"
  },
  superSectionMessageBox: {
    height: "100%",
    "@media(min-height: 300px) and (max-height: 700px)": {
      height: "100%"
    },
    "@media(min-height: 701px) and (max-height: 1000px)": {
      height: "53%"
    },
    overflowY: "scroll",
    overflow: "-moz-scrollbars-vertical",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "row"
  },
  sectionMessageThread: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flex: "1 1 auto",
    overflowY: "scroll"
  },
  sectionLeftSideBox: {
    flex: "1 0 260px",
    maxWidth: 260,
    overflow: "hidden scroll"
  },
  superSectionMessagePage: {
    display: "flex",
    flexGrow: 1,
    overflow: "hidden scroll"
  },
  superSectionMessageListAndControls: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxHeight: "100%"
  },
  sectionOptOutDialog: {
    padding: "8px 16px",
    zIndex: 2000,
    backgroundColor: "white",
    overflow: "visible",
    "@media (hover: hover) and (pointer: fine)": {
      maxWidth: "554px"
    }
  },
  subSectionOptOutDialogActions: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: "8px"
  },
  sectionMessageField: {
    flex: "0 0 20px",
    padding: "0px 16px",
    marginBottom: "8px"
  },
  subSectionMessageFieldTextField: {
    "@media(max-width: 420px)": {
      overflowY: "scroll !important"
    }
  },
  sectionButtons: {
    flexGrow: "0",
    flexShrink: "0",
    flexDirection: "column",
    display: "flex",
    overflow: "hidden",
    position: "relative",
    padding: "0 16px"
  },
  subButtonsAnswerButtons: {
    flex: "1 1 auto",
    margin: "4px 0",
    width: "100%"
  },
  subSubButtonsAnswerButtonsCurrentQuestion: {
    marginBottom: "8px",
    width: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    fontSize: "14px",
    color: "#6B7280"
  },
  subSubAnswerButtonsColumns: {
    height: "0px",
    "@media(min-height: 600px)": {
      height: "37px"
    },
    display: "inline-block",
    overflow: "hidden",
    position: "relative"
  },
  subButtonsExitButtons: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "8px",
    padding: "4px 0",
    zIndex: "10",
    "@media (hover: hover) and (pointer: fine)": {
      maxWidth: "554px"
    },
    "@media(max-width: 450px)": {
      gap: "4px"
    }
  },
  sectionSend: {
    flex: `0 0 auto`,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px 12px",
    "@media (hover: hover) and (pointer: fine)": {
      maxWidth: "554px"
    },
    "@media(max-width: 450px)": {
      padding: "8px 12px 12px"
    }
  },
  subSectionSendButton: {
    flex: "1 1 auto",
    height: "44px",
    borderRadius: "22px",
    fontSize: "15px",
    fontWeight: 500,
    color: "white",
    "@media(max-width: 450px)": {
      minHeight: "48px"
    }
  },
  flatButton: {
    height: "36px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    boxShadow: "none",
    maxWidth: "300px",
    fontSize: "13px",
    "@media(max-width: 450px)": {
      minWidth: "auto",
      minHeight: "44px"
    }
  },
  button: {
    backgroundColor: "#FFF",
    maxWidth: "300px",
    borderRadius: "8px",
    "@media(max-width: 450px)": {
      minWidth: "auto",
      minHeight: "44px"
    }
  },
  flatButtonLabelMobile: {
    "@media(max-width: 327px)": {
      display: "none"
    }
  }
});
