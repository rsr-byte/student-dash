import React from "react";
import Navbar from "../components/Navbar";
import Select from 'react-select';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";

function Profile() {


    const [userName, setUserName] = React.useState()
    const [avatar, setAvatar] = React.useState()
    const [visibility, setVisibility] = React.useState()
    const [courseType, setCourseType] = React.useState()
    const [resultType, setResultType] = React.useState()
    const [semester, setSemester] = React.useState()

    const navigate = useNavigate();




    const result_type = [
        { value: "REGULAR", label: "REGULAR" },
        { value: "REGULAR RV", label: "REGULAR RV" },
        { value: "BACK PAPER", label: "BACK PAPER" },
        { value: "BACK PAPER RV", label: "BACK PAPER RV" }
    ]

    const course = [
        { value: "CE", label: "CE" },
        { value: "CSE", label: "CSE" },
        { value: "CY", label: "CY" },
        { value: "EC", label: "EC" },
        { value: "EE", label: "EE" },
        { value: "EIC", label: "EIC" },
        { valueL: "IT", label: "IT" },
        { value: "ME", label: "ME" }
    ]
    const sem = [
        { value: "I", label: "I" },
        { value: "II", label: "II" },
        { value: "III", label: "III" },
        { value: "IV", label: "IV" }
    ]

    React.useEffect(() => {
        fetch_profile()
    }, [])

    function fetch_profile() {
        axios.get("/api/profile", {
            withCredentials: true
        })
            .then((res) => {

                if (res.data !== "Unauthorized") {

                    setUserName(res.data["name"])
                    setAvatar(res.data["avatar"])
                    setVisibility(res.data["visibility"])
                }
                else {
                    navigate("/");
                }
            })
            .catch((err) =>
                console.log(err)
            )
    }



    function logout() {

        axios.post("/api/logout", {}, { withCredentials: true })
            .then((res) => {
                if (res.data === "Logged out") {
                    navigate("/")
                }
            })
            .catch((err) => console.log(err)
            )
    }

    function data_visibility(identity) {

        window.alert(identity)

        axios.post("/api/data_visibility", { "identity": identity }, { withCredentials: true })
            .then((res) => {
                setVisibility(res.data)
            })
            .catch((err) => {
                console.log(err);

            })
    }

    function handleCourseType(e) {
        console.log(e.value);

        setCourseType(e.value)
    }

    function handleResultType(e) {
        console.log(e.value);

        setResultType(e.value)
    }
    function handleSemester(e) {
        console.log(e.value);

        setSemester(e.value)
    }

    function handleSubmit() {
        console.log("button click");

        axios.post("/api/data_updation", { "resultType": resultType, "semester": semester, "course": courseType }, { withCredentials: true })
            .then((res) => {
                console.log(res.data);

            }).catch((err) => {
                console.log(err);

            })
    }


    return (
        <>
            <div>
                <Navbar />


                <div className='std project-info form'>
                    <Avatar src={avatar} page="studentPerformance" />
                    <h2 >{userName}</h2>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <button style={{ width: "150px", height: "50px", margin: "5px", display: `${visibility === true ? "flex" : "none"}` }} onClick={() => data_visibility(false)}><i class="fa-solid fa-eye"> Hide identity</i></button>
                        <button style={{ width: "150px", height: "50px", margin: "5px", display: `${visibility === false ? "flex" : "none"}` }} onClick={() => data_visibility(true)}><i class="fa-solid fa-eye-slash"> Unhide identity</i></button>
                        <button style={{ width: "150px", height: "50px", margin: "5px" }} onClick={() => logout()}><i class="fa-solid fa-right-from-bracket"> Logout</i></button>
                    </div>
                </div>

                {/* <div className="std project-info form" >
                    <h3>Request for data Updation</h3>

                    <div className='dataupdationform'>

                        <Select
                            className='select_student'
                            options={result_type}
                            placeholder="Select Result Type"
                            onChange={handleResultType}
                            required
                        />
                        <Select
                            className='select_student'
                            options={course}
                            placeholder="Select Course"
                            onChange={handleCourseType}
                            required
                        />
                        <Select
                            className='select_student'
                            options={sem}
                            placeholder="Select Sem"
                            onChange={handleSemester}
                            required
                        />

                        <button style={{ width: "150px", height: "50px" }} onClick={() => handleSubmit()}>Submit</button>
                    </div> */}


                {/* </div> */}
            </div >
        </>
    )
}

export default Profile