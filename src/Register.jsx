
import { useState, useEffect } from "react";
import "./Register.css";
import { Eye, EyeOff, X } from "lucide-react";
import backgroundImage from "./assets/blooming-flowers.jpg";
import { useNavigate } from "react-router-dom";

function Register({
    isEdit = false,
    user = null,
    onClose,
    onUpdated
}) {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showpassword, setshowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [saving, setSaving] = useState(false);

    // Fill the form when editing an existing user
    useEffect(() => {
        if (isEdit && user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setUsername(user.username || "");
            setPassword(user.password || "");
            setPasswordError("");
            setshowPassword(false);
        }
    }, [isEdit, user]);

    const validatePassword = (value) => {
        if (value.length < 8) {
            return "Length should be at least 8 characters";
        }

        if (!/[a-z]/.test(value)) {
            return "Password must have at least 1 small letter";
        }

        if (!/[A-Z]/.test(value)) {
            return "Password must have at least 1 capital letter";
        }

        if (!/[0-9]/.test(value)) {
            return "Password must have at least 1 numerical number";
        }

        if (!/[$%@!&*?#]/.test(value)) {
            return "Password must have at least 1 special character";
        }

        return "";
    };

    const validateEmail = (value) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value.trim()) {
            return "Please enter your email address.";
        }

        if (!emailPattern.test(value.trim())) {
            return "Please enter a valid email address.";
        }

        return "";
    };

    const isFormValid =
        name.trim() !== "" &&
        email.trim() !== "" &&
        validateEmail(email) === "" &&
        username.trim() !== "" &&
        password !== "" &&
        validatePassword(password) === "";

    // Check duplicate emails only during new registration
    const checkEmail = async () => {
        if (isEdit || !email.trim()) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/check-email",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase()
                    })
                }
            );

            const data = await response.json();

            if (response.status === 409 && data.exists) {
                alert(data.message);
            }
        } catch (error) {
            console.error("Email check error:", error);
            alert("Unable to check email. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            setPasswordError(validatePassword(password));

            if (!name.trim() || !email.trim() || !username.trim() || !password) {
                alert("Please fill all the fields");
            } else if (validateEmail(email)) {
                alert(validateEmail(email));
            }

            return;
        }

        setPasswordError("");
        setSaving(true);

        const formData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            username: username.trim(),
            password: password
        };

        try {
            // Update an existing user
            // or create a new user
            const url = isEdit
                ? `http://localhost:5000/api/users/${user._id}`
                : "http://localhost:5000/api/register";

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to save details");
                return;
            }

            if (isEdit) {
                alert("User updated successfully");

                // Send the updated user to Dashboard
                onUpdated(data.user);
            } else {
                alert(data.message || "Registration successful!");

                setName("");
                setEmail("");
                setUsername("");
                setPassword("");
                setPasswordError("");

                navigate("/Login");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Unable to connect to server");
        } finally {
            setSaving(false);
        }
    };

    // Popup mode when editing from Dashboard
    if (isEdit) {
        return (
            <div
                className="edit-modal-overlay"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget && !saving) {
                        onClose();
                    }
                }}
            >
                <div
                    className="reg edit-reg"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className="close-edit-modal"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close edit form"
                    >
                        <X size={25} />
                    </button>

                    <h1>Edit User</h1>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="edit-name">Full Name</label>
                        <input
                            id="edit-name"
                            type="text"
                            placeholder="Enter your Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <label htmlFor="edit-email">Email</label>
                        <input
                            id="edit-email"
                            type="email"
                            placeholder="Enter your email id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="edit-username">Username</label>
                        <input
                            id="edit-username"
                            type="text"
                            placeholder="Enter your Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <label htmlFor="edit-password">Password</label>

                        <div className="password-box">
                            <input
                                id="edit-password"
                                type={showpassword ? "text" : "password"}
                                placeholder="Enter strong password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError(
                                        validatePassword(e.target.value)
                                    );
                                }}
                                required
                            />

                            <button
                                type="button"
                                className="eye-icon"
                                onClick={() =>
                                    setshowPassword(!showpassword)
                                }
                                aria-label={
                                    showpassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showpassword ? <Eye /> : <EyeOff />}
                            </button>
                        </div>

                        {passwordError && (
                            <p className="password-error">
                                {passwordError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!isFormValid || saving}
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Normal registration page
    return (
        <div
            className="Back-image"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="reg">
                <h1>Register</h1>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter your Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={checkEmail}
                        required
                    />

                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label htmlFor="password">Password</label>

                    <div className="password-box">
                        <input
                            id="password"
                            type={showpassword ? "text" : "password"}
                            placeholder="Enter strong password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError(
                                    validatePassword(e.target.value)
                                );
                            }}
                            required
                        />

                        <button
                            type="button"
                            className="eye-icon"
                            onClick={() =>
                                setshowPassword(!showpassword)
                            }
                            aria-label={
                                showpassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showpassword ? <Eye /> : <EyeOff />}
                        </button>
                    </div>

                    {passwordError && (
                        <p className="password-error">
                            {passwordError}
                        </p>
                    )}

                    <button type="submit" disabled={!isFormValid || saving}>
                        {saving ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="bottom-login">
                    <p>
                        Already Registered?
                        <button
                            type="button"
                            className="login"
                            onClick={() => navigate("/Login")}
                        >
                            Login Here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
