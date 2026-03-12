const defaultFont = "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const text = {
  body: {
    fontSize: 15,
    lineHeight: 1.5,
    fontWeight: 400,
    fontFamily: defaultFont
  },
  link_light_bg: {
    fontWeight: 500,
    textDecoration: "none",
    borderBottom: "1px solid",
    cursor: "pointer",
    ":hover": {
      borderBottom: 0
    },
    "a:visited": {
      fontWeight: 500,
      textDecoration: "none"
    },
    fontFamily: defaultFont
  },
  link_dark_bg: {
    fontWeight: 500,
    textDecoration: "none",
    borderBottom: `1px solid`,
    cursor: "pointer",
    ":hover": {
      borderBottom: 0
    },
    "a:visited": {
      fontWeight: 500,
      textDecoration: "none"
    },
    fontFamily: defaultFont
  },
  header: {
    fontSize: "1.5em",
    fontWeight: 600,
    lineHeight: 1.2,
    fontFamily: defaultFont
  },
  secondaryHeader: {
    fontSize: "1.25em",
    fontWeight: 500,
    lineHeight: 1.3,
    fontFamily: defaultFont
  }
};

const layouts = {
  multiColumn: {
    container: {
      display: "flex",
      flexDirection: "row"
    },
    flexColumn: {
      display: "flex",
      flex: 1,
      flexDirection: "column"
    }
  },
  greenBox: {
    marginTop: "5vh",
    maxWidth: "80%",
    paddingBottom: "7vh",
    borderRadius: 12,
    paddingTop: "7vh",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center"
  }
};

const components = {
  floatingButton: {
    margin: 0,
    top: "auto",
    right: 20,
    bottom: 20,
    left: "auto",
    position: "fixed"
  },
  logoDiv: {
    margin: "50 auto",
    overflow: "hidden"
  },
  logoImg: {},
  popup: {}
};

const theme = {
  text,
  layouts,
  components
};

export default theme;
