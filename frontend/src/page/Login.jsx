import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import StudentDash from "../assets/logo.png"

export default function Login() {
    const { login } = useAuth();
    const [loginEmail, setLoginEmail] = React.useState();
    const [disable, setDisable] = React.useState(false)
    const navigate = useNavigate();

    function handleLogin(formData) {

        axios.post("http://localhost:5000/api/login", {
            username: formData.get("username"),
            password: formData.get("password")
        }, {
            withCredentials: true
        })
            .then((res) => {

                if (res.data[0] == "✅ Login successful") {
                    login(res.data[1])
                    navigate("/branch")
                }
                else {
                    setLoginEmail(res.data[0])
                }

            }).catch((err) => {
                if (err.response.status === 429) {
                    console.log("Rate limit exceeded. Retry after:", err.response.headers['retry-after']);
                    setDisable(true)
                    alert(err.response.data.message);
                }

            })

    }

    return (
        <div className="login-signup">
            <div className="container">
                <img style={{ width: "270px", height: "80px", margin: "20px 10px 2px 10px" }} src={StudentDash} alt="StudentDash" />

                <div className="form-container">
                    <div className="form login-form">
                        <h2>Login</h2>
                        <form action={handleLogin}>
                            <label>Username</label>
                            <input type="text" placeholder="Enter username" required name="username" />
                            <label>Password</label>
                            <input type="password" placeholder="Enter password" required name="password" />
                            <button className={!disable ? "submit" : "disabled"}
                                disabled={disable}>Login</button>

                        </form>
                        <br />
                        <span style={{ color: "red" }}>{loginEmail}</span>
                    </div>

                </div>
            </div>
        </div>
    )
}   