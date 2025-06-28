import React from "react";

export default function CGPA({ cgpaData }) {

    const getCGPAColor = (cgpa) => {

        if (cgpa >= 9) {
            return { "background": "rgb(61 227 115)" }
        }
        if (cgpa >= 8) {
            return { "background": "rgb(166 225 56)" }
        }
        if (cgpa >= 7) {
            return { "background": "rgb(239 207 62)" }
        }
        if (cgpa >= 6) {
            return { "background": "rgb(157 137 115)" }
        }

        if (cgpa >= 5) {

            return { "background": "rgb(157 135 135)" }
        }

        else {
            return { "background": "" }
        }
    }

    return (
        <>

            {cgpaData.length > 0 && (
                <div className="std project-info">

                    <h3>Semester-wise SGPA performance</h3>

                    <table className="table table-hover ">
                        <thead>
                            <tr>
                                <th>Semester</th>
                                <th style={{ display: "none" }}>{Math.random()}</th>
                                <th>SGPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cgpaData.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ display: "none" }}>{Math.random()}</td>
                                    <td >{item.semester}</td>
                                    <td style={{ display: "none" }}>{Math.random()}</td>
                                    <td ><p style={getCGPAColor(parseFloat(item.sgpa))} className="cgpa">{item.sgpa}</p></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}
        </>
    )
}