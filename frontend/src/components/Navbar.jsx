import React from "react"
import { NavLink } from "react-router-dom"
import StudentDash from "../assets/logo.png"

export default function Navbar() {

    const [showNav, setShowNav] = React.useState(false);

    const toggleNav = () => {
        setShowNav(prev => !prev);
    };

    return (

        <nav className="navbar">
            <div className="logo"><NavLink to="/branch" aria-current="page"><img style={{ width: "210px" }} src={StudentDash} alt="StudentDash" /></NavLink></div>
            <ul className={`nav-links ${showNav ? 'show' : ''}`} id="navLinks">
                <NavLink to="/branch/overview" aria-current="page">Dashboard
                </NavLink>
                <NavLink to="/branch/student_performance" aria-current="page">Student-wise
                </NavLink>
                <NavLink to="/branch/subject_wise_performance" aria-current="page">Subject-wise
                </NavLink>
                <NavLink to="/branch/about" aria-current="page">About Us
                </NavLink>
                {/* <NavLink to="/branch/profile" aria-current="page">Profile</NavLink> */}

            </ul>

            <div className="hamburger" id="hamburger" onClick={toggleNav}>
                ☰
            </div>
        </nav>
    )
}