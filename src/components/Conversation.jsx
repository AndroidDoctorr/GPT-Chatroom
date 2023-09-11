import React, { useState } from 'react'
import {
    Paper,
    TextField,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'
import ParticipantModal from './ParticipantModal'
import { ChatClient } from 'gpt-tools'
import ChatMessage from './ChatMessage'
import Participant from './Participant'

// const client = new ChatClient()
const initialParticipants = []
const initialMessages = []

const Conversation = () => {
    const [participants, setParticipants] = useState(initialParticipants)
    const [messages, setMessages] = useState(initialMessages)
    const [hostMessage, setHostMessage] = useState('')
    const [target, setTarget] = useState('audience')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [temperature, setTemperature] = useState(0.2)
    const [model, setModel] = useState('gpt-3.5-turbo')
    const [isSystem, setIsSystem] = useState(false)

    const handleParticipantChange = (event) => {
        const name = event.target.value
        setTarget(name)
        const participant = participants.find((p) => p.name == name)
        if (name == 'all' || name == 'audience') setTemperature(0.2)
        else setTemperature(participant.temperature)
    }

    const handleAddParticipant = () => {
        setIsModalOpen(true)
    }

    const addHostMessage = () => {
        const newMessage = {
            role: isSystem ? 'system' : 'user',
            participant: {
                name: isSystem ? 'System' : 'Host',
                color: '#ccc',
            },
            content: hostMessage,
        }

        setMessages([...messages, newMessage])
        setHostMessage('')
    }

    const handleSendMessage = async ({ messages, model, temperature }) => {
        const response = await ChatClient.continueConversation(
            messages,
            model,
            temperature
        )

        const newMessage = {
            role: 'assistant',
            content: response,
        }

        setMessages([...messages, newMessage])
    }

    const handleTemperatureChange = (event) => {
        let newTemperature = parseFloat(event.target.value)
        // Ensure the value is within the desired range (0.0 to 2.0)
        if (isNaN(newTemperature)) {
            newTemperature = 0.0 // Default to 0.0 if it's not a valid number
        } else if (newTemperature < 0.0) {
            newTemperature = 0.0 // Clamp to the minimum value
        } else if (newTemperature > 2.0) {
            newTemperature = 2.0 // Clamp to the maximum value
        }

        setTemperature(newTemperature)
    }

    const logConversation = () => {}

    const addNewParticipant = (newParticipant, startPrompt, endPrompt) => {
        setParticipants([...participants, newParticipant])
    }

    return (
        <div className='container'>
            {/* Input Section */}
            <div className='section fullwidth'>
                <div className='section-row'>
                    <FormControl>
                        <InputLabel>To:</InputLabel>
                        <Select
                            value={target}
                            onChange={handleParticipantChange}
                        >
                            <MenuItem value='audience'>Audience</MenuItem>
                            <MenuItem value='all'>All Participants</MenuItem>
                            {participants.map((participant) => (
                                <MenuItem
                                    key={participant.name}
                                    value={participant.name}
                                >
                                    {participant.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <TextField
                            label='Temperature'
                            type='number'
                            inputProps={{ min: 0.0, max: 2.0, step: 0.01 }}
                            value={temperature}
                            onChange={handleTemperatureChange}
                        />
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isSystem}
                                onChange={(e) => setIsSystem(e.target.checked)}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        }
                        label='Is System'
                    />
                </div>
                <div className='section-row'>
                    <TextField
                        label='Host'
                        variant='outlined'
                        fullWidth
                        value={hostMessage}
                        onChange={(e) => setHostMessage(e.target.value)}
                    />
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={addHostMessage}
                    >
                        {'Say'}
                    </Button>
                </div>
            </div>

            {/* Conversation Section */}
            <div className='section fullwidth'>
                <div className='section-row'>
                    <Paper className='list conversation'>
                        {messages.map((message, index) => (
                            <ChatMessage
                                key={index}
                                chatMessage={message}
                                participant={message.participant}
                            />
                        ))}
                    </Paper>
                </div>
            </div>

            {/* Participants Section */}
            <div className='section fullwidth'>
                <div className='section-row'>
                    <Paper className='list participantList'>
                        {participants.map((participant, index) => (
                            <Participant
                                key={index}
                                participant={participant}
                            />
                        ))}
                    </Paper>
                </div>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleAddParticipant}
                >
                    Add Participant
                </Button>
            </div>

            {/* Participant Modal */}
            <ParticipantModal
                addNewParticipant={addNewParticipant}
                setIsModalOpen={setIsModalOpen}
                isModalOpen={isModalOpen}
            />

            {/* Log Conversation */}
            <Button
                variant='contained'
                color='secondary'
                onClick={logConversation}
            >
                Log Conversation
            </Button>
        </div>
    )
}

export default Conversation
