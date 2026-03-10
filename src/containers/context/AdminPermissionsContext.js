import React, { createContext, useContext } from "react";

/**
 * Provides { adminPerms, ownerPerms } to all descendants of AdminDashboard.
 *
 * This replaces the v3 hack of mutating the shared `params` object in
 * AdminDashboard.render() — that mutation relied on react-router v3 sharing a
 * single params reference across the entire matched route tree, which v6 does
 * not do.
 */
const AdminPermissionsContext = createContext({
  adminPerms: false,
  ownerPerms: false
});

export default AdminPermissionsContext;

/**
 * HOC for class components that need adminPerms / ownerPerms.
 * Injects props.adminPerms and props.ownerPerms from context.
 */
export function withAdminPerms(Component) {
  function WithAdminPerms(props) {
    const { adminPerms, ownerPerms } = useContext(AdminPermissionsContext);
    return (
      <Component {...props} adminPerms={adminPerms} ownerPerms={ownerPerms} />
    );
  }
  WithAdminPerms.displayName = `WithAdminPerms(${Component.displayName ||
    Component.name ||
    "Component"})`;
  return WithAdminPerms;
}
