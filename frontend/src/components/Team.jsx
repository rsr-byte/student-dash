import React from "react";

function Team(props) {
    return (
            <div className="member">
                <h3>{props.name}</h3>
               <p dangerouslySetInnerHTML={{ __html: props.p }} />
        </div>
    )
}
export default Team;