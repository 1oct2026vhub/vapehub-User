import React from 'react'

const MyAccountHeading:React.FC<{className?: string}> = ({className}) => {
  return (
    <h1 className={`primary-gradient-600 text-h5 md:text-h3 font-bold w-fit ${className}`}>My Account</h1>
  )
}

export default MyAccountHeading
