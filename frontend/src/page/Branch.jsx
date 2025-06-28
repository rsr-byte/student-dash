import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setUserCookie } from "../components/SetUserCookie";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Cookies from 'js-cookie';
import { useAuth } from "./AuthProvider";

const BranchSelector = () => {
  const navigate = useNavigate();
  const { login } = useAuth()
  const cookies = Cookies.get("collection_name");

  if (cookies == "undefined") {
    navigate("/")
  }

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const handleImageClick = async (dbName) => {

    try {


      setUserCookie("collection_name", dbName)
      login("dummyToken")
      navigate("/branch/overview")


    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const branchNameDict = [
    { name: "Civil", shortName: "CE", icon: "fa-drafting-compass" },
    { name: "Computer Science and Engineering", shortName: "CS", icon: "fa-laptop-code" },
    { name: "Cyber Security", shortName: "CY", icon: "fa-shield-alt" },
    { name: "Electrical", shortName: "EE", icon: "fa-bolt" },
    { name: "Electronics and Communication", shortName: "EC", icon: "fa-microchip" },
    { name: "Electronics and Instrumentation", shortName: "EI", icon: "fa-gauge-high" },
    { name: "Information Technology", shortName: "IT", icon: "fa-network-wired" },
    { name: "Mechanical", shortName: "ME", icon: "fa-cogs" }
  ];

  return (
    <>
      <section id="branch-selection" className="branch-section" data-aos="fade-up">

        <h2 data-aos="fade-down">
          <i className="fas fa-graduation-cap" style={{ color: "#0056b3", marginBottom: "8px" }}></i><br />
          Select Your Branch
        </h2>
        <p className="sub-heading" data-aos="fade-in" data-aos-delay="200">
          Batch 2023–27<br />
          Choose your stream to explore tailored content and progress tracking.
        </p>


        <div className="branch-grid">
          {branchNameDict.map((branch, index) => (

            <div key={index} className="branch-card" onClick={() => handleImageClick(branch.shortName)} >
              <i className={`fas ${branch.icon} branch-icon`}></i>

              {branch.name}
            </div>
          ))}
        </div>

      </section>
    </>
  );
};

export default BranchSelector;
