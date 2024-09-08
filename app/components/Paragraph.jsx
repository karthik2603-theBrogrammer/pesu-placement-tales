import React from 'react'

const Paragraph = ({text, styles}) => {
    return (
        <p className={` ${styles} text-md text-center m-3 font-normal text-gray-500  dark:text-gray-400`}>{text}</p>

    )
}

export default Paragraph