import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    UserCheck,
    UserPlus,
    UserX,
    LayoutDashboard,
    RefreshCw,
    LogOut
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import "./AdminDashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://simple-login-server-nda4.onrender.com";

async function readApiResponse(response, fallbackMessage) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        throw new Error(
            `${fallbackMessage} (HTTP ${response.status}). The server returned HTML instead of JSON. ` +
            "Run the updated backend locally or deploy server.js to Render."
        );
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `${fallbackMessage} (HTTP ${response.status})`);
    return data;
}

function AdminDashboard() {

    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        inactiveUsers: 0,
        recentRegistrations: []
    });
    const chartData = [
        {
            name: "Active Users",
            value: stats.activeUsers
        },
        {
            name: "Inactive Users",
            value: stats.inactiveUsers
        }
    ];

    const COLORS = ["#16a34a", "#dc2626"];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [registrationAnalytics, setRegistrationAnalytics] = useState({ totalRegistrations: 0, chartData: [] });
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState("");
    const [analyticsRefresh, setAnalyticsRefresh] = useState(0);

    const navigate = useNavigate();

    // Refresh the existing dashboard summary statistics.
    const fetchDashboardStats = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard-stats`);
            setStats(await readApiResponse(response, "Unable to fetch dashboard data"));
        } catch (fetchError) {
            setError(fetchError.message || "Unable to fetch dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const refreshDashboard = () => {
        fetchDashboardStats();
        setAnalyticsRefresh((value) => value + 1);
    };

    useEffect(() => {
        const timer = window.setTimeout(fetchDashboardStats, 0);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let isCurrentRequest = true;
        const fetchAnalytics = async () => {
            setAnalyticsLoading(true);
            setAnalyticsError("");
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/registration-analytics?period=${selectedPeriod}`,
                    { signal: controller.signal }
                );
                const data = await readApiResponse(response, "Unable to fetch registration analytics");
                if (!Array.isArray(data.chartData)) throw new Error("Invalid registration analytics data");
                if (isCurrentRequest) setRegistrationAnalytics(data);
            } catch (fetchError) {
                if (isCurrentRequest && fetchError.name !== "AbortError") {
                    setAnalyticsError(fetchError.message || "Unable to fetch registration analytics");
                }
            } finally {
                if (isCurrentRequest) setAnalyticsLoading(false);
            }
        };
        fetchAnalytics();
        return () => {
            isCurrentRequest = false;
            controller.abort();
        };
    }, [selectedPeriod, analyticsRefresh]);

    return (

        <div className="admin-dashboard">

            {/* Sidebar */}

            <aside className="admin-sidebar">

                <div className="sidebar-brand">
                    <LayoutDashboard size={24} />
                    <h2>Admin Panel</h2>
                </div>

                <div className="sidebar-menu">

                    <button className="sidebar-item active">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>

                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/Dashboard")}
                    >
                        <Users size={20} />
                        Registered Users
                    </button>

                </div>


            </aside>


            {/* Main Content */}

            <main className="admin-main">

                {/* Header */}

                <div className="dashboard-header">

    <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome to your user management dashboard</p>
    </div>

    {/* Header Actions */}
                    <div className="header-actions">

                        <button
                            className="refresh-btn"
                            onClick={refreshDashboard}
                            disabled={loading}
                        >
                            <RefreshCw size={18} />
                            Refresh
                        </button>

                        <button
                            className="logout-btn header-logout-btn"
                            onClick={() => navigate("/Login")}
                        >
                            <LogOut size={18} />
                            Logout
                        </button>

                    </div>

                </div>


                {error && (
                    <p className="dashboard-error">{error}</p>
                )}


                {/* Summary Cards */}

                <h2 className="section-heading">
                    Overview
                </h2>

                <div className="summary-cards">

                    <div className="summary-card total-card">

                        <div className="card-icon">
                            <Users size={28} />
                        </div>

                        <div>
                            <h3>Total Registered Users</h3>
                            <h2>{loading ? "..." : stats.totalUsers}</h2>
                        </div>

                    </div>


                    <div className="summary-card active-card">

                        <div className="card-icon">
                            <UserCheck size={28} />
                        </div>

                        <div>
                            <h3>Active Users</h3>
                            <h2>{loading ? "..." : stats.activeUsers}</h2>
                        </div>

                    </div>


                    <div className="summary-card new-card">

                        <div className="card-icon">
                            <UserPlus size={28} />
                        </div>

                        <div>
                            <h3>New Users</h3>
                            <h2>{loading ? "..." : stats.newUsers}</h2>
                        </div>

                    </div>


                    <div className="summary-card inactive-card">

                        <div className="card-icon">
                            <UserX size={28} />
                        </div>

                        <div>
                            <h3>Inactive Users</h3>
                            <h2>{loading ? "..." : stats.inactiveUsers}</h2>
                        </div>

                    </div>

                </div>


                {/* Dashboard analytics */}
                <div className="analytics-heading-row">
                    <h2 className="section-heading analytics-heading">Dashboard Analytics</h2>
                    <div className="date-filter" role="group" aria-label="Filter registration analytics by period">
                        {[{ value: "today", label: "Today" }, { value: "week", label: "This Week" }, { value: "month", label: "This Month" }, { value: "year", label: "This Year" }].map((period) => (
                            <button
                                key={period.value}
                                type="button"
                                className={`date-filter-button${selectedPeriod === period.value ? " selected" : ""}`}
                                aria-pressed={selectedPeriod === period.value}
                                onClick={() => setSelectedPeriod(period.value)}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="dashboard-content">
                    <section className="analytics-card chart-section">
                        <h2>User Activity Distribution</h2>
                        {loading ? <p className="chart-message">Loading chart...</p> : error ? (
                            <p className="chart-message dashboard-error">{error}</p>
                        ) : (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="46%"
                                            outerRadius="68%"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                            labelLine={false}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={entry.name} fill={COLORS[index]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip formatter={(value, name) => [`${value} users`, name]} />
                                        <ChartLegend verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>

                    <section className="analytics-card chart-section">
                        <h2>{({ today: "Today's", week: "Weekly", month: "Monthly", year: "Yearly" })[selectedPeriod]} Registrations</h2>
                        <p className="registration-total">{analyticsLoading ? "Loading total…" : `${registrationAnalytics.totalRegistrations} registrations in this period`}</p>
                        {analyticsLoading ? <p className="chart-message">Loading registrations...</p> : analyticsError ? (
                            <p className="chart-message dashboard-error">{analyticsError}</p>
                        ) : (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={registrationAnalytics.chartData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                        <ChartTooltip formatter={(value) => [`${value}`, "Registrations"]} />
                                        <ChartLegend />
                                        <Bar dataKey="registrations" name="Registrations" fill="green" radius={[7, 7, 0, 0]} maxBarSize={38} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>
                </div>


               

            </main>

        </div>

    );

}

export default AdminDashboard;
