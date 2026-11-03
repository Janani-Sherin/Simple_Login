
import { useState, useEffect } from "react";
import "./Dashboard.css";
import Register from "./Register";
import backgroundImage from "./assets/blooming-flowers.jpg";

function Dashboard() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingEdit, setLoadingEdit] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(
                "https://simple-login-server-nda4.onrender.com/api/users"
            );

            const data = await response.json();

            if (response.ok) {
                setUsers(data);
            } else {
                alert(data.message || "Unable to fetch users");
            }
        } catch (error) {
            console.error(error);
            alert("Unable to connect to server");
        }
    };



    const handleEdit = async (user) => {
        setLoadingEdit(true);

        try {
            const response = await fetch(
                `https://simple-login-server-nda4.onrender.com/api/users/${user._id}/edit`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to fetch user details");
                return;
            }

            // Open the popup with the user's existing credentials
            setSelectedUser(data.user);
        } catch (error) {
            console.error("Edit error:", error);
            alert("Unable to connect to server");
        } finally {
            setLoadingEdit(false);
        }
    };


    // Update the table after the popup successfully saves
    const handleUpdated = (updatedUser) => {
        setUsers((previousUsers) =>
            previousUsers.map((user) =>
                user._id === updatedUser._id
                    ? { ...user, ...updatedUser }
                    : user
            )
        );

        setSelectedUser(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            const response = await fetch(
                `https://simple-login-server-nda4.onrender.com/api/users/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (response.ok) {
                setUsers((previousUsers) =>
                    previousUsers.filter((user) => user._id !== id)
                );

                alert("User deleted successfully");
            } else {
                alert(data.message || "Unable to delete user");
            }
        } catch (error) {
            console.error(error);
            alert("Unable to connect to server");
        }
    };

    return (
        <>
            
            <div className="wallpaper"
            style={{ backgroundImage: `url(${backgroundImage})` }}>
                <h1>Registered Users</h1>

                <div className="dashboard">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>Password</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user._id}>
                                    <td>{index + 1}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username}</td>
                                    <td className="password-column">
                                        {"•".repeat(8)}
                                    </td>

                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(user)}
                                            disabled={loadingEdit}
                                        >
                                            {loadingEdit ? "Loading..." : "Edit"}
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5">
                                        No registered users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <Register
                    isEdit={true}
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdated={handleUpdated}
                />
            )}
        </>
    );
}

export default Dashboard;
