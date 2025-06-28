import { useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './App.css';
import DataTable from '../components/DataTable';
import CGPA from '../components/CGPA';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import StudentPerformanceImg from "../assets/student-performance.png"
import { useNavigate } from "react-router-dom";
import Avatar from '../components/Avatar';



const getGradeColor = (grade) => {
    switch (grade) {
        case "A+":
            return "bg-green-100 text-green-800"
        case "A":
            return "bg-blue-100 text-blue-800"
        case "B+":
            return "bg-yellow-100 text-yellow-800"
        case "B":
            return "bg-orange-100 text-orange-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

const getCGPAColor = (cgpa) => {
    if (cgpa >= 9.0) return "text-green-600"
    if (cgpa >= 8.0) return "text-blue-600"
    if (cgpa >= 7.0) return "text-yellow-600"
    return "text-orange-600"
}

function StudentPerformance() {
    const [stdname, setStdName] = useState("");
    const [options, setOptions] = useState([]);
    const [grades, setGrades] = useState([]);
    const [semesterData, setSemesterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState()
    const navigate = useNavigate();


    async function fetch_data() {
        await axios.get("/api/home", {
            withCredentials: true
        })
            .then((response) => {
                if (response.data !== "Unauthorized") {

                    const fetchedOptions = response.data["name"].map(name => ({
                        value: name,
                        label: name
                    }));
                    setOptions(fetchedOptions);
                }
                else {

                    navigate("/");
                }
            })
            .catch((error) => {
                console.error("Error:", error)
            });
    }

    function handleChange(data) {
        setLoading(true);
        setStdName(data.value)
        axios.post("/api/grade", data.value, {
            withCredentials: true
        })
            .then((response) => {
                if (response.data !== "Unauthorized") {

                    let subjectsArray = response.data[0];
                    let gradeArray = response.data[1];
                    let rawArray = response.data[2];
                    setAvatar(response.data[3])

                    let semesterData = [];
                    for (let i = 1; i < rawArray.length; i++) {
                        const value = rawArray[i];
                        if (!isNaN(parseFloat(value)) && value.trim() !== '') {
                            semesterData.push({ semester: `Semester ${i}`, sgpa: value });
                        } else {
                            semesterData.push({ semester: `Semester ${i}`, sgpa: "-" });
                        }
                    }

                    setSemesterData(semesterData);

                    let combinedData = subjectsArray.map((subject, index) => ({
                        subject,
                        grade: gradeArray[index]
                    }));
                    setGrades(combinedData);

                    setLoading(false);
                }
                else {
                    navigate("/");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                setLoading(false);
            });
    }


    return (

        <div >
            <Navbar />

           
            <div className="project-info">

                <img style={{ width: "100px" }} src={StudentPerformanceImg} />
                <h3 style={{ display: "inline-block", margin: "20px" }}>Student Performance</h3>

                <div className='dataupdationform'>

                    <div style={{ padding: "1% 11%" }}>
                        <p >Choose a student from the dropdown to view their analysis</p>

                        <Select
                            className='select_student'
                            options={options}
                            onFocus={fetch_data}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="project-info" style={{ display: `${stdname.length === 0 ? "block" : "none"}` }}>
                <h4>No Student Selected</h4>
                <p>Please select a student from the dropdown above to view their analysis</p>
            </div>


            {loading ? (
                <Loader />
            ) : (
                <div style={{ display: `${stdname.length !== 0 ? "block" : "none"}` }}>
                    <div className='std project-info'>
                        <Avatar src={avatar} page="studentPerformance" stdname={stdname} />
                        <h2 >{stdname}</h2>

                    </div>
                    <CGPA cgpaData={semesterData} />


                    <DataTable grades={grades} />

                </div>
            )}
        </div>
    )
}

export default StudentPerformance;
