import React from "react";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import axios from "axios";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import PerformanceImg from "../assets/performance.png"
import { useNavigate } from "react-router-dom";

export default function SubjectWisePerformance() {
    const [subOptions, setSubOptions] = React.useState([]);
    const [selectedSubOptions, setSelectedSubOptions] = React.useState([]);
    const [selectedGradeOptions, setSelectedGradeOptions] = React.useState([]);
    const [filterStudent, setFilterStudent] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    const grade_list = ["A++", "A+", "A", "B+", "B", "C+", "C", "D+", "D", "E+", "E", "F"];
    const gradeOptions = grade_list.map((g) => ({
        value: g,
        label: g
    }));


    const getGradeColor = (grade) => {
        const gradeColors = {
            "A++": { "background": "rgb(61 227 115)", "color": "rgb(0 60 0)" },
            "A+": { "background": "rgb(141 231 141)", "color": "rgb(0 70 0)" },
            "A": { "background": "rgb(112 229 112)", "color": "rgb(0 70 0)" },
            "B+": { "background": "rgb(166 225 56)", "color": "rgb(80 60 0)" },
            "B": { "background": "rgb(215 208 117)", "color": "rgb(80 60 0)" },
            "C+": { "background": "rgb(252 240 186)", "color": "rgb(90 60 0)" },
            "C": { "background": "rgb(158 148 135)", "color": "rgb(70 40 0)" },
            "D+": { "background": "rgb(157 137 115)", "color": "rgb(70 40 0)" },
            "D": { "background": "rgb(157 144 144)", "color": "rgb(90 30 30)" },
            "E+": { "background": "rgb(157 135 135)", "color": "rgb(90 30 30)" },
            "E": { "background": "rgb(157 124 124)", "color": "rgb(90 20 20)" },
            "F": { "background": "rgb(247 68 68)", "color": "rgb(90 0 0)" }
        };

        return gradeColors[grade] || { "background": "rgb(255, 255, 255)", "color": "rgb(0, 0, 0)" };
    }



    const animatedComponents = makeAnimated();

    async function fetch_subject_wise_data() {
        await axios.get("/api/home", {
            withCredentials: true
        })
            .then((res) => {
                if (res.data !== "Unauthorized") {

                    const fetchOptions = res.data["subject"].map((sub) => ({
                        value: sub,
                        label: sub
                    }));
                    setSubOptions(fetchOptions);
                }
                else {
                    navigate("/");
                }
            })
            .catch((err) => {
                console.log(err);
            });


    }

    function handleSubChange(selected) {
        setSelectedSubOptions(selected);
    }

    function handleGradeChange(selected) {
        setSelectedGradeOptions(selected);
    }

    React.useEffect(() => {
        if (selectedGradeOptions.length > 0 && selectedSubOptions.length > 0) {
            const selectedSubValue = selectedSubOptions.map(opt => opt.value);
            const selectedGradeValue = selectedGradeOptions.map(opt => opt.value);
            const selectedSubjectGrade = {
                subjects: selectedSubValue,
                grades: selectedGradeValue,
            };

            setLoading(true);

            axios.post("/api/subject_wise_performance", selectedSubjectGrade, {
                withCredentials: true
            })
                .then((res) => {
                    if (res.data !== "Unauthorized") {

                        setFilterStudent(res.data);
                        setLoading(false);
                    }
                    else {
                        navigate("/");
                    }
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        }
    }, [selectedSubOptions, selectedGradeOptions]);


    return (
        <div >
            <Navbar />
            <div className="project-info">


                <img style={{ width: "100px" }} src={PerformanceImg} />
                <h4 style={{ display: "inline-block", marginTop: "20px", fontWeight: "500" }}>Subject Wise Performance</h4>

                <div className='dataupdationform'>

                    <div style={{ padding: "1% 11%" }}>

                        <Select
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={subOptions}
                            onFocus={fetch_subject_wise_data}
                            onChange={handleSubChange}
                            placeholder="Select one or more subjects..."
                        />
                        <br />
                        <Select
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={gradeOptions}
                            onChange={handleGradeChange}
                            placeholder="Select one or more grades..."
                        />
                        <br />
                    </div>
                </div>
            </div>
            {loading ? (
                <Loader />
            ) : (
                filterStudent.length > 0 && (
                    <div className='std project-info'>
                        <table className="table table-hover table-striped" style={{ textAlign: "start" }}>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Subject</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterStudent.map((student, idx) => (
                                    student.matched_subjects.map(([subject, grade], i) => (
                                        <tr key={`${idx}-${i}`}>
                                            <td>{i === 0 ? student.name : ''}</td>
                                            <td>{subject}</td>
                                            <td>
                                                <p style={getGradeColor(grade.trim())} className="grade_background">{grade.trim()}</p>
                                            </td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>

                    </div>
                )
            )}
        </div>

    );
}
