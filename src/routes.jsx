import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useParams,
  useLocation
} from "react-router-dom";

import App from "./components/App";
import AdminDashboard from "./components/AdminDashboard";
import AdminCampaignList from "./containers/AdminCampaignList";
import AdminCampaignStats from "./containers/AdminCampaignStats";
import AdminPersonList from "./containers/AdminPersonList";
import AdminIncomingMessageList from "./containers/AdminIncomingMessageList";
import AdminCampaignEdit from "./containers/AdminCampaignEdit";
import AdminReplySender from "./containers/AdminReplySender";
import AdminCampaignMessagingService from "./containers/AdminCampaignMessagingService";
import AdminBulkScriptEditor from "./containers/AdminBulkScriptEditor";
import TexterDashboard from "./components/TexterDashboard";
import OrganizationWrapper from "./components/OrganizationWrapper";
import TopNav from "./components/TopNav";
import DashboardLoader from "./containers/DashboardLoader";
import TexterTodoList from "./containers/TexterTodoList";
import TexterTodo from "./containers/TexterTodo";
import Login from "./components/Login";
import Terms from "./containers/Terms";
import Downtime from "./components/Downtime";
import CreateOrganization from "./containers/CreateOrganization";
import CreateAdditionalOrganization from "./containers/CreateAdditionalOrganization";
import AdminOrganizationsDashboard from "./containers/AdminOrganizationsDashboard";
import JoinTeam from "./containers/JoinTeam";
import AssignReplies from "./containers/AssignReplies";
import Home from "./containers/Home";
import Settings from "./containers/Settings";
import Tags from "./containers/Tags";
import UserEdit from "./containers/UserEdit";
import TexterFaqs from "./components/TexterFrequentlyAskedQuestions";
import FAQs from "./lib/faqs";
import {
  DemoTexterNeedsMessage,
  DemoTexterNeedsResponse,
  DemoTexter2ndQuestion,
  DemoTexterDynAssign,
  tests
} from "./components/AssignmentTexter/Demo";
import AssignmentSummary from "./components/AssignmentSummary";
import AdminPhoneNumberInventory from "./containers/AdminPhoneNumberInventory";

// ── Guard components ──────────────────────────────────────────────────────────

/** Redirect to /downtime if global.DOWNTIME is set (mirrors v3 checkDowntime). */
function DowntimeGuard() {
  const location = useLocation();
  if (global.DOWNTIME && location.pathname !== "/downtime") {
    return <Navigate to="/downtime" replace />;
  }
  return <Outlet />;
}

/** Redirect to /downtime if global.DOWNTIME_TEXTER is set. */
function TexterDowntimeGuard() {
  const location = useLocation();
  if (global.DOWNTIME_TEXTER && location.pathname !== "/downtime") {
    return <Navigate to="/downtime" replace />;
  }
  return <Outlet />;
}

// ── Texter route wrappers ─────────────────────────────────────────────────────
// These small wrappers pull organizationId from URL params so that TopNav
// and other components receive orgId without needing the v3 route props.

function TexterFaqsRoute() {
  const { organizationId } = useParams();
  return (
    <TexterDashboard
      main={<TexterFaqs faqs={FAQs} />}
      topNav={<TopNav title="Account" orgId={organizationId} />}
    />
  );
}

function TexterAccountRoute() {
  const { organizationId, userId } = useParams();
  return (
    <TexterDashboard
      main={<UserEdit userId={userId} organizationId={organizationId} />}
      topNav={<TopNav title="Account" orgId={organizationId} />}
    />
  );
}

function TexterTodosRoute() {
  const { organizationId } = useParams();
  return (
    <TexterDashboard
      main={<TexterTodoList />}
      topNav={<TopNav title="Spoke Texting" orgId={organizationId} />}
    />
  );
}

function TexterFullScreenRoute({ messageStatus }) {
  return <TexterDashboard fullScreen={<TexterTodo messageStatus={messageStatus} />} />;
}

function TexterReviewRoute() {
  return <TexterDashboard fullScreen={<TexterTodo />} />;
}

// ── Demo wrappers ─────────────────────────────────────────────────────────────

function DemoTodosRoute() {
  return (
    <TexterDashboard
      main={<AssignmentSummary {...tests("todos1")} />}
      topNav={<TopNav title="Spoke Texting Demo" orgId="fake" />}
    />
  );
}

function DemoTodos2Route() {
  return (
    <TexterDashboard
      main={<AssignmentSummary {...tests("todos2")} />}
      topNav={<TopNav title="Spoke Texting Demo2" orgId="fake" />}
    />
  );
}

// ── Route tree ────────────────────────────────────────────────────────────────

export default function makeRoutes() {
  return (
    <Routes>
      <Route element={<DowntimeGuard />}>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="downtime" element={<Downtime />} />
          <Route path="login" element={<Login />} />
          <Route path="organizations" element={<AdminOrganizationsDashboard />} />
          <Route path="terms" element={<Terms />} />
          <Route path="reset/:resetHash" element={<Home />} />
          <Route path="invite/:inviteId" element={<CreateOrganization />} />
          <Route path="addOrganization/:inviteId" element={<CreateAdditionalOrganization />} />
          <Route path=":joinToken/replies/:campaignId" element={<AssignReplies />} />
          <Route path=":organizationUuid/join/:campaignId" element={<JoinTeam />} />
          <Route path=":organizationUuid/join" element={<JoinTeam />} />

          {/* Admin */}
          <Route path="admin" element={<AdminDashboard />}>
            <Route index element={<DashboardLoader path="/admin" />} />
            <Route path=":organizationId" element={<OrganizationWrapper />}>
              <Route index element={<Navigate to="campaigns" replace />} />
              <Route path="campaigns">
                <Route index element={<AdminCampaignList />} />
                <Route path=":campaignId">
                  <Route index element={<AdminCampaignStats />} />
                  <Route path="edit" element={<AdminCampaignEdit />} />
                  <Route path="send-replies" element={<AdminReplySender />} />
                  <Route path="messaging-service" element={<AdminCampaignMessagingService />} />
                </Route>
              </Route>
              <Route path="people" element={<AdminPersonList />} />
              <Route path="incoming" element={<AdminIncomingMessageList />} />
              <Route path="bulk-script-editor" element={<AdminBulkScriptEditor />} />
              <Route path="tags" element={<Tags />} />
              <Route path="settings" element={<Settings />} />
              <Route path="phone-numbers" element={<AdminPhoneNumberInventory />} />
            </Route>
          </Route>

          {/* Texter app */}
          <Route path="app" element={<TexterDowntimeGuard />}>
            <Route
              index
              element={
                <TexterDashboard
                  main={<DashboardLoader path="/app" />}
                  topNav={<TopNav title="Spoke Texting" />}
                />
              }
            />
            <Route path=":organizationId" element={<OrganizationWrapper />}>
              <Route index element={<Navigate to="todos" replace />} />
              <Route path="faqs" element={<TexterFaqsRoute />} />
              <Route path="account/:userId" element={<TexterAccountRoute />} />
              <Route path="todos">
                <Route index element={<TexterTodosRoute />} />
                <Route path="other/:userId" element={<TexterTodosRoute />} />
                <Route path="review/:reviewContactId" element={<TexterReviewRoute />} />
                <Route path=":assignmentId">
                  <Route path="text" element={<TexterFullScreenRoute messageStatus="needsMessage" />} />
                  <Route path="reply" element={<TexterFullScreenRoute messageStatus="needsResponse" />} />
                  <Route path="stale" element={<TexterFullScreenRoute messageStatus="convo" />} />
                  <Route path="skipped" element={<TexterFullScreenRoute messageStatus="closed" />} />
                  <Route path="allreplies" element={<TexterFullScreenRoute messageStatus="allReplies" />} />
                  <Route path="all" element={<TexterFullScreenRoute messageStatus="needsMessageOrResponse" />} />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* Demo */}
          <Route path="demo">
            <Route path="text" element={<TexterDashboard fullScreen={<DemoTexterNeedsMessage />} />} />
            <Route path="reply" element={<TexterDashboard fullScreen={<DemoTexterNeedsResponse />} />} />
            <Route path="reply2" element={<TexterDashboard fullScreen={<DemoTexter2ndQuestion />} />} />
            <Route path="dyn" element={<TexterDashboard fullScreen={<DemoTexterDynAssign />} />} />
            <Route path="todos" element={<DemoTodosRoute />} />
            <Route path="todos2" element={<DemoTodos2Route />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
