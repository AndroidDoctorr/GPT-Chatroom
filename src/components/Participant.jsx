import React from 'react'
import AvatarIcon from './AvatarIcon'

const Participant = ({ participant }) => {
    return (
        <div className='participant'>
            <AvatarIcon participant={participant} />
            <span>{participant.name}</span>
        </div>
    )
}

export default Participant
