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
    LinearProgress,
} from '@mui/material'
import ParticipantModal from './ParticipantModal'
import { GPTClient } from 'gpt-tools'
import ChatMessage from './ChatMessage'
import Participant from './Participant'
import BouncingDotsLoader from './BouncingLoader'
import fs from 'fs'

const initialParticipants = []
const initialMessages = []

const Conversation = () => {
    const [participants, setParticipants] = useState(initialParticipants)
    const [messages, setMessages] = useState(initialMessages)
    const [hostMessage, setHostMessage] = useState('')
    const [addressee, setAddressee] = useState('audience')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [temperature, setTemperature] = useState(0.2)
    const [model, setModel] = useState('gpt-3.5-turbo')
    const [isSystem, setIsSystem] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    const client = new GPTClient(apiKey)

    const handleAddresseeChange = (event) => {
        const name = event.target.value
        setAddressee(name)
        const participant = participants.find((p) => p.name == name)
        if (name == 'all' || name == 'audience') setTemperature(0.2)
        else setTemperature(participant.temperature)
    }

    const handleAddParticipant = () => {
        setIsModalOpen(true)
    }

    const addHostMessage = async () => {
        const newMessage = {
            role: isSystem ? 'system' : 'user',
            participant: {
                name: isSystem ? 'System' : 'Host',
                color: '#ccc',
            },
            content: '' + hostMessage,
        }

        setMessages([...messages, newMessage])

        participants.forEach((p, i) => {
            if (addressee == 'all' || addressee == p.name) {
                chatToParticipant(p, newMessage)
            }
        })

        setHostMessage('')
    }

    const continueConversation = async (messages, model, temperature) => {
        setIsLoading(true)
        const response = await client.continueConversation(
            messages,
            model,
            temperature
        )
        setIsLoading(false)

        return {
            role: 'assistant',
            content: response,
        }
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

    const addNewParticipant = (newParticipant, doResponseNow, isSystemIntroPrompt) => {
        setParticipants([...participants, newParticipant])

        if (doResponseNow && !!newParticipant.introPrompt) {
            const introMessage = {
                role: isSystemIntroPrompt ? 'system' : 'user',
                participant: {
                    name: isSystemIntroPrompt ? 'System' : 'Host',
                    color: '#ccc',
                },
                content: '' + newParticipant.introPrompt,
            }

            chatToParticipant(newParticipant, introMessage)
        }
    }

    const chatToParticipant = async (participant, hostMessage) => {
        console.log(`Chat to Participant: ${participant ? participant.name : '--'}`)
        // Get message history
        let conversation = []
        messages.forEach((m) => {
            conversation.push({
                role: m.role,
                content: m.content,
            })
        })
        // Add Setup message, if exists
        if (!!participant.setupPrmopt) {
            const setupMessage = {
                role: 'system',
                content: participant.setupPrmopt,
            }
            conversation = [setupMessage, ...conversation]
        }
        // Add host message (prmopt) if exists
        if (!!hostMessage)
            conversation.push({ role: hostMessage.role, content: hostMessage.content })
        // Get response from model
        const response = await continueConversation(
            conversation,
            model,
            participant.temperature
        )

        console.log(`Chat Response: ${response}`)
        // Add participant to message
        const responseMessage = {
            participant,
            ...response,
        }
        // Add to message history
        const newHistory = [...messages]
        newHistory.push(responseMessage)
        setMessages(newHistory)
    }

    const logConversation = () => {
        logMessages(messages)
        logParticipants(participants)
    }

    const logMessages = (messages) => {
        // Convert messages to CSV
        const messagesCsv = messages.map(message => {
            return `${message.role},${message.content},${message.participant.name},${message.participant.color}`
        }).join('\n')
    
        // Create Blob for messages
        const messagesBlob = new Blob(['role,content,participant_name,participant_color\n' + messagesCsv], { type: 'text/csv;charset=utf-8' })
        const messagesLink = document.createElement('a')
        messagesLink.href = URL.createObjectURL(messagesBlob)
        messagesLink.download = 'messages.csv'
    
        // Append the links to the document and trigger a click to initiate the download
        document.body.appendChild(messagesLink)
        messagesLink.click()
        document.body.removeChild(messagesLink)
    }

    const logParticipants = (participants) => {
        // Convert participants to CSV
        const participantsCsv = participants.map(participant => {
            return `${participant.name},${participant.color},${participant.setupPrompt},${participant.introPrompt},${participant.temperature}`
        }).join('\n')
    
        // Create Blob for participants
        const participantsBlob = new Blob(['name,color,setupPrompt,introPrompt,temperature\n' + participantsCsv], { type: 'text/csv;charset=utf-8' })
        const participantsLink = document.createElement('a')
        participantsLink.href = URL.createObjectURL(participantsBlob)
        participantsLink.download = 'participants.csv'
    
        // Append the links to the document and trigger a click to initiate the download    
        document.body.appendChild(participantsLink)
        participantsLink.click()
        document.body.removeChild(participantsLink)
    }

    return (
        <div className='container'>
            {/* Input Section */}
            <div className='section fullwidth'>
                <div className='section-row'>
                    <FormControl>
                        <InputLabel>To:</InputLabel>
                        <Select
                            value={addressee}
                            onChange={handleAddresseeChange}
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
                {isLoading && <LinearProgress />}
                <div className='section-row'>
                    <Paper className='list conversation'>
                        {messages.map((message, index) => (
                            <ChatMessage
                                key={index}
                                chatMessage={message}
                            />
                        ))}
                        {isLoading && <BouncingDotsLoader />}
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
                                doChat={chatToParticipant}
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
