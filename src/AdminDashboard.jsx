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
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
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

    const navigate = useNavigate();

    // Fetch Dashboard Statistics
    const fetchDashboardStats = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "https://simple-login-server-nda4.onrender.com/api/dashboard-stats"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to fetch dashboard data");
            }

            setStats(data);

        } catch (error) {

            console.log("Dashboard error:", error);
            setError(error.message);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    // Calculate percentages for User Statistics
    const activePercentage = stats.totalUsers > 0
        ? (stats.activeUsers / stats.totalUsers) * 100
        : 0;

    const inactivePercentage = stats.totalUsers > 0
        ? (stats.inactiveUsers / stats.totalUsers) * 100
        : 0;

    // Format Registration Date
    const formatDate = (date) => {

        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    };

    return (

        <div className="admin-dashboard">

            {/* Sidebar */}

            <aside className="admin-sidebar">

                <h2>Admin Panel</h2>

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


                {/* User Statistics and Recent Registrations */}

                <div className="dashboard-content">


                    {/* User Statistics */}

                    <div className="statistics-section">

                        <h2>User Statistics</h2>

                        {loading ? (
                            <p>Loading statistics...</p>
                        ) : (

                            <>

                                <div className="statistics-info">
                                    <span>Active Users</span>
                                    <strong>{stats.activeUsers}</strong>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className="active-progress"
                                        style={{
                                            width: `${activePercentage}%`
                                        }}
                                    ></div>
                                </div>

                                <p className="percentage">
                                    {activePercentage.toFixed(1)}% Active
                                </p>


                                <div className="statistics-info">
                                    <span>Inactive Users</span>
                                    <strong>{stats.inactiveUsers}</strong>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className="inactive-progress"
                                        style={{
                                            width: `${inactivePercentage}%`
                                        }}
                                    ></div>
                                </div>

                                <p className="percentage">
                                    {inactivePercentage.toFixed(1)}% Inactive
                                </p>

                                <div className="total-statistics">
                                    <span>Total Users</span>
                                    <strong>{stats.totalUsers}</strong>
                                </div>

                            </>

                        )}

                    </div>


                    {/* Recent Registrations

                    <div className="recent-section">

                        <h2>Recent Registrations</h2>

                        {loading ? (

                            <p>Loading registrations...</p>

                        ) : stats.recentRegistrations.length === 0 ? (

                            <p>No registrations found.</p>

                        ) : (

                            <div className="recent-table-container">

                                <table>

                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Username</th>
                                            <th>Registered Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {stats.recentRegistrations.map(
                                            (user, index) => (

                                                <tr key={user._id}>

                                                    <td>{index + 1}</td>

                                                    <td>{user.name}</td>

                                                    <td>{user.email}</td>

                                                    <td>{user.username}</td>

                                                    <td>
                                                        {formatDate(user.createdAt)}
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div> */}



                    {/* User Activity Pie Chart */}

                    <div className="recent-section chart-section">

                        <h2>User Activity Distribution</h2>

                        {loading ? (
                            <p>Loading chart...</p>
                        ) : (

                            <ResponsiveContainer width="100%" height={350}>

                                <PieChart>

                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(1)}%`
                                        }
                                    >

                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={COLORS[index]}
                                            />
                                        ))}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        )}

                    </div>


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
