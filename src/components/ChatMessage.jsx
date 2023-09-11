import React from 'react'

const ChatMessage = ({ chatMessage }) => {
  return (
    <div>
      <Avatar participant={chatMessage.participant} />
      <span>{chatMessage.content}</span>
    </div>
  )
}

export default ChatMessage
