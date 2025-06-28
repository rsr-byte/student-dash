import React from "react";
import S from "../assets/S.png"
import Books from "../assets/books.png"


function Loader() {
    return (

        <div className="loader">
            <div className="wave-container">
                <h1 className="wave-text">
                    <span><img src={S} style={{ height: "60px", position: "relative", top: "-14px" }} alt="S" /></span>
                    <span>T</span>
                    <span>U</span>
                    <span>D</span>
                    <span>E</span>
                    <span>N</span>
                    <span>T</span>
                    <span ><img src={Books} style={{ height: "25px" }} alt="books" /></span>
                    <span>D</span>
                    <span>A</span>
                    <span>S</span>
                    <span>H</span>
                </h1>
            </div>
        </div>
    )
}

export default Loader