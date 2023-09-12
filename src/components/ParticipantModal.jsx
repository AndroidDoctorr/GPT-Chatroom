import React, { useState } from 'react'
import {
    TextField,
    Button,
    Modal,
    FormControlLabel,
    Checkbox,
} from '@mui/material'
import { getRandomColor } from '../utils/color'

const ParticipantModal = ({
    isModalOpen,
    setIsModalOpen,
    addNewParticipant,
}) => {
    const defaultParticipant = {
        name: '',
        color: getRandomColor(),
        temperature: 0.2,
    }
    const [newParticipant, setNewParticipant] = useState(defaultParticipant)
    const [doResponseNow, setDoResponseNow] = useState(true)
    const [hasIntroPrompt, setHasIntroPrompt] = useState(false)
    const [setupPrompt, setSetupPrompt] = useState('')
    const [introPrompt, setIntroPrompt] = useState('')

    const handleCreateParticipant = () => {
        if (!hasSetupPrompt && !hasSetupPrompt) {
            alert('At least one prompt is required!')
            return
        }
        newParticipant.setupPrmopt = setupPrompt
        newParticipant.introPrompt = hasIntroPrompt ? introPrompt : ''
        addNewParticipant(newParticipant, doResponseNow)
        setNewParticipant(defaultParticipant)
        setSetupPrompt('')
        setIntroPrompt('')
        setIsModalOpen(false)
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

        setNewParticipant({ ...newParticipant, temperature: newTemperature })
    }

    const setRandomColor = () => {
        setNewParticipant({ ...newParticipant, color: getRandomColor() })
    }

    return (
        <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            className='modal'
        >
            <div className='modalContent'>
                <h2>Add Participant</h2>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={setRandomColor}
                >
                    Color
                </Button>
                <div
                    className='colorSample'
                    style={{ backgroundColor: newParticipant.color }}
                ></div>
                <div className='section'>
                    <TextField
                        label='Name'
                        value={newParticipant.name}
                        onChange={(e) =>
                            setNewParticipant({
                                ...newParticipant,
                                name: e.target.value,
                            })
                        }
                        fullWidth
                    />
                    {
                        'The Setup Prompt is used to define this agent, and will always appear at the beginning of the coversation for this agent only'
                    }
                    <TextField
                        label='Setup Prompt'
                        rows={4}
                        multiline
                        value={setupPrompt}
                        onChange={(e) => setSetupPrompt(e.target.value)}
                        fullWidth
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={hasIntroPrompt}
                                onChange={(e) =>
                                    setHasIntroPrompt(e.target.checked)
                                }
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        }
                        label='Do Intro Prompt'
                    />
                    {
                        'The Intro Prompt is added to the end of the conversation to introduce this agent, and is optional'
                    }
                    {hasIntroPrompt && (
                        <TextField
                            label='Intro Prompt'
                            rows={4}
                            multiline
                            value={introPrompt}
                            onChange={(e) => setIntroPrompt(e.target.value)}
                            fullWidth
                        />
                    )}
                    <TextField
                        label='Temperature'
                        type='number'
                        inputProps={{ min: 0.0, max: 2.0, step: 0.01 }}
                        value={newParticipant.temperature}
                        onChange={handleTemperatureChange}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={doResponseNow}
                                onChange={(e) =>
                                    setDoResponseNow(e.target.checked)
                                }
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        }
                        label='Reply immediately'
                    />
                </div>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleCreateParticipant}
                >
                    Create
                </Button>
            </div>
        </Modal>
    )
}

export default ParticipantModal
