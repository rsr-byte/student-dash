import React from "react";


export default function DataTable({ grades }) {

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

  


  return (

    <>

      {grades.length > 0 && (
        <div className="std project-info">
          <h3>Subject-wise Grades</h3>
          <table className="table table-hover grade_table " style={{ textAlign: "start" }}>
            <thead>
              <tr>
                <th style={{ display: "none" }}>{Math.random()}</th>
                <th>Subject</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ display: "none" }}>{Math.random()}</td>
                  <td >{item.subject}</td>
                  <td ><p style={getGradeColor(item.grade.trim())} className="grade_background">{item.grade.trim()}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </>
  )
}