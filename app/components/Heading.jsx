import React from 'react'

const Heading = ({text, styles}) => {
    return (
        <h1 className={` ${styles} text-5xl text-center font-serif font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl`}>{text}</h1>
    )
}

export default Heading