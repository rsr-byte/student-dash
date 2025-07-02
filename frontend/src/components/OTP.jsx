import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../page/AuthProvider";

function OTP() {

    const { login } = useAuth();
    const navigate = useNavigate()
    const [otpTime, setOtpTime] = useState(0)
    const [active, setActive] = useState(false)

    useEffect(() => {
        otp_request();

        const interval = setInterval(() => {
            setOtpTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (otpTime > 180) {
            setActive(true);
            setOtpTime(0)
        }
    }, [otpTime]);


    function otp_request() {
        setActive(false)
        axios.get("/api/auth-otp", {
            withCredentials: true
        })
            .then((res) => {
                if (res.data === "user not exists") {
                    navigate("/")
                }

            }).catch((err) => {
                console.log(err);

            })
    }


    function handleOTP(formData) {
        axios.post("/api/auth-otp", {
            otp: formData.get("otp")
        }, { withCredentials: true })
            .then((res) => {
                if (res.data[0] === "OTP verified") {
                    login(res.data[1])
                    navigate("/branch")
                }
                else {
                    console.log("check otp");

                }

            }).catch((err) => {
                console.log(err)

            })

    }

    return (
        <>
            <div className="otp">
                <form action={handleOTP}>
                    <h2>OTP Verification</h2>
                    <p>Enter the 6-digit code sent to your Email</p>
                    <div className="otp-input">
                        <input type="number" min={0} name="otp" />
                    </div>
                    <div className="otp-btn">
                        <button type="submit">Verify</button>
                        <button
                            type="button"
                            className={active ? "active" : "disabled"}
                            disabled={!active}
                            onClick={() => otp_request()}
                        >
                            Resend
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default OTP