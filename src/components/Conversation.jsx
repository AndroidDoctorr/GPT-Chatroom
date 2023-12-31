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

const initialParticipants = []
const initialMessages = []

// TODO: Import this from setup files somehow - set up a spreadsheet/csv format?
// Default conversation format message
const universalFormatMessage =
    'This is a chat conversation between multiple chat agents with different setup prompts, generated by an application given user input. The purpose is for training, simulations, test content generation, entertainment, etc. Each participant\'s message begins with their name in all caps followed by ">>". Your character will be defined with the [CHARACTER SETUP] prompt. Each character only sees their own setup prompt. Please respond only as this character. Try to respond in character as best you can. The human user will be named "HOST", and system messages will be named "SYSTEM".'

const Conversation = () => {
    const [participants, setParticipants] = useState(initialParticipants)
    const [messages, setMessages] = useState(initialMessages)
    const [hostMessage, setHostMessage] = useState('')
    const [addressee, setAddressee] = useState('audience')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [maxTokens, setMaxTokens] = useState(1024)
    const [isSystem, setIsSystem] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    const client = new GPTClient(apiKey)

    const handleAddresseeChange = (event) => {
        const name = event.target.value
        setAddressee(name)
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
            temperature,
            maxTokens
        )
        setIsLoading(false)

        return {
            role: 'assistant',
            content: response,
        }
    }

    const handleMaxTokenChange = (event) => {
        let newMaxTokens = parseInt(event.target.value)
        if (isNaN(newMaxTokens)) {
            newMaxTokens = 1024 // Default to 1024 if it's not a valid number
        } else if (newMaxTokens < 1) {
            newMaxTokens = 1 // Clamp to the minimum value
        } else if (newMaxTokens > 4096) {
            newMaxTokens = 4096 // Clamp to the maximum value
        }

        setMaxTokens(newMaxTokens)
    }

    const addNewParticipant = (
        newParticipant,
        doResponseNow,
        isSystemIntroPrompt
    ) => {
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
        console.log(
            `Chat to Participant: ${participant ? participant.name : '--'}`
        )

        // Add Universal Formatting message
        const formatMessage = {
            role: 'system',
            content: universalFormatMessage,
        }
        let conversation = [formatMessage]
        // Add Setup message, if exists
        if (!!participant.setupPrmopt) {
            const setupMessage = {
                role: 'system',
                content: `[CHARACTER SETUP]: ${participant.setupPrmopt}`,
            }
            conversation.push(setupMessage)
        }
        // Add message history
        messages.forEach((m) => {
            conversation.push({
                role: m.role,
                content: `${(m.participant.name + '').toUpperCase()}>>${
                    m.content
                }`,
            })
        })
        // Add host message (prmopt) if exists
        if (!!hostMessage)
            conversation.push({
                role: hostMessage.role,
                content: `${hostMessage.participant.name.toUpperCase()}: ${
                    hostMessage.content
                }`,
            })

        conversation.push({
            role: 'system',
            content:
                'Respond only as your given character, in the format:\n' +
                'CHARACTER NAME>>Their response to the conversation at this point',
        })

        // Get response from model
        const response = await continueConversation(
            conversation,
            participant.model,
            participant.temperature,
            maxTokens
        )

        console.log(`Chat Response: ${response.content}`)
        // Parse chat response
        const responseContent = response.content
        try {
            response.content = responseContent.split('>>')[1]
        } catch (e) {
            console.log(
                `Error parsing response - character name syntax problem: ${e.message}`
            )
        }

        // TODO: Check the list of participants to make sure the given response doesn't end with another participant's name

        // Add participant to message
        const responseMessage = {
            participant,
            ...response,
        }
        // Add to message history
        setMessages((prevMessages) => {
            return [...prevMessages, responseMessage]
        })
    }

    const logConversation = () => {
        logMessages(messages)
        logParticipants(participants)
    }

    const logMessages = (messages) => {
        // Convert messages to CSV
        const messagesCsv = messages
            .map((message) => {
                return `${message.role},${message.content},${message.participant.name},${message.participant.color}`
            })
            .join('\n')

        // Create Blob for messages
        const messagesBlob = new Blob(
            ['role,content,participant_name,participant_color\n' + messagesCsv],
            { type: 'text/csv;charset=utf-8' }
        )
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
        const participantsCsv = participants
            .map((participant) => {
                return `${participant.name},${participant.color},${participant.setupPrompt},${participant.introPrompt},${participant.temperature}`
            })
            .join('\n')

        // Create Blob for participants
        const participantsBlob = new Blob(
            [
                'name,color,setupPrompt,introPrompt,temperature\n' +
                    participantsCsv,
            ],
            { type: 'text/csv;charset=utf-8' }
        )
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
                            label='Max Tokens'
                            type='number'
                            inputProps={{ min: 0, max: 4096, step: 1 }}
                            value={maxTokens}
                            onChange={handleMaxTokenChange}
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
                                isLeftHand={
                                    ['System', 'Host'].indexOf(
                                        message.participant.name
                                    ) > -1
                                }
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
