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
    const [hasStartPrompt, setHasStartPrompt] = useState(true)
    const [hasEndPrompt, setHasEndPrompt] = useState(false)
    const [startPrompt, setStartPrompt] = useState('')
    const [endPrompt, setEndPrompt] = useState('')

    const handleCreateParticipant = () => {
        addNewParticipant(
            newParticipant,
            hasStartPrompt ? startPrompt : '',
            hasEndPrompt ? endPrompt : ''
        )
        setNewParticipant(defaultParticipant)
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={hasStartPrompt}
                                onChange={(e) =>
                                    setHasStartPrompt(e.target.checked)
                                }
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        }
                        label='Prompt before existing conversation'
                    />
                    {hasStartPrompt && (
                        <TextField
                            label='Start Prompt'
                            rows={4}
                            multiline
                            value={startPrompt}
                            onChange={(e) => setStartPrompt(e.target.value)}
                            fullWidth
                        />
                    )}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={hasEndPrompt}
                                onChange={(e) =>
                                    setHasEndPrompt(e.target.checked)
                                }
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        }
                        label='Prompt after existing conversation'
                    />
                    {hasEndPrompt && (
                        <TextField
                            label='End Prompt'
                            rows={4}
                            multiline
                            value={endPrompt}
                            onChange={(e) => setEndPrompt(e.target.value)}
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
