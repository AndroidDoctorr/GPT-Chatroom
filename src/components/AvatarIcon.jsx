import React from 'react'
import { Avatar } from '@mui/material'
import { getInitials } from '../utils/names'

const AvatarIcon = ({ participant }) => {
    return (
        <Avatar
            sx={{
                bgcolor: participant.color,
                display: 'inline-flex',
                marginRight: '1rem',
            }}
        >
            {getInitials(participant.name)}
        </Avatar>
    )
}

export default AvatarIcon
