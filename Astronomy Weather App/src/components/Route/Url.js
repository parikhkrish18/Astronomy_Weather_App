import React from 'react'
import {useNavigate} from 'react-router-dom'



// Reusable Redirection Component
function Icon({imageSrc, navigateTo}) {

    const navigate = useNavigate()

    const handleClick = () =>{
        navigate(navigateTo)
    }

    return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        <img src={imageSrc} alt="" style={{ maxWidth: '40px', height: '40px' }}/>
    </div>
  )
}

export default Icon
