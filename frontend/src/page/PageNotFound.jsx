import React from "react";

import image404 from "../assets/404.png";

export default function PageNotFound() {
    return (
        <div className="page-not-found">
            <img src={image404} alt="404" />
        </div>
    )
}