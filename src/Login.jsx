import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import backgroundImage from "./assets/blooming-flowers.jpg";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [display, setDisplay] = useState(true);
    const [showpassword, setshowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const validatePassword = (password) => {
        if (password.length < 8) {
            return ("Length should be atleast 8 characters")
        }
        if (!/[a-z]/.test(password)) {
            return ("Password must have atleast 1 small letter")
        }
        if (!/[A-Z]/.test(password)) {
            return ("Password must have atleast 1 capital letter")
        }
        if (!/[0-9]/.test(password)) {
            return ("Password must have atleast 1 numerical number")
        }
        if (!/[$%@!&*?#]/.test(password)) {
            return ("Password must have atleast 1 special character")
        }
        return "";


    }

    const isFormValid =
        email.trim() !== "" &&
        password !== "" &&
        validatePassword(password) === "";

    const handleEmail = (e) => {
        setEmail(e.target.value)

    }
    // const handlePassword = (e) => {
    //     setPassword(e.target.value)
    // }

    const handleDisplay = async (e) => {
        e.preventDefault();

        // const error=validatePassword(error);
        // if(error){
        //     setPasswordError(error);
        //     return;
        // }



        if (!email.trim() || !password) {
            alert("please fill all the fields");
        }

        const error = validatePassword(password);
        if (error) {
            setPasswordError(error);
            return;
        }


        const logindata = {
            email,
            password,
        };

        try {

            const response = await fetch("https://simple-login-server-nda4.onrender.com/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(logindata)
            });

            const data = await response.json();

            alert(data.message);

            if (response.ok) {
                setDisplay(true)

                navigate("/AdminDashboard");
            } else {
                setDisplay(false);
            }

        }
        catch (error) {
            alert("Unable to connect Server")

        }
        setEmail("");
        setPassword("");

    }
    return (
        <>

            <div className="loginform"
                style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div>
                    <h1>Login</h1><br></br>

                    <label htmlFor="email">Email Address</label><br></br>
                    <input type="text" placeholder="Enter Mail Id" value={email} onChange={(e) => handleEmail(e)}></input><br></br>
                    <br></br>
                    <label htmlFor="Password">Password</label><br></br>

                    <div className="password-box">
                        <input
                            type={showpassword ? "text" : "password"}
                            placeholder="Enter strong password"
                            value={password}
                            onChange={(e) => {
                                const value = e.target.value;
                                setPassword(value)
                                setPasswordError(validatePassword(value))
                            }}
                        />
                        <button
                            type="button"
                            className="eye-icon"
                            onClick={() => setshowPassword(!showpassword)}
                        >
                            {showpassword ? <Eye /> : <EyeOff />}
                        </button>
                    </div>
                    {passwordError && (
                        <p style={{ color: "red", fontSize: "15px", paddingLeft: "20px" }}>
                            {passwordError}
                        </p>
                    )}
                    <button
                        type="button"
                        className="login"
                        onClick={handleDisplay}
                        disabled={!isFormValid}
                    >
                        Login
                    </button>
                    <p>New User
                        <button className="register" onClick={() => navigate("/Register")} >Register Now</button>
                    </p>

                </div>
            </div>
        </>
    )
}
export default Login;