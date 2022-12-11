import React from 'react'
import './ImageEditor.css'

const ButtonsList = ({ buttonsList }) => {
  return (
    <div className="ButtonsList">
      {buttonsList.map((list) => (
        <div>
          <button onClick={list.onClick}>{list.label}</button>
        </div>
      ))}
    </div>
  )
}

export default ButtonsList
