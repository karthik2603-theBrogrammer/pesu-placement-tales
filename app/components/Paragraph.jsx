import React from 'react'

const Paragraph = ({text, styles}) => {
    return (
        <p className={` ${styles} text-md text-center m-3 font-normal text-slate-600`}>{text}</p>
    )
}

export default Paragraph