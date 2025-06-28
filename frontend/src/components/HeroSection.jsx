import React, { useState } from "react";

export default function HeroSection(props) {

    return (
        <div>
            <section className="hero" data-aos="fade-in" data-aos-duration="1000">

                <h1>{props.h1_tag}</h1>
                <img style={{ width: "310px", height: "100px",display: `${props.img_tag !== undefined ? "" : "none"}` }} src={props.img_tag} alt={props.img_tag} />
                <p>{props.p_tag}</p>
            </section>
        </div>
    )
}