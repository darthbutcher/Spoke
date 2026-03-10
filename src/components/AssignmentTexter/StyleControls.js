import { StyleSheet } from "aphrodite";

const bgGrey = "rgb(214, 215, 223)";

export const messageListStyles = {
  // passed directly to <MessageList>
  messageList: {
    overflow: "hidden",
    overflow: "-moz-scrollbars-vertical",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    width: "100%"
  },
  messageSent: {
    textAlign: "left",
    alignSelf: "flex-end",
    marginLeft: "20%",
    marginRight: "10px",
    backgroundColor: "white",
    borderRadius: "16px",
    marginBottom: "10px",
    fontSize: "95%",
    width: "fit-content",
    maxWidth: "500px"
  },
  messageReceived: {
    alignSelf: "flex-start",
    marginRight: "20%",
    marginLeft: "10px",
    color: "white",
    backgroundColor: "hsla(206, 99%, 31%, 0.74)",
    borderRadius: "16px",
    fontSize: "110%",
    lineHeight: "120%",
    marginBottom: "10px",
    width: "fit-content",
    maxWidth: "500px"
  }
};

export const inlineStyles = {
  inlineBlock: {
    display: "inline-block"
  },
  exitTexterIconButton: {
    float: "left",
    padding: "3px",
    height: "56px",
    zIndex: 100,
    top: 0,
    left: "-12px"
  },
  flatButtonLabel: {
    textTransform: "none",
    fontWeight: "bold"
  }
};

export const flexStyles = StyleSheet.create({
  // ── Root container ───────────────────────────────────────────────────────
  // Uses position:fixed so the texter fills the full viewport on mobile.
  // `position: absolute` was changed to `fixed` to stay correct even when
  // parent elements have transforms or scroll — common on mobile browsers.
  topContainer: {
    margin: 0,
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    "@media(max-width: 420px)": {
      fontFamily: "Poppins"
    }
  },

  // ── Sidebox (right panel, desktop only) ──────────────────────────────────
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
    fontWeight: "normal",
    fontSize: "80%"
  },
  popoverLinkColor: {
    color: "rgb(81, 82, 89)"
  },
  sectionHeaderToolbar: {
    flex: "0 0 auto"
  },
  sectionSideBox: {
    flex: "0 1 240px",
    overflowY: "auto",
    textAlign: "center",
    overflow: "hidden auto",
    maxWidth: "240px",
    // Hidden on phones; visible on tablet+ (575 px matches existing breakpoint)
    "@media(max-width: 575px)": {
      display: "none"
    }
  },
  sectionSideBoxHeader: {
    height: 56,
    backgroundColor: "rgba(126, 128, 139, .7)"
  },
  sectionSideBoxContent: {
    padding: 24,
    borderLeft: "1px solid #C1C3CC"
  },

  // ── Message thread area ───────────────────────────────────────────────────
  // Replaced hardcoded `height: 53%` at certain viewport heights with
  // `flex: 1 1 0` so the thread fills available space, letting the compose
  // section (below) stay anchored at the bottom regardless of viewport height.
  // `minHeight: 0` is required for flex children to shrink below content size.
  superSectionMessageBox: {
    flex: "1 1 0",
    minHeight: 0,
    overflowY: "auto",
    overflow: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "row"
  },
  sectionMessageThread: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flex: "1 1 auto",
    overflowY: "auto"
  },
  sectionLeftSideBox: {
    flex: "1 0 260px",
    maxWidth: 260,
    overflow: "hidden auto"
  },
  superSectionMessagePage: {
    display: "flex",
    flex: "1 1 0",
    minHeight: 0,
    overflow: "hidden auto"
  },
  superSectionMessageListAndControls: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    maxHeight: "100%"
  },

  // ── Opt-out dialog ────────────────────────────────────────────────────────
  sectionOptOutDialog: {
    padding: "4px 10px 9px 10px",
    zIndex: 2000,
    backgroundColor: "white",
    overflow: "visible",
    "@media (hover: hover) and (pointer: fine)": {
      maxWidth: "554px"
    }
  },
  subSectionOptOutDialogActions: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end"
  },

  // ── Compose area ──────────────────────────────────────────────────────────
  // `flex: 0 0 auto` keeps the compose field from growing/shrinking.
  // The field is always visible at the bottom of the fixed container.
  sectionMessageField: {
    flex: "0 0 auto",
    padding: "0px 16px",
    marginBottom: "8px"
  },
  subSectionMessageFieldTextField: {
    "@media(max-width: 420px)": {
      overflowY: "auto"
    }
  },

  // ── Action buttons ────────────────────────────────────────────────────────
  sectionButtons: {
    flexGrow: "0",
    flexShrink: "0",
    flexDirection: "column",
    display: "flex",
    overflow: "hidden",
    position: "relative",
    paddingLeft: 12
  },
  subButtonsAnswerButtons: {
    flex: "1 1 auto",
    margin: "9px 0px 0px 9px",
    width: "100%"
  },
  subSubButtonsAnswerButtonsCurrentQuestion: {
    marginBottom: "12px",
    width: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden"
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
  // Updated from fixed 40px to minHeight: 44px (WCAG 2.5.5 touch target)
  subButtonsExitButtons: {
    minHeight: "44px",
    margin: "9px",
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    alignContent: "space-between",
    zIndex: "10",
    "@media (hover: hover) and (pointer: fine)": {
      maxWidth: "554px"
    }
  },

  // ── Send button row ───────────────────────────────────────────────────────
  // Replaced hardcoded `height: 72px` with `minHeight: 60px` so the row
  // expands on accessibility text-size increases without clipping.
  sectionSend: {
    flex: "0 0 auto",
    minHeight: "60px",
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    alignContent: "space-between",
    padding: "9px 9px 9px 21px",
    "@media (hover: hover) and (pointer: fine)": {
      maxWidth: "554px"
    }
  },
  subSectionSendButton: {
    flex: "1 1 auto",
    width: "70%",
    height: "100%",
    color: "white"
  },

  // ── Utility / button variants ─────────────────────────────────────────────
  flatButton: {
    height: "40px",
    border: "1px solid #949494",
    borderRadius: "0",
    boxShadow: "none",
    maxWidth: "300px",
    "@media(max-width: 450px)": {
      minWidth: "auto"
    }
  },
  button: {
    backgroundColor: "#FFF",
    maxWidth: "300px",
    "@media(max-width: 450px)": {
      minWidth: "auto"
    }
  },
  flatButtonLabelMobile: {
    "@media(max-width: 327px)": {
      display: "none"
    }
  }
});
