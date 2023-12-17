import React from 'react'

const Participant = ({ participant, doChat }) => {
    return (
        <div
            className='participant'
            style={{ backgroundColor: participant.color }}
        >
            <span>{participant.name}</span>
            <button type='button' onClick={() => doChat(participant)}>Talk</button>
        </div>
    )
}

export default Participant
