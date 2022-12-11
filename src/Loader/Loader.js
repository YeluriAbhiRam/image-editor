import React from 'react'
import { Spinner } from '@copart/core-components'
import './Loader.css'

const Loader = ({ size = 'md', overlay = false, info = 'Loading', alignLeft = false }) => {
  return (
    <div className={overlay ? 'overlay' : ''}>
      <div className={alignLeft ? 'spinner left' : 'spinner'}>
        <Spinner size={size} />
        <div className="infoText">{info}</div>
      </div>
    </div>
  )
}

export default Loader
