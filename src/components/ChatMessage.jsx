import React from 'react'
import AvatarIcon from './AvatarIcon'

const ChatMessage = ({ chatMessage, isLeftHand }) => {
    return (
        <div className='chatMessage'>
            {!isLeftHand && (
                <AvatarIcon participant={chatMessage.participant} />
            )}
            <span>{chatMessage.content}</span>
            {isLeftHand && <AvatarIcon participant={chatMessage.participant} />}
        </div>
    )
}

export default ChatMessage
