import React from "react"
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import StudentDash from "../assets/logo.png"
import Team from "../components/Team";

export default function About() {
    React.useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true
        });
    }, []);
    return (<>
        <Navbar />
        <div className="about">

            <HeroSection img_tag={StudentDash} p_tag={"A platform to track academic progress — class-wise, student-wise, and subject-wise."} />


            <section className="project-info" data-aos="fade-up">
                <h2>What is StudentDash?</h2>
                <p>StudentDash is a simple and clean dashboard designed to help students to monitor semester-wise and subject-wise academic performance. Built with love by students for students.</p>
            </section>

            <section className="features" data-aos="fade-up">
                <h2>Key features</h2>
                <ul>
                    <li>📊 Class-wise data analysis</li>
                    <li>👨‍🎓 Individual student insights</li>
                    <li>📚 Subject-wise performance tracking</li>
                    <li>🎨 Responsive and modern UI</li>
                </ul>
            </section>


            <section id="who-we-are" className="about-section" data-aos="fade-up">
                <h2>Who We Are?</h2>
                <p>We are a group of passionate <b>Mechanical Engineering</b> students from GECA driven by curiosity and the desire to build real-world solutions. "College Students Dashboard" is our very first collaborative web project — born from the idea of helping students manage and visualize their academic journey better.</p>
                <p> As budding developers, this project is our first step toward mastering web technologies and contributing to the student community with meaningful tools.</p>
            </section>

            <section id="meet-the-team" className="team-section" data-aos="fade-up">
                <h2>Meet the Team</h2>

                <hr />
                <h3>Core Team</h3>
                <div className="team-members">
                    <Team name="Rajveer Singh" p="Project Lead <br /> Full-Stack Developer <br />Data Insights" />

                    <Team name="Hemant Junwal" p="Front-End UI Engineer" />
                </div>
                <br />
                <h3>Data Collection Team</h3>
                <div className="team-members">
                    <Team name="Rigved Sharma" />
                    <Team name="Nikhil Phulwari" />
                    <Team name="Yash Chhipa" />
                </div>
            </section>
 
            <section className="tech-stack" data-aos="fade-up">
                <h2>Tech Stack</h2>
                <p><i class="fa-brands fa-react"/> React | <i class="fa-solid fa-database"/> MongoDB | <i className="fa-brands fa-python" /> Python | <i className="fa-brands fa-github" /> GitHub</p>
            </section>

            <footer data-aos="fade-up">
                <p>Copyright © 2025</p>
            </footer>
        </div>

    </>

    )
}