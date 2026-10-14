import React from 'react'

const Heading = ({text, styles}) => {
    return (
        <h1 className={` ${styles} text-5xl text-center font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white`}>{text}</h1>

    )
}

export default Heading