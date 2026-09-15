import { useEffect, useState } from "react";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BellRing,
  CheckCircle2,
  ChevronDown,
  FileSearch,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPinned,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./App.css";

type Role =
  | "superAdministrator"
  | "stateAdministrator"
  | "districtOfficer"
  | "departmentOfficer"
  | "projectOfficer"
  | "viewer";

type DemoUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  scopeLabel: string;
  state?: string;
  district?: string;
  department?: string;
  assignedProjectIds?: string[];
};

type Project = {
  id: string;
  name: string;
  state: string;
  district: string;
  department: string;
  stage: string;
  progress: number;
  delayProbability: string;
  risk: "High Risk" | "Medium Risk" | "Low Risk";
  riskTone: "high" | "medium" | "low";
  factor: string;
  action: string;
  type: string;
  manager: string;
  expectedCompletion: string;
  issue: string;
};

const STORAGE_KEY = "lapredict-demo-session";

const ALL_PROJECTS: Project[] = [
  {
    id: "nh-77",
    name: "National Highway 77 Expansion",
    state: "Maharashtra",
    district: "Pune",
    department: "MoRTH",
    stage: "Compensation",
    progress: 72,
    delayProbability: "42%",
    risk: "High Risk",
    riskTone: "high",
    factor: "Compensation delay",
    action: "Review",
    type: "Highway expansion",
    manager: "A. Sharma",
    expectedCompletion: "Q4 2026",
    issue: "Pending compensation documentation is slowing possession steps.",
  },
  {
    id: "metro-arc",
    name: "Metro Corridor Phase II",
    state: "Karnataka",
    district: "Bengaluru",
    department: "Urban Development",
    stage: "Land Survey",
    progress: 61,
    delayProbability: "29%",
    risk: "Medium Risk",
    riskTone: "medium",
    factor: "Survey coordination",
    action: "Monitor",
    type: "Metro corridor",
    manager: "R. Nair",
    expectedCompletion: "Q2 2027",
    issue: "Survey alignment discrepancies need administrative reconciliation.",
  },
  {
    id: "railway-link",
    name: "Railway Freight Link",
    state: "Uttar Pradesh",
    district: "Lucknow",
    department: "Railways",
    stage: "Legal Clearance",
    progress: 48,
    delayProbability: "54%",
    risk: "High Risk",
    riskTone: "high",
    factor: "Legal review",
    action: "Escalate",
    type: "Railway development",
    manager: "M. Verma",
    expectedCompletion: "Q1 2027",
    issue: "Multiple legal objections are affecting the clearance timeline.",
  },
  {
    id: "industrial-corridor",
    name: "Industrial Corridor South",
    state: "Gujarat",
    district: "Rajkot",
    department: "Industry Dept.",
    stage: "Rehabilitation",
    progress: 83,
    delayProbability: "16%",
    risk: "Low Risk",
    riskTone: "low",
    factor: "Rehabilitation follow-up",
    action: "Maintain",
    type: "Industrial corridor",
    manager: "S. Patel",
    expectedCompletion: "Q3 2026",
    issue: "Minor rehabilitation updates remain, but the project is on track.",
  },
];

const DEMO_USERS: DemoUser[] = [
  {
    id: "super-admin",
    email: "admin@lapredict.demo",
    name: "Aisha Reddy",
    role: "superAdministrator",
    scopeLabel: "All states, districts, and departments",
  },
  {
    id: "state-admin",
    email: "state@lapredict.demo",
    name: "Vikram Joshi",
    role: "stateAdministrator",
    scopeLabel: "Maharashtra",
    state: "Maharashtra",
  },
  {
    id: "district-officer",
    email: "district@lapredict.demo",
    name: "Nisha Mehta",
    role: "districtOfficer",
    scopeLabel: "Pune district",
    state: "Maharashtra",
    district: "Pune",
  },
  {
    id: "department-officer",
    email: "department@lapredict.demo",
    name: "Rajesh Iyer",
    role: "departmentOfficer",
    scopeLabel: "MoRTH department",
    department: "MoRTH",
  },
  {
    id: "project-officer",
    email: "project@lapredict.demo",
    name: "Sonal Khare",
    role: "projectOfficer",
    scopeLabel: "Assigned projects",
    assignedProjectIds: ["nh-77"],
  },
  {
    id: "viewer",
    email: "viewer@lapredict.demo",
    name: "Mehul Shah",
    role: "viewer",
    scopeLabel: "Approved read-only access",
    assignedProjectIds: ["industrial-corridor"],
  },
];

const ROLE_DEFINITIONS = {
  superAdministrator: {
    label: "Super Administrator",
    permissions: [
      "view_dashboard",
      "view_projects",
      "view_project_map",
      "view_risk_analysis",
      "view_delay_analytics",
      "view_alerts",
      "view_recommendations",
      "view_reports",
      "manage_users",
      "manage_settings",
      "edit_project_status",
    ],
  },
  stateAdministrator: {
    label: "State Administrator",
    permissions: [
      "view_dashboard",
      "view_projects",
      "view_state_projects",
      "view_project_map",
      "view_risk_analysis",
      "view_delay_analytics",
      "view_alerts",
      "view_recommendations",
      "view_reports",
      "edit_project_status",
    ],
  },
  districtOfficer: {
    label: "District Officer",
    permissions: [
      "view_dashboard",
      "view_projects",
      "view_district_projects",
      "view_project_map",
      "view_risk_analysis",
      "view_delay_analytics",
      "view_alerts",
      "view_recommendations",
      "view_reports",
      "edit_project_status",
    ],
  },
  departmentOfficer: {
    label: "Department Officer",
    permissions: [
      "view_dashboard",
      "view_projects",
      "view_department_projects",
      "view_project_map",
      "view_risk_analysis",
      "view_delay_analytics",
      "view_alerts",
      "view_recommendations",
      "view_reports",
    ],
  },
  projectOfficer: {
    label: "Project Officer",
    permissions: [
      "view_dashboard",
      "view_projects",
      "view_project_map",
      "view_assigned_projects",
      "view_risk_analysis",
      "view_delay_analytics",
      "view_alerts",
      "view_recommendations",
      "edit_project_status",
    ],
  },
  viewer: {
    label: "Viewer / Auditor",
    permissions: [
      "view_dashboard",
      "view_projects",
      "view_project_map",
      "view_assigned_projects",
      "view_risk_analysis",
      "view_delay_analytics",
      "view_reports",
      "view_alerts",
    ],
  },
};

const SIDEBAR_ITEMS = [
  { key: "Dashboard Overview", label: "Dashboard Overview", permission: "view_dashboard", icon: LayoutDashboard },
  { key: "Projects", label: "Projects", permission: "view_projects", icon: BarChart3 },
  { key: "Project Map", label: "Project Map", permission: "view_project_map", icon: MapPinned },
  { key: "Risk Analysis", label: "Risk Analysis", permission: "view_risk_analysis", icon: ShieldCheck },
  { key: "Delay Analytics", label: "Delay Analytics", permission: "view_delay_analytics", icon: TrendingUp },
  { key: "Alerts", label: "Alerts", permission: "view_alerts", icon: BellRing },
  { key: "Recommendations", label: "Recommendations", permission: "view_recommendations", icon: FileSearch },
  { key: "Reports", label: "Reports", permission: "view_reports", icon: FileSearch },
  { key: "Users and Roles", label: "Users and Roles", permission: "manage_users", icon: Users },
  { key: "Settings", label: "Settings", permission: "manage_settings", icon: Settings },
];

const SIDEBAR_SECTIONS = [
  { title: "Main", items: SIDEBAR_ITEMS.slice(0, 6) },
  { title: "Management", items: SIDEBAR_ITEMS.slice(6) },
];

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

function AppInner() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const savedUser = window.localStorage.getItem(STORAGE_KEY);
    return savedUser ? (JSON.parse(savedUser) as DemoUser) : null;
  });
  const [dashboardDrawerOpen, setDashboardDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (currentUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

  const handleSignIn = (email: string) => {
    const account = DEMO_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (!account) {
      return null;
    }

    setCurrentUser(account);
    return account;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="app">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenDashboardNavigation={() => setDashboardDrawerOpen(true)}
      />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={currentUser} requiredPermission="view_dashboard">
                <Dashboard
                  user={currentUser}
                  onLogout={handleLogout}
                  drawerOpen={dashboardDrawerOpen}
                  onDrawerOpenChange={setDashboardDrawerOpen}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signin"
            element={<SignIn onSignIn={handleSignIn} currentUser={currentUser} />}
          />
          <Route
            path="/signup"
            element={<SignUp onSignIn={handleSignIn} currentUser={currentUser} />}
          />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <footer className="footer">
        <div>
          <strong>LAPREDICT</strong>

          <p>Predictive analytics for better land acquisition monitoring.</p>
        </div>

        <span>Designed for clarity, transparency, and timely action.</span>
      </footer>
    </div>
  );
}

function Header({
  currentUser,
  onLogout,
  onOpenDashboardNavigation,
}: {
  currentUser: DemoUser | null;
  onLogout: () => void;
  onOpenDashboardNavigation: () => void;
}) {
  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <span className="brand-mark">
          <TrendingUp size={23} />
        </span>

        <span>
          <strong>LAPREDICT</strong>
        </span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end>
          Home
        </NavLink>

        <NavLink to="/features">Features</NavLink>

        <NavLink to="/workflow">How It Works</NavLink>

        <NavLink to="/dashboard">Dashboard</NavLink>

        <NavLink to="/about">About</NavLink>
      </nav>

      <div className="auth-actions">
        {currentUser ? (
          <>
            <button
              type="button"
              className="secondary-button navbar-user-button"
              onClick={onOpenDashboardNavigation}
              aria-label={`Open dashboard navigation for ${currentUser.name}`}
            >
              {currentUser.name}
            </button>

            <button type="button" className="primary-button" onClick={onLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link className="signin-button" to="/signin">
              Sign In
            </Link>

            <Link className="signup-button" to="/signup">
              Sign Up
              <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function Home() {
  return (
    <>
      <section className="hero-section" id="home">
        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles size={16} />
            Predictive Analytics System
          </div>

          <h1>
            Identify delays
            <span>before they happen.</span>
          </h1>

          <p className="hero-description">
            LAPREDICT helps administrators monitor land acquisition projects,
            understand delay risks, and take timely corrective action through
            intelligent data-driven insights.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to="/dashboard">
              Explore Dashboard
              <ArrowRight size={18} />
            </Link>

            <Link className="secondary-button" to="/workflow">
              Learn how it works
            </Link>
          </div>

          <div className="trust-row">
            <div>
              <CheckCircle2 size={18} />
              <span>Data-driven insights</span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>Stage-wise monitoring</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-line line-one" />
          <div className="visual-line line-two" />
          <div className="visual-dot dot-one" />
          <div className="visual-dot dot-two" />

          <div className="analytics-card">
            <div className="analytics-header">
              <div>
                <p className="card-label">PROJECT OVERVIEW</p>
                <h3>Acquisition Risk Monitor</h3>
              </div>

              <span className="preview-badge">Preview</span>
            </div>

            <div className="risk-summary">
              <div>
                <span className="summary-label">Overall Risk</span>
                <strong>Moderate</strong>
                <small>Illustrative project preview</small>
              </div>

              <div className="risk-meter">
                <div className="meter-track">
                  <div className="meter-fill" />
                </div>

                <span>62 / 100</span>
              </div>
            </div>

            <div className="mini-chart">
              <div className="chart-heading">
                <span>Risk trend</span>
                <span>Sample stages</span>
              </div>

              <div className="chart-bars">
                <span style={{ height: "35%" }} />
                <span style={{ height: "52%" }} />
                <span style={{ height: "42%" }} />
                <span style={{ height: "70%" }} />
                <span style={{ height: "58%" }} />
                <span className="active-bar" style={{ height: "84%" }} />
              </div>
            </div>

            <div className="indicator-grid">
              <div className="indicator-item">
                <FileSearch size={19} />
                <span>Documentation</span>
                <strong>Review</strong>
              </div>

              <div className="indicator-item">
                <MapPinned size={19} />
                <span>Location</span>
                <strong>Mapped</strong>
              </div>

              <div className="indicator-item">
                <BellRing size={19} />
                <span>Risk Alerts</span>
                <strong>Enabled</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <strong>01</strong>
          <span>Unified project monitoring</span>
        </div>

        <div className="stat-item">
          <strong>02</strong>
          <span>Risk-based decision support</span>
        </div>

        <div className="stat-item">
          <strong>03</strong>
          <span>Actionable recommendations</span>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <div>
            <p className="section-kicker">POWERFUL CAPABILITIES</p>
            <h2>Everything needed for smarter monitoring.</h2>
          </div>

          <p>
            A clear and structured workspace designed for administrators,
            officers, and decision-makers.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card featured-feature">
            <div className="feature-icon">
              <TrendingUp size={24} />
            </div>

            <h3>Predictive Risk Analytics</h3>

            <p>
              Identify possible project delays using project information,
              historical patterns, and relevant risk indicators.
            </p>

            <Link to="/dashboard">
              View analytics
              <ArrowRight size={16} />
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <ShieldCheck size={23} />
            </div>

            <h3>Explainable Insights</h3>

            <p>
              Understand the important factors contributing to a project’s
              risk level instead of relying on unexplained predictions.
            </p>

            <Link to="/dashboard">
              Explore insights
              <ArrowRight size={16} />
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <MapPinned size={23} />
            </div>

            <h3>GIS Project Mapping</h3>

            <p>
              View project locations and organize geographical information in
              a simple, accessible map-based interface.
            </p>

            <Link to="/dashboard">
              View project map
              <ArrowRight size={16} />
            </Link>
          </article>
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="section-heading centered-heading">
          <p className="section-kicker">SIMPLE WORKFLOW</p>

          <h2>From project data to timely action.</h2>

          <p>
            LAPREDICT brings important project information into one connected
            workflow.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step">
            <span>01</span>
            <h3>Collect</h3>
            <p>Record project, approval, compensation, and progress data.</p>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>02</span>
            <h3>Analyze</h3>
            <p>Evaluate risk indicators and identify possible delay factors.</p>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <span>03</span>
            <h3>Act</h3>
            <p>Use recommendations and alerts to support timely decisions.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Features() {
  return (
    <section className="inner-page">
      <div className="page-heading">
        <p className="section-kicker">POWERFUL CAPABILITIES</p>

        <h1>Everything needed for smarter monitoring.</h1>

        <p>
          LAPREDICT combines predictive analytics, explainable insights,
          geographic mapping, and alerts in one structured platform.
        </p>
      </div>

      <div className="feature-grid">
        <article className="feature-card featured-feature">
          <div className="feature-icon">
            <BarChart3 size={23} />
          </div>

          <h3>Predictive Risk Analytics</h3>

          <p>
            Identify possible project delays using project information,
            historical patterns, and relevant risk indicators.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">
            <ShieldCheck size={23} />
          </div>

          <h3>Explainable Insights</h3>

          <p>
            Understand the important factors contributing to a project's risk
            level.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">
            <MapPinned size={23} />
          </div>

          <h3>GIS Project Mapping</h3>

          <p>
            View project locations and organize geographical information in a
            map-based interface.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">
            <BellRing size={23} />
          </div>

          <h3>Early Warning Alerts</h3>

          <p>
            Highlight projects that may require attention before delays become
            difficult to manage.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">
            <FileSearch size={23} />
          </div>

          <h3>Project Documentation</h3>

          <p>
            Organize important project, approval, compensation, and progress
            information.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">
            <Users size={23} />
          </div>

          <h3>Role-Based Access</h3>

          <p>
            Support different access levels for administrators, officers, and
            viewers.
          </p>
        </article>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="inner-page">
      <div className="page-heading">
        <p className="section-kicker">SIMPLE WORKFLOW</p>

        <h1>From project data to timely action.</h1>

        <p>
          LAPREDICT organizes the monitoring process into a clear sequence so
          officers can understand project status and possible risks.
        </p>
      </div>

      <div className="workflow-grid">
        <div className="workflow-step">
          <span>01</span>
          <h3>Collect</h3>
          <p>
            Record project, approval, compensation, documentation, and
            progress information.
          </p>
        </div>

        <div className="workflow-line" />

        <div className="workflow-step">
          <span>02</span>
          <h3>Analyze</h3>
          <p>
            Evaluate risk indicators and identify possible delay factors.
          </p>
        </div>

        <div className="workflow-line" />

        <div className="workflow-step">
          <span>03</span>
          <h3>Act</h3>
          <p>
            Use recommendations and alerts to support timely administrative
            decisions.
          </p>
        </div>
      </div>
    </section>
  );
}

function Dashboard({
  user,
  onLogout,
  drawerOpen,
  onDrawerOpenChange,
}: {
  user: DemoUser | null;
  onLogout: () => void;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState("nh-77");
  const [selectedRegionId, setSelectedRegionId] = useState("Maharashtra");
  const [activeDetailTab, setActiveDetailTab] = useState("Overview");
  const [activeSection, setActiveSection] = useState("Dashboard Overview");

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDrawerOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [drawerOpen, onDrawerOpenChange]);

  const visibleProjects = getVisibleProjects(user);

  const projectRows = visibleProjects;

  const dashboardMetrics = [
    {
      id: "total-projects",
      label: "Total Projects",
      value: String(visibleProjects.length),
      helper: `${visibleProjects.filter((project) => project.progress >= 60).length} progressing`,
      tone: "up",
      icon: BarChart3,
    },
    {
      id: "active-projects",
      label: "Active Projects",
      value: String(visibleProjects.filter((project) => project.progress >= 50).length),
      helper: `${Math.round((visibleProjects.filter((project) => project.progress >= 50).length / Math.max(visibleProjects.length, 1)) * 100)}% active`,
      tone: "up",
      icon: Users,
    },
    {
      id: "delayed-projects",
      label: "Delayed Projects",
      value: String(visibleProjects.filter((project) => project.riskTone !== "low").length),
      helper: "Need attention",
      tone: "warning",
      icon: BellRing,
    },
    {
      id: "at-risk-projects",
      label: "At-Risk Projects",
      value: String(visibleProjects.filter((project) => project.riskTone === "medium").length),
      helper: "Review soon",
      tone: "warning",
      icon: ShieldCheck,
    },
    {
      id: "critical-projects",
      label: "Critical Projects",
      value: String(visibleProjects.filter((project) => project.riskTone === "high").length),
      helper: "Escalate if needed",
      tone: "critical",
      icon: AlertTriangle,
    },
    {
      id: "average-delay",
      label: "Average Delay",
      value: `${Math.round(
        visibleProjects.reduce((total, project) => total + Number.parseInt(project.delayProbability, 10), 0) /
          Math.max(visibleProjects.length, 1),
      )}%`,
      helper: "Demo forecast",
      tone: "up",
      icon: TrendingUp,
    },
  ];

  const riskRegions = buildRiskRegions(visibleProjects);

  const statusDistribution = buildStatusDistribution(visibleProjects);

  const topReasons = [
    { label: "Land acquisition issues", value: 38 },
    { label: "Pending approvals", value: 31 },
    { label: "Material or resource shortage", value: 26 },
    { label: "Legal disputes", value: 22 },
    { label: "Compensation delays", value: 18 },
  ];

  const milestoneData = [
    { name: "Planning", status: "Completed" },
    { name: "Notification", status: "Completed" },
    { name: "Land Survey", status: "In Progress" },
    { name: "Compensation", status: "Delayed" },
    { name: "Legal Clearance", status: "Pending" },
    { name: "Rehabilitation", status: "Pending" },
    { name: "Possession", status: "Pending" },
  ];

  const alerts = [
    {
      title: `${projectRows[0]?.name ?? "Current project"} crossed the delay threshold`,
      description: "Compensation documentation is behind the expected schedule.",
      severity: "critical",
    },
    {
      title: "Legal approval pending for the selected project",
      description: "State review is still awaiting clearance from the involved departments.",
      severity: "warning",
    },
    {
      title: "Survey milestones improved in this scope",
      description: "Field verification activities are progressing on schedule.",
      severity: "success",
    },
  ];

  const recommendations = [
    "Review pending compensation records and resolve document gaps.",
    "Coordinate with the legal unit to reduce clearance delays.",
    "Schedule a cross-department follow-up meeting for identified blockers.",
    "Reassess the revised timeline after shifting rehabilitation activities.",
  ];

  const detailTabs = [
    "Overview",
    "Progress",
    "Milestones",
    "Prediction",
    "Risk Analysis",
    "Recommendations",
  ];

  const selectedProject =
    projectRows.find((project) => project.id === selectedProjectId) ?? projectRows[0];

  const selectedRegion =
    riskRegions.find((region) => region.id === selectedRegionId) ?? riskRegions[0];

  if (!user) {
    return (
      <AccessRestricted
        role="Signed out"
        permission="view_dashboard"
        title="Access Restricted"
        explanation="Please sign in or create an account to access the LAPREDICT Dashboard."
      />
    );
  }

  if (!selectedProject || !selectedRegion) {
    return (
      <AccessRestricted
        role={ROLE_DEFINITIONS[user.role].label}
        permission="view_dashboard"
        title="Access Restricted"
        explanation="No permitted dashboard scope is available for this account."
      />
    );
  }

  return (
    <section className={`inner-page dashboard-page ${drawerOpen ? "drawer-is-open" : ""}`}>
      <div className="dashboard-shell">
        {drawerOpen && (
          <button
            type="button"
            className="dashboard-drawer-overlay"
            onClick={() => onDrawerOpenChange(false)}
            aria-label="Close dashboard navigation"
          />
        )}

        <aside className={`dashboard-sidebar ${drawerOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="brand sidebar-brand">
              <span className="brand-mark sidebar-brand-mark">
                <TrendingUp size={18} />
              </span>

              <div className="brand-copy">
                <strong>LAPREDICT</strong>
              </div>
            </div>

            <button
              type="button"
              className="mobile-close-button"
              onClick={() => onDrawerOpenChange(false)}
              aria-label="Close dashboard navigation"
            >
              <X size={16} />
            </button>
          </div>

          <div className="sidebar-profile">
            <div className="user-avatar">{getInitials(user.name)}</div>

            <div className="user-copy">
              <strong>{user.name}</strong>
              <span>{ROLE_DEFINITIONS[user.role].label}</span>
            </div>

            <span className="role-badge">{ROLE_DEFINITIONS[user.role].label}</span>
          </div>

          <div className="sidebar-scope">
            <span>Assigned scope</span>
            <strong>{user.scopeLabel}</strong>
          </div>

          {SIDEBAR_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => canAccess(user, item.permission));

            if (visibleItems.length === 0) {
              return null;
            }

            return (
              <div key={section.title} className="sidebar-section">
                <p className="sidebar-section-label">{section.title}</p>

                <div className="sidebar-items">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        className={`sidebar-item ${activeSection === item.key ? "active" : ""}`}
                        onClick={() => {
                          setActiveSection(item.key);
                          onDrawerOpenChange(false);
                        }}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button type="button" className="sidebar-logout" onClick={onLogout}>
            <LogOut size={15} />
            Logout
          </button>
        </aside>

        <div className={`dashboard-content ${activeSection === "Dashboard Overview" ? "is-overview" : "is-section"}`}>
          {activeSection !== "Dashboard Overview" && (
            <DashboardSection
              activeSection={activeSection}
              user={user}
              projects={visibleProjects}
              selectedProject={selectedProject}
              riskRegions={riskRegions}
              alerts={alerts}
              recommendations={recommendations}
              onSelectProject={setSelectedProjectId}
            />
          )}

          {activeSection === "Dashboard Overview" && (
            <>

          <div className="page-heading dashboard-page-header">
            <div className="dashboard-heading-row">
              <p className="section-kicker">LAPREDICT WORKSPACE</p>

              <span className="dashboard-demo-badge">Illustrative Demo Data</span>
            </div>

            <h1>Project Dashboard</h1>

            <p>
              Monitor project progress, review delay risks, and support timely
              administrative decisions.
            </p>
          </div>

          <div className="dashboard-toolbar">
            <div className="dashboard-search">
              <Search size={16} />

              <input
                type="text"
                placeholder="Search projects, districts, states, or departments"
              />
            </div>

            <div className="dashboard-filters">
              <div className="dashboard-filter-group">
                <span>State</span>
                <button type="button" className="dashboard-filter-button">
                  All States
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="dashboard-filter-group">
                <span>District</span>
                <button type="button" className="dashboard-filter-button">
                  All Districts
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="dashboard-filter-group">
                <span>Department</span>
                <button type="button" className="dashboard-filter-button">
                  All Departments
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="dashboard-filter-group">
                <span>Project Type</span>
                <button type="button" className="dashboard-filter-button">
                  All Types
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="dashboard-filter-group">
                <span>Time Period</span>
                <button type="button" className="dashboard-filter-button">
                  6M
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {dashboardMetrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div key={metric.id} className="dashboard-card">
                  <div className="dashboard-card-header">
                    <div className="dashboard-card-icon">
                      <Icon size={18} />
                    </div>

                    <span className={`dashboard-card-trend ${metric.tone}`}>
                      {metric.helper}
                    </span>
                  </div>

                  <span className="dashboard-card-label">{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.helper}</small>
                </div>
              );
            })}
          </div>

          <div className="dashboard-main-grid">
            <div className="dashboard-panel dashboard-map-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">REGIONAL OVERVIEW</p>
                  <h3>India – Project Risk Overview</h3>
                </div>

                <button type="button" className="panel-link">
                  <SlidersHorizontal size={15} />
                  Filters
                </button>
              </div>

              <div className="map-legend">
                <span className="legend-item">
                  <span className="legend-swatch high" /> High Risk
                </span>
                <span className="legend-item">
                  <span className="legend-swatch medium" /> Medium Risk
                </span>
                <span className="legend-item">
                  <span className="legend-swatch low" /> Low Risk
                </span>
              </div>

              <div className="risk-map-grid">
                {riskRegions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    className={`risk-region ${selectedRegionId === region.id ? "active" : ""}`}
                    onClick={() => setSelectedRegionId(region.id)}
                  >
                    <div className="risk-region-header">
                      <span className="risk-region-name">{region.name}</span>

                      <span className={`risk-badge ${region.className}`}>
                        {region.risk}
                      </span>
                    </div>

                    <div className="risk-region-meta">
                      <span>{region.projects} projects</span>
                      <span>{region.delayed}% delayed</span>
                    </div>

                    <div className="risk-bar">
                      <span style={{ width: `${region.delayed}%` }} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="selected-region-card">
                <p className="panel-label">SELECTED REGION</p>

                <div className="selected-region-row">
                  <div>
                    <h4>{selectedRegion.name}</h4>
                    <p>{selectedRegion.description}</p>
                  </div>

                  <span className={`risk-badge ${selectedRegion.className}`}>
                    {selectedRegion.risk}
                  </span>
                </div>

                <div className="selected-region-stats">
                  <div className="region-stat">
                    <span>Projects</span>
                    <strong>{selectedRegion.projects}</strong>
                  </div>

                  <div className="region-stat">
                    <span>Delayed</span>
                    <strong>{selectedRegion.delayed}%</strong>
                  </div>

                  <div className="region-stat">
                    <span>Risk level</span>
                    <strong>{selectedRegion.risk}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-panel status-panel">
              <div className="panel-header compact">
                <div>
                  <p className="panel-label">PROJECT STATUS</p>
                  <h3>Project Status Distribution</h3>
                </div>
              </div>

              <div className="status-layout">
                <div
                  className="status-ring"
                  style={{
                    background: `conic-gradient(#4ba3ff 0 38%, #7ad7c8 38% 60%, #f5c869 60% 79%, #ff9a62 79% 93%, #ff7a7a 93% 100%)`,
                  }}
                >
                  <div className="status-ring-inner">
                    <strong>{visibleProjects.length}</strong>
                    <span>Total</span>
                  </div>
                </div>

                <div className="status-breakdown">
                  {statusDistribution.map((status) => (
                    <div key={status.label} className="status-item">
                      <div className="status-item-label">
                        <span
                          className="status-dot"
                          style={{ background: status.color }}
                        />
                        {status.label}
                      </div>

                      <strong>{status.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-panel trend-panel">
              <div className="panel-header compact">
                <div>
                  <p className="panel-label">TIME RANGE</p>
                  <h3>Delay Trend</h3>
                </div>

                <div className="trend-range">
                  {["7D", "30D", "6M", "1Y", "Custom"].map((range, index) => (
                    <button
                      key={range}
                      type="button"
                      className={`range-button ${index === 2 ? "active" : ""}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="trend-chart">
                <svg viewBox="0 0 360 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4ba3ff" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#4ba3ff" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {Array.from({ length: 4 }).map((_, index) => (
                    <line
                      key={index}
                      x1="0"
                      x2="360"
                      y1={20 + index * 35}
                      y2={20 + index * 35}
                      stroke="rgba(124, 143, 172, 0.24)"
                      strokeWidth="1"
                    />
                  ))}

                  <polyline
                    fill="none"
                    stroke="#2e7de0"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points="0,96 36,88 72,94 108,82 144,72 180,82 216,58 252,52 288,63 324,38 360,42"
                  />

                  <polyline
                    fill="url(#trendGradient)"
                    stroke="none"
                    points="0,96 36,88 72,94 108,82 144,72 180,82 216,58 252,52 288,63 324,38 360,42 360,150 0,150"
                  />
                </svg>

                <div className="trend-labels">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-lower-grid">
            <div className="dashboard-panel reasons-panel">
              <div className="panel-header compact">
                <div>
                  <p className="panel-label">DELAY ANALYSIS</p>
                  <h3>Top Delay Reasons</h3>
                </div>
              </div>

              <div className="reason-list">
                {topReasons.map((reason) => (
                  <div key={reason.label} className="reason-row">
                    <div className="reason-header">
                      <span>{reason.label}</span>
                      <strong>{reason.value}%</strong>
                    </div>

                    <div className="reason-bar">
                      <span style={{ width: `${reason.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel risk-table-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">PROJECT WATCHLIST</p>
                  <h3>High-Risk Projects</h3>
                </div>

                <button type="button" className="panel-link">
                  View all
                </button>
              </div>

              <div className="project-table-wrap">
                <table className="project-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Location</th>
                      <th>Stage</th>
                      <th>Progress</th>
                      <th>Delay</th>
                      <th>Risk</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {projectRows.map((project) => (
                      <tr
                        key={project.id}
                        className={selectedProjectId === project.id ? "is-selected" : ""}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <td>{project.name}</td>
                        <td>{project.state}</td>
                        <td>{project.stage}</td>
                        <td>
                          <div className="progress-cell">
                            <span>{project.progress}%</span>
                            <div className="mini-progress">
                              <span style={{ width: `${project.progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>{project.delayProbability}</td>
                        <td>
                          <span className={`risk-badge ${project.riskTone}`}>
                            {project.risk}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="table-action">
                            {project.action}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="dashboard-panel project-detail-panel">
            <div className="panel-header detail-header">
              <div>
                <p className="panel-label">PROJECT DETAIL OVERVIEW</p>
                <h3>{selectedProject.name}</h3>
              </div>

              <div className="detail-header-metrics">
                <div className="detail-stat">
                  <span>Location</span>
                  <strong>{selectedProject.state}</strong>
                </div>

                <div className="detail-stat">
                  <span>Department</span>
                  <strong>{selectedProject.department}</strong>
                </div>

                <div className="detail-stat">
                  <span>Project Type</span>
                  <strong>{selectedProject.type}</strong>
                </div>
              </div>
            </div>

            <div className="detail-tabs">
              {detailTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`detail-tab ${activeDetailTab === tab ? "active" : ""}`}
                  onClick={() => setActiveDetailTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="detail-content">
              {activeDetailTab === "Overview" && (
                <div className="detail-overview-grid">
                  <div className="detail-stat-block">
                    <span>Project manager</span>
                    <strong>{selectedProject.manager}</strong>
                  </div>

                  <div className="detail-stat-block">
                    <span>Current stage</span>
                    <strong>{selectedProject.stage}</strong>
                  </div>

                  <div className="detail-stat-block">
                    <span>Overall progress</span>
                    <strong>{selectedProject.progress}%</strong>
                  </div>

                  <div className="detail-stat-block">
                    <span>Delay probability</span>
                    <strong>{selectedProject.delayProbability}</strong>
                  </div>

                  <div className="detail-stat-block">
                    <span>Risk level</span>
                    <strong>{selectedProject.risk}</strong>
                  </div>

                  <div className="detail-stat-block">
                    <span>Expected completion</span>
                    <strong>{selectedProject.expectedCompletion}</strong>
                  </div>
                </div>
              )}

              {activeDetailTab === "Progress" && (
                <div className="detail-progress-grid">
                  <div className="detail-progress-card">
                    <p>Current progress</p>
                    <strong>{selectedProject.progress}%</strong>
                    <div className="detail-progress-bar">
                      <span style={{ width: `${selectedProject.progress}%` }} />
                    </div>
                  </div>

                  <div className="detail-progress-card">
                    <p>Milestone completion</p>
                    <strong>5 / 8</strong>
                    <div className="detail-progress-bar secondary">
                      <span style={{ width: "62%" }} />
                    </div>
                  </div>

                  <div className="detail-progress-card">
                    <p>Risk trend</p>
                    <strong>Increasing</strong>
                    <div className="detail-progress-bar tertiary">
                      <span style={{ width: "74%" }} />
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === "Milestones" && (
                <div className="detail-milestones">
                  {milestoneData.map((milestone, index) => (
                    <div key={milestone.name} className="detail-milestone-item">
                      <div className="detail-milestone-count">{index + 1}</div>
                      <div className="detail-milestone-copy">
                        <strong>{milestone.name}</strong>
                        <span>{milestone.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeDetailTab === "Prediction" && (
                <div className="detail-note">
                  <div className="demo-badge">Demo Prediction</div>

                  <p>
                    The current project shows a moderate probability of delay due to
                    outstanding compensation and approval dependencies. The pattern is
                    consistent with similar land acquisition projects where field
                    verification and documentation validation lag behind the planned
                    schedule.
                  </p>

                  <ul>
                    <li>Estimated delay probability: {selectedProject.delayProbability}</li>
                    <li>Current risk level: {selectedProject.risk}</li>
                    <li>Primary focus area: {selectedProject.factor}</li>
                  </ul>
                </div>
              )}

              {activeDetailTab === "Risk Analysis" && (
                <div className="detail-note">
                  <p>
                    The project is presently classified as {selectedProject.risk} based on
                    a combination of progress, dependency health, and emerging blockers.
                    The strongest pressure points are the outstanding compensation
                    records, approval follow-up, and required administrative reviews.
                  </p>

                  <div className="risk-analysis-list">
                    <div>
                      <span>Main issue</span>
                      <strong>{selectedProject.issue}</strong>
                    </div>

                    <div>
                      <span>Current progress</span>
                      <strong>{selectedProject.progress}%</strong>
                    </div>

                    <div>
                      <span>Delay probability</span>
                      <strong>{selectedProject.delayProbability}</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === "Recommendations" && (
                <div className="recommendation-block">
                  {recommendations.map((recommendation, index) => (
                    <div key={recommendation} className="recommendation-item">
                      <div className="recommendation-index">0{index + 1}</div>
                      <div>
                        <strong>{recommendation}</strong>
                        <span>Action recommended for this project</span>
                      </div>

                      <button type="button" className="table-action">
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-bottom-grid">
            <div className="dashboard-panel milestone-panel">
              <div className="panel-header compact">
                <div>
                  <p className="panel-label">PROJECT TRACKING</p>
                  <h3>Milestone Tracking</h3>
                </div>
              </div>

              <div className="milestone-list">
                {milestoneData.map((milestone, index) => (
                  <div key={milestone.name} className="milestone-item">
                    <div className="milestone-index">{index + 1}</div>

                    <div className="milestone-copy">
                      <strong>{milestone.name}</strong>
                      <span>{milestone.status}</span>
                    </div>

                    <span
                      className={`milestone-status ${milestone.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel prediction-panel">
              <div className="panel-header compact">
                <div>
                  <p className="panel-label">AI SUPPORT</p>
                  <h3>AI Prediction &amp; Explanation</h3>
                </div>
              </div>

              <div className="prediction-summary">
                <div className="prediction-value-card">
                  <span>Delay probability</span>
                  <strong>{selectedProject.delayProbability}</strong>
                </div>

                <div className="prediction-value-card secondary">
                  <span>Current risk level</span>
                  <strong>{selectedProject.risk}</strong>
                </div>
              </div>

              <div className="demo-badge">Illustrative Demo</div>

              <p className="prediction-note">
                This explanatory panel is designed for illustrative use only. It shows
                how a future AI-assisted dashboard might summarize the current risk
                posture and key contributing factors.
              </p>

              <ul className="prediction-points">
                <li>Current project progress: {selectedProject.progress}%</li>
                <li>Primary contributing factor: {selectedProject.factor}</li>
                <li>Current administrative focus: {selectedProject.stage}</li>
              </ul>
            </div>

            <div className="dashboard-panel recommendations-panel">
              <div className="panel-header compact">
                <div>
                  <p className="panel-label">ACTION PLAN</p>
                  <h3>Recommended Actions</h3>
                </div>
              </div>

              <div className="recommendation-list">
                {recommendations.map((recommendation, index) => (
                  <div key={recommendation} className="recommendation-item">
                    <div className="recommendation-index">0{index + 1}</div>

                    <div className="recommendation-copy">
                      <strong>{recommendation}</strong>
                      <span>
                        Priority: {index === 0 ? "High" : index === 1 ? "High" : "Medium"}
                      </span>
                    </div>

                    <button type="button" className="table-action">
                      Action
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel alerts-panel">
              <div className="panel-header compact">
                <div>
                  <p className="panel-label">RECENT UPDATES</p>
                  <h3>Alerts &amp; Recent Updates</h3>
                </div>
              </div>

              <div className="alert-list">
                {alerts.map((alert) => (
                  <div key={alert.title} className={`alert-item ${alert.severity}`}>
                    <div className="alert-icon">
                      <AlertTriangle size={15} />
                    </div>

                    <div className="alert-copy">
                      <strong>{alert.title}</strong>
                      <p>{alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardSection({
  activeSection,
  user,
  projects,
  selectedProject,
  riskRegions,
  alerts,
  recommendations,
  onSelectProject,
}: {
  activeSection: string;
  user: DemoUser;
  projects: Project[];
  selectedProject: Project;
  riskRegions: ReturnType<typeof buildRiskRegions>;
  alerts: { title: string; description: string; severity: string }[];
  recommendations: string[];
  onSelectProject: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.state} ${project.district} ${project.department}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const highRisk = projects.filter((project) => project.riskTone === "high");
  const mediumRisk = projects.filter((project) => project.riskTone === "medium");
  const lowRisk = projects.filter((project) => project.riskTone === "low");

  const sectionCopy: Record<string, { title: string; description: string }> = {
    Projects: { title: "Projects", description: "Review projects within your assigned scope." },
    "Project Map": { title: "Project Map", description: "Explore regional project risk across the current demo scope." },
    "Risk Analysis": { title: "Risk Analysis", description: "Understand the risk levels and factors behind the current project set." },
    "Delay Analytics": { title: "Delay Analytics", description: "Review illustrative delay patterns and contributing factors." },
    Alerts: { title: "Alerts", description: "Review critical, warning, and informational project updates." },
    Recommendations: { title: "Recommendations", description: "Review demo recommendations for the selected project." },
    Reports: { title: "Reports", description: "Preview structured project and risk reports for this scope." },
    "Users and Roles": { title: "Users and Roles", description: "Review controlled demo accounts and their access scopes." },
    Settings: { title: "Settings", description: "Adjust dashboard-only demo preferences for this session." },
  };
  const copy = sectionCopy[activeSection] ?? sectionCopy.Projects;

  return (
    <div className="dashboard-section-view">
      <div className="page-heading dashboard-page-header">
        <div className="dashboard-heading-row">
          <p className="section-kicker">LAPREDICT WORKSPACE</p>
          <span className="dashboard-demo-badge">Illustrative Demo Data</span>
        </div>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>

      {activeSection === "Projects" && (
        <div className="dashboard-panel section-panel">
          <div className="section-toolbar">
            <div className="dashboard-search">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or locations" />
            </div>
            <span className="demo-badge">{filteredProjects.length} in scope</span>
          </div>
          <div className="project-table-wrap">
            <table className="project-table">
              <thead><tr><th>Project</th><th>Type</th><th>Location</th><th>Stage</th><th>Progress</th><th>Delay</th><th>Risk</th><th>Status</th></tr></thead>
              <tbody>{filteredProjects.map((project) => (
                <tr key={project.id} onClick={() => onSelectProject(project.id)}>
                  <td>{project.name}</td><td>{project.type}</td><td>{project.district}, {project.state}</td><td>{project.stage}</td><td>{project.progress}%</td><td>{project.delayProbability}</td><td><span className={`risk-badge ${project.riskTone}`}>{project.risk}</span></td><td>{project.progress >= 70 ? "On track" : "Needs review"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === "Project Map" && (
        <div className="section-card-grid">
          {riskRegions.map((region) => <article className="dashboard-panel section-card" key={region.id}><p className="panel-label">REGION</p><h3>{region.name}</h3><p>{region.description}</p><div className="section-stat-row"><strong>{region.projects} projects</strong><span className={`risk-badge ${region.className}`}>{region.risk}</span></div><div className="risk-bar"><span style={{ width: `${region.delayed}%` }} /></div><small>{region.delayed}% delayed in this scope</small></article>)}
        </div>
      )}

      {activeSection === "Risk Analysis" && (
        <div className="section-card-grid risk-summary-grid">
          {[["High Risk", highRisk, "high"], ["Medium Risk", mediumRisk, "medium"], ["Low Risk", lowRisk, "low"]].map(([label, items, tone]) => <article className="dashboard-panel section-card" key={label as string}><p className="panel-label">RISK SUMMARY</p><h3>{label as string}</h3><strong className="section-number">{(items as Project[]).length}</strong><p>{(items as Project[]).map((project) => project.name).join(", ") || "No projects in this category."}</p><span className={`risk-badge ${tone as string}`}>Demo classification</span></article>)}
          <article className="dashboard-panel section-panel"><div className="panel-header compact"><div><p className="panel-label">SELECTED PROJECT</p><h3>{selectedProject.name}</h3></div><span className={`risk-badge ${selectedProject.riskTone}`}>{selectedProject.risk}</span></div><p className="section-copy">{selectedProject.issue}</p><div className="section-stat-row"><strong>Delay probability: {selectedProject.delayProbability}</strong><span>Primary factor: {selectedProject.factor}</span></div></article>
        </div>
      )}

      {activeSection === "Delay Analytics" && <div className="section-card-grid"><article className="dashboard-panel section-card"><p className="panel-label">AVERAGE DELAY</p><strong className="section-number">{Math.round(projects.reduce((sum, project) => sum + Number.parseInt(project.delayProbability, 10), 0) / Math.max(projects.length, 1))}%</strong><p>Illustrative forecast across the current role scope.</p></article><article className="dashboard-panel section-card"><p className="panel-label">TOP DELAY FACTORS</p>{["Land acquisition issues", "Pending approvals", "Compensation delays"].map((reason, index) => <div className="section-list-row" key={reason}><span>{reason}</span><strong>{38 - index * 9}%</strong></div>)}</article><article className="dashboard-panel section-panel"><p className="panel-label">DELAY TREND</p><h3>Six-month illustrative trend</h3><div className="section-bars">{[45, 58, 50, 69, 62, 78].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div><small>Demo data only. No real government data is represented.</small></article></div>}

      {activeSection === "Alerts" && <div className="dashboard-panel section-panel"><div className="alert-list">{alerts.map((alert, index) => <div className={`alert-item ${alert.severity}`} key={alert.title}><div className="alert-icon"><AlertTriangle size={15} /></div><div className="alert-copy"><strong>{alert.title}</strong><p>{alert.description}</p><small>{index === 0 ? "Critical" : index === 1 ? "Warning" : "Informational"} · Demo update</small></div></div>)}</div></div>}

      {activeSection === "Recommendations" && <div className="dashboard-panel section-panel"><div className="recommendation-list">{recommendations.map((recommendation, index) => <div className="recommendation-item" key={recommendation}><div className="recommendation-index">0{index + 1}</div><div className="recommendation-copy"><strong>{recommendation}</strong><span>Related factor: {selectedProject.factor} · Responsible: {selectedProject.department}</span></div><span className="milestone-status pending">{index === 0 ? "Pending" : index === 1 ? "In Progress" : "Completed"}</span></div>)}</div></div>}

      {activeSection === "Reports" && <div className="section-card-grid">{["Project Summary Report", "Risk Report", "Delay Analysis Report", "Scope Summary Report"].map((report) => <article className="dashboard-panel section-card" key={report}><p className="panel-label">REPORT PREVIEW</p><h3>{report}</h3><p>Reporting period: Last 6 months · Scope: {user.scopeLabel}</p><button type="button" className="panel-link" onClick={() => setPreviewReport(report)}>View preview</button></article>)}</div>}

      {activeSection === "Users and Roles" && <div className="dashboard-panel section-panel"><div className="project-table-wrap"><table className="project-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Assigned scope</th><th>Access</th><th>Status</th></tr></thead><tbody>{DEMO_USERS.map((demoUser) => <tr key={demoUser.id}><td>{demoUser.name}</td><td>{demoUser.email}</td><td>{ROLE_DEFINITIONS[demoUser.role].label}</td><td>{demoUser.scopeLabel}</td><td>{ROLE_DEFINITIONS[demoUser.role].permissions.length} permissions</td><td>Active demo</td></tr>)}</tbody></table></div></div>}

      {activeSection === "Settings" && <div className="section-card-grid"><article className="dashboard-panel section-card"><p className="panel-label">NOTIFICATIONS</p><h3>Demo alert preferences</h3><p>Frontend-only preference for this dashboard session.</p><button type="button" className={`settings-toggle ${notificationsEnabled ? "active" : ""}`} onClick={() => setNotificationsEnabled((enabled) => !enabled)}><span />{notificationsEnabled ? "Enabled" : "Disabled"}</button></article><article className="dashboard-panel section-card"><p className="panel-label">DISPLAY</p><h3>Interface density</h3><p>Change the density label for this demo workspace.</p><button type="button" className={`settings-toggle ${compactView ? "active" : ""}`} onClick={() => setCompactView((compact) => !compact)}><span />{compactView ? "Compact" : "Comfortable"}</button></article></div>}

      {previewReport && <div className="preview-dialog" role="dialog" aria-modal="true"><div className="preview-dialog-card"><p className="panel-label">ILLUSTRATIVE REPORT</p><h3>{previewReport}</h3><p>This is a frontend demo preview for {user.scopeLabel}. No file has been downloaded and no real government data is represented.</p><button type="button" className="primary-button" onClick={() => setPreviewReport(null)}>Close preview</button></div></div>}
    </div>
  );
}

function SignIn({
  currentUser,
  onSignIn,
}: {
  currentUser: DemoUser | null;
  onSignIn: (email: string) => DemoUser | null;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [selectedEmail, setSelectedEmail] = useState(currentUser?.email ?? "admin@lapredict.demo");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = (email || selectedEmail).trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Choose a demo account to continue.");
      return;
    }

    const account = onSignIn(normalizedEmail);

    if (!account) {
      setError("That demo account is not available. Please choose one of the labels below.");
      return;
    }

    navigate(redirectTo || "/dashboard");
  };

  const handleDemoSelect = (demoUser: DemoUser) => {
    setSelectedEmail(demoUser.email);
    setEmail(demoUser.email);
    setError("");

    onSignIn(demoUser.email);
    navigate(redirectTo || "/dashboard");
  };

  return (
    <section className="auth-page">
      <div className="auth-card signin-card">
        <div className="auth-icon">
          <ShieldCheck size={27} />
        </div>

        <p className="section-kicker">WELCOME BACK</p>

        <h1>Sign in to LAPREDICT</h1>

        <p className="auth-description">
          {redirectTo !== "/dashboard"
            ? "Please sign in or create an account to access the LAPREDICT Dashboard."
            : "Access your project monitoring workspace with a demo account."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signin-email">Email address</label>

          <input
            id="signin-email"
            type="email"
            placeholder="Enter your email"
            value={email || selectedEmail}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="signin-password">Password</label>

          <input
            id="signin-password"
            type="password"
            placeholder="Use any password in demo mode"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="primary-button form-button" type="submit">
            Sign In
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="demo-user-list">
          {DEMO_USERS.map((demoUser) => (
            <button
              key={demoUser.email}
              type="button"
              className={`demo-user-card ${selectedEmail === demoUser.email ? "selected" : ""}`}
              onClick={() => handleDemoSelect(demoUser)}
            >
              <div className="demo-user-topline">
                <span className="demo-user-avatar">{getInitials(demoUser.name)}</span>
                <div>
                  <strong>{demoUser.name}</strong>
                  <small>{demoUser.email}</small>
                </div>
              </div>

              <span className="demo-role-tag">
                {ROLE_DEFINITIONS[demoUser.role].label}
              </span>

              <small className="demo-user-scope">{demoUser.scopeLabel}</small>
            </button>
          ))}
        </div>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </section>
  );
}

function SignUp({
  currentUser,
  onSignIn,
}: {
  currentUser: DemoUser | null;
  onSignIn: (email: string) => DemoUser | null;
}) {
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [message, setMessage] = useState(
    "Demo sign-up is currently a frontend-only flow. A backend will be required for real account creation.",
  );
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      setMessage("Please provide both a name and a demo email address.");
      return;
    }

    const account = onSignIn(email.trim().toLowerCase());

    if (!account) {
      setMessage(
        "This demo flow only supports the pre-configured LAPREDICT accounts below. Please use one of the labelled demo users.",
      );
      return;
    }

    navigate("/dashboard");
  };

  return (
    <section className="auth-page">
      <div className="auth-card signup-card">
        <div className="auth-icon">
          <Users size={27} />
        </div>

        <p className="section-kicker">GET STARTED</p>

        <h1>Create your account</h1>

        <p className="auth-description">
          Demo sign-up is currently front-end only. A real backend is required to
          create production accounts.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Full name</label>

          <input
            id="signup-name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="signup-email">Email address</label>

          <input
            id="signup-email"
            type="email"
            placeholder="Enter your demo email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button className="primary-button form-button" type="submit">
            Continue with Demo Access
            <ArrowRight size={17} />
          </button>
        </form>

        {message ? <p className="auth-message">{message}</p> : null}

        <div className="demo-user-list compact">
          {DEMO_USERS.map((demoUser) => (
            <div key={demoUser.email} className="demo-user-card compact-card">
              <div className="demo-user-topline">
                <span className="demo-user-avatar">{getInitials(demoUser.name)}</span>
                <div>
                  <strong>{demoUser.name}</strong>
                  <small>{demoUser.email}</small>
                </div>
              </div>

              <span className="demo-role-tag">
                {ROLE_DEFINITIONS[demoUser.role].label}
              </span>
            </div>
          ))}
        </div>

        <p className="auth-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="inner-page about-page">
      <div className="page-heading">
        <p className="section-kicker">ABOUT LAPREDICT</p>

        <h1>Supporting better land acquisition decisions.</h1>

        <p>
          LAPREDICT is a predictive analytics concept designed to help
          administrators identify possible land acquisition delays earlier and
          respond with better information.
        </p>
      </div>

      <div className="about-grid">
        <article>
          <CheckCircle2 size={23} />

          <h2>Transparent</h2>

          <p>
            Risk indicators and contributing factors should be presented in a
            clear and understandable manner.
          </p>
        </article>

        <article>
          <CheckCircle2 size={23} />

          <h2>Data-driven</h2>

          <p>
            Project information can be organized and analyzed to support
            informed administrative decisions.
          </p>
        </article>

        <article>
          <CheckCircle2 size={23} />

          <h2>Action-oriented</h2>

          <p>
            The system focuses on helping officers identify issues and consider
            suitable corrective actions.
          </p>
        </article>
      </div>
    </section>
  );
}

function ProtectedRoute({
  user,
  requiredPermission,
  children,
}: {
  user: DemoUser | null;
  requiredPermission: string;
  children: React.ReactNode;
}) {
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/signin?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!canAccess(user, requiredPermission)) {
    return (
      <AccessRestricted
        role={ROLE_DEFINITIONS[user.role].label}
        permission={requiredPermission}
        title="Access Restricted"
        explanation="Your role does not permit access to this dashboard area."
      />
    );
  }

  return <>{children}</>;
}

function AccessRestricted({
  role,
  permission,
  title,
  explanation,
}: {
  role: string;
  permission: string;
  title: string;
  explanation: string;
}) {
  const navigate = useNavigate();

  return (
    <section className="auth-page">
      <div className="auth-card access-card">
        <div className="auth-icon access-icon">
          <Lock size={27} />
        </div>

        <p className="section-kicker">SECURED CONTENT</p>

        <h1>{title}</h1>

        <p className="auth-description">{explanation}</p>

        <div className="access-meta">
          <div>
            <span>Current role</span>
            <strong>{role}</strong>
          </div>

          <div>
            <span>Required permission</span>
            <strong>{permission}</strong>
          </div>
        </div>

        <button
          type="button"
          className="primary-button form-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

function getVisibleProjects(user: DemoUser | null): Project[] {
  if (!user) {
    return [];
  }

  if (user.role === "superAdministrator") {
    return ALL_PROJECTS;
  }

  if (user.role === "stateAdministrator") {
    return ALL_PROJECTS.filter((project) => project.state === user.state);
  }

  if (user.role === "districtOfficer") {
    return ALL_PROJECTS.filter(
      (project) => project.state === user.state && project.district === user.district,
    );
  }

  if (user.role === "departmentOfficer") {
    return ALL_PROJECTS.filter((project) => project.department === user.department);
  }

  if (user.role === "projectOfficer" || user.role === "viewer") {
    return ALL_PROJECTS.filter((project) =>
      user.assignedProjectIds?.includes(project.id),
    );
  }

  return [];
}

function buildRiskRegions(visibleProjects: Project[]) {
  const states = Array.from(new Set(visibleProjects.map((project) => project.state)));

  return states.map((state) => {
    const projects = visibleProjects.filter((project) => project.state === state);
    const delayedShare = Math.round(
      (projects.filter((project) => project.riskTone !== "low").length /
        Math.max(projects.length, 1)) *
        100,
    );

    const risk = delayedShare >= 50 ? "High Risk" : delayedShare >= 25 ? "Medium Risk" : "Low Risk";

    return {
      id: state,
      name: state,
      projects: projects.length,
      delayed: delayedShare,
      risk,
      className:
        delayedShare >= 50 ? "high" : delayedShare >= 25 ? "medium" : "low",
      description:
        delayedShare >= 50
          ? "High count of delayed or at-risk projects in this scope."
          : delayedShare >= 25
            ? "Multiple projects require added monitoring and follow-up."
            : "Projects in this scope are progressing steadily.",
    };
  });
}

function buildStatusDistribution(visibleProjects: Project[]) {
  const total = Math.max(visibleProjects.length, 1);
  const low = visibleProjects.filter((project) => project.riskTone === "low").length;
  const medium = visibleProjects.filter((project) => project.riskTone === "medium").length;
  const high = visibleProjects.filter((project) => project.riskTone === "high").length;

  return [
    { label: "On Schedule", value: Math.round((low / total) * 100), color: "#4ba3ff" },
    { label: "Slightly Delayed", value: Math.round((medium / total) * 100), color: "#7ad7c8" },
    { label: "At Risk", value: Math.round((high / total) * 100), color: "#f5c869" },
    { label: "Delayed", value: Math.round((high / total) * 100), color: "#ff9a62" },
    { label: "Critical", value: Math.round((high / total) * 100), color: "#ff7a7a" },
  ];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function canAccess(user: DemoUser, permission: string) {
  return ROLE_DEFINITIONS[user.role].permissions.includes(permission);
}

export default App;
