import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Cookies from 'js-cookie';
import HeroSection from "../components/HeroSection";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import HorizontalBars from "../components/Charts";
import { Gauge} from '@mui/x-charts/Gauge';


export default function Overview() {
  const [data, setData] = useState();
  const [detail, setDetail] = useState({});
  const [branchName, setBranchName] = useState();
  const [branchIntro, setBranchIntro] = useState();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("REAP");
  const [hidden, setHidden] = useState(true);
  const [visibleProfiles, setVisibleProfiles] = useState()
  const [totalStudent, setTotalStudent] = useState()

  const navigate = useNavigate();

  const cookies = Cookies.get("collection_name");

  useEffect(() => {
    if (!cookies || cookies === "undefined") {
      console.log("sadasdasd");

      return;
    }

    switch (cookies) {
      case "CE":
        setBranchName("Civil Engineering");
        setBranchIntro("Building the future through structural innovation. Track academic performance and growth in the Civil Engineering department.");
        setHidden(false)
        break;
      case "ME":
        setBranchName("Mechanical Engineering");
        setBranchIntro("Designing, analyzing, and innovating. Track the academic journey of Mechanical Engineering students here.");
        setHidden(false)
        break;
      case "EC":
        setBranchName("Electronics & Communication Engineering");
        setBranchIntro("Exploring circuits and communication systems. This dashboard highlights the academic progress of EC students across semesters.");
        setHidden(false)
        break;
      case "CY":
        setBranchName("Cyber Security");
        setBranchIntro("Defending the digital world through secure systems and ethical practices. This dashboard provides academic insights for Cyber Security students across semesters and subjects.");
        setHidden(false)
        break;
      case "CS":
        setBranchName("Computer Science & Engineering");
        setBranchIntro("Powering the digital age with code and logic. View semester-wise academic performance in the CS department.");
        setHidden(false)
        break;
      case "IT":
        setBranchName("Information Technology");
        setBranchIntro("Focused on software, data, and systems. Monitor performance trends and academic insights in the IT department.");
        break;
      case "EI":
        setBranchName(" Electronics & Instrumentation Engineering");
        setBranchIntro("Precision, automation, and measurement. Analyze academic data for EI students with subject and semester insights.");
        break;
      case "EE":
        setBranchName("Electrical Engineering");
        setBranchIntro("From power systems to electronics. Get a complete overview of academic trends in the EE department.");
        setHidden(false)
        break;
      default:
        navigate("/")
        // return;
    }

    data_fetch()

  }, []);



    const getCGPAColor = (cgpa) => {

        if (cgpa >= 9) {
            return { "color": "rgb(61 227 115)" }
        }
        if (cgpa >= 8) {
            return { "color": "rgb(166 225 56)" }
        }
        if (cgpa >= 7) {
            return { "color": "rgb(239 207 62)" }
        }
        if (cgpa >= 6) {
            return { "color": "rgb(157 137 115)" }
        }

        if (cgpa >= 5) {

            return { "color": "rgb(157 135 135)" }
        }

        else {
            return { "color": "" }
        }
    }


  function data_fetch() {

    axios.get("/api/plots", {
      withCredentials: true

    })
      .then((res) => {

        const { graphs, semester_info, visible_counts, total_counts } = res.data;


        const parsedData = {}
        for (let sem in graphs) {
          parsedData[sem] = JSON.parse(graphs[sem]);
        }

        setData(parsedData)
        setDetail(semester_info);
        setVisibleProfiles(visible_counts);
        setTotalStudent(total_counts)
        setLoading(false);
        AOS.init({ duration: 1000, once: true });


      })
      .catch((err) => {
        console.log(err);
      });

  }

  function reap_leep_data(e) {
    setActiveTab(e.target.innerHTML)
    axios.post("/api/reap_leep", { student_type: e.target.innerHTML }, { withCredentials: true })
      .then((res) => {
        const { graphs, semester_info, visible_counts, total_counts } = res.data;

        const parsedData = {}
        for (let sem in graphs) {
          parsedData[sem] = JSON.parse(graphs[sem]);
        }

        setData(parsedData)
        setDetail(semester_info);
        setVisibleProfiles(visible_counts);
        setTotalStudent(total_counts)
        setLoading(false);
        AOS.init({ duration: 1000, once: true });


      })
      .catch((err) => {
        console.log(err);
      });

  }




  return (

    <div >


      <Navbar />
      <div>
        <HeroSection h1_tag={branchName} p_tag={branchIntro} />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: "10px 0px 40px" }}>Visible Profiles: {visibleProfiles} of {totalStudent}</h4>
            <div className="btn-group toggle-btn-group" role="group" aria-label="REAP LEEP Toggle">
              <button type="button" className={`btn  ${activeTab === "REAP" ? "active" : ""} ${hidden === true ? "hidden" : ""}`} onClick={reap_leep_data}>REAP</button>
              <button type="button" className={`btn ${activeTab === "LEEP" ? "active" : ""} ${hidden === true ? "hidden" : ""}`} onClick={reap_leep_data}>LEEP</button>
            </div>
          </div>

          {Object.keys(data).map((sem) => (
            <div key={sem}>
              <section id="meet-the-team" className="team-section" data-aos="fade-up">
                <h2>{sem}</h2>
                <div className="team-members">
                  <div className="gauge member" >
                    <h3>Pass Count </h3>
                    <Gauge
                      width={120}
                      height={100}
                      value={detail[sem][3]}
                      valueMax={detail[sem][4]}
                      startAngle={-90}
                      endAngle={90}
                      text={({ value, valueMax }) => `${value} / ${valueMax}`}
                    />

                  </div>
                  <div className="gauge member">
                    <h3>Maximum</h3>
                    <Gauge
                      width={120}
                      height={100}
                      value={detail[sem][0]}
                      valueMax={10}
                      startAngle={-90}
                      endAngle={90}
                      // text={({ value, valueMax }) => `${value} / ${valueMax}`}
                      style={getCGPAColor(detail[sem][0])}
                    />

                  </div>
                  <div className="gauge member">
                    <h3>Minimum</h3>
                    <Gauge
                      width={120}
                      height={100}
                      value={detail[sem][1]}
                      valueMax={10}
                      startAngle={-90}
                      endAngle={90}
                      // text={({ value, valueMax }) => `${value} / ${valueMax}`}
                    />

                  </div>
                  <div className="gauge member">
                    <h3>Average</h3>
                    <Gauge
                      width={120}
                      height={100}
                      value={detail[sem][2]}
                      valueMax={10}
                      startAngle={-90}
                      endAngle={90}
                    />

                  </div>
                </div>
              </section>
              <div className="graph">

                <HorizontalBars data={data[sem]} semester={sem} />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
