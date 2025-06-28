import a0 from "../assets/a0.png";
import a1 from "../assets/a1.png";
import a2 from "../assets/a2.png";
import a3 from "../assets/a3.png";
import a4 from "../assets/a4.png";
import a5 from "../assets/a5.png";
import a6 from "../assets/a6.png";


function Avatar(props) {

    const avatarMap = {
        "a0.png": a0,
        "a1.png": a1,
        "a2.png": a2,
        "a3.png": a3,
        "a4.png": a4,
        "a5.png": a5,
        "a6.png": a6

    };

    const avatar = avatarMap[props.src] || a0;

    return (<>
        <img src={avatar} style={{ width: "150px", display: `${props.stdname !== "" ? "flex" : "none"}` }} alt="avatar" />
        <div style={{ display: `${props.page === "studentPerformance" ? "none" : "flex"}` }}>
            <i class="fa-solid fa-pen-to-square"></i>
        </div>
        <img src={a1} style={{ width: "50px", height: "50px", borderRadius: "50%", display: "none" }} alt="avatar" />
        <img src={a2} style={{ width: "50px", height: "50px", borderRadius: "50%", display: "none" }} alt="avatar" />
        <img src={a3} style={{ width: "50px", height: "50px", borderRadius: "50%", display: "none" }} alt="avatar" />
        <img src={a4} style={{ width: "50px", height: "50px", borderRadius: "50%", display: "none" }} alt="avatar" />
        <img src={a5} style={{ width: "50px", height: "50px", borderRadius: "50%", display: "none" }} alt="avatar" />
        <img src={a6} style={{ width: "50px", height: "50px", borderRadius: "50%", display: "none" }} alt="avatar" />
    </>
    )
}

export default Avatar