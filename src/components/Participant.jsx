import React from 'react'
import AvatarIcon from './AvatarIcon'

const Participant = ({ participant }) => {
    return (
        <div
            className='participant'
            style={{ backgroundColor: participant.color }}
        >
            <span>{participant.name}</span>
        </div>
    )
}

export default Participant
