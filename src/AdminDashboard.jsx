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
    const [monthlyRegistrations, setMonthlyRegistrations] = useState([]);
    const [monthlyLoading, setMonthlyLoading] = useState(true);
    const [monthlyError, setMonthlyError] = useState("");

    const navigate = useNavigate();

    // Refresh both dashboard statistics and registration analytics together.
    const fetchDashboardStats = async () => {
        setLoading(true);
        setMonthlyLoading(true);
        setError("");
        setMonthlyError("");

        const apiBase = "https://simple-login-server-nda4.onrender.com";
        const [statsResult, monthlyResult] = await Promise.allSettled([
            fetch(`${apiBase}/api/dashboard-stats`),
            fetch(`${apiBase}/api/monthly-registrations`)
        ]);

        if (statsResult.status === "fulfilled") {
            try {
                const response = statsResult.value;
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Unable to fetch dashboard data");
                setStats(data);
            } catch (fetchError) {
                setError(fetchError.message || "Unable to fetch dashboard data");
            }
        } else {
            setError(statsResult.reason?.message || "Unable to fetch dashboard data");
        }

        if (monthlyResult.status === "fulfilled") {
            try {
                const response = monthlyResult.value;
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Unable to fetch monthly registrations");
                if (!Array.isArray(data)) throw new Error("Invalid monthly registration data");
                setMonthlyRegistrations(data);
            } catch (fetchError) {
                setMonthlyError(fetchError.message || "Unable to fetch monthly registrations");
            }
        } else {
            setMonthlyError(monthlyResult.reason?.message || "Unable to fetch monthly registrations");
        }

        setLoading(false);
        setMonthlyLoading(false);
    };

    useEffect(() => {
        const timer = window.setTimeout(fetchDashboardStats, 0);
        return () => window.clearTimeout(timer);
    }, []);

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

                <button
                    className="logout-btn"
                    onClick={() => navigate("/Login")}
                >
                    <LogOut size={20} />
                    Logout
                </button>

            </aside>


            {/* Main Content */}

            <main className="admin-main">

                {/* Header */}

                <div className="dashboard-header">

                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Welcome to your user management dashboard</p>
                    </div>

                    <button
                        className="refresh-btn"
                        onClick={fetchDashboardStats}
                        disabled={loading}
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>

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
                <h2 className="section-heading analytics-heading">Dashboard Analytics</h2>
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
                        <h2>Monthly Registrations</h2>
                        {monthlyLoading ? <p className="chart-message">Loading registrations...</p> : monthlyError ? (
                            <p className="chart-message dashboard-error">{monthlyError}</p>
                        ) : (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyRegistrations} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                        <ChartTooltip formatter={(value) => [`${value}`, "Registrations"]} />
                                        <ChartLegend />
                                        <Bar dataKey="registrations" name="Registrations" fill="#c79520" radius={[7, 7, 0, 0]} maxBarSize={38} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>
                </div>


                {/* View All Users Button */}

                {/* <div className="view-users-section">

                    <button
                        onClick={() => navigate("/Dashboard")}
                    >
                        View All Registered Users
                    </button>

                </div> */}

            </main>

        </div>

    );

}

export default AdminDashboard;
