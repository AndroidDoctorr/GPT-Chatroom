import React from 'react'

const ChatMessage = ({ chatMessage }) => {
  return (
    <div>
      <span>{chatMessage.name}</span>
      <span>{chatMessage.content}</span>
    </div>
  )
}

export default ChatMessage
