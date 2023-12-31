import React, { useState, useRef } from 'react'
import {
    TextField,
    Button,
    Modal,
    FormControlLabel,
    Checkbox,
    Popper,
    Select,
    MenuItem,
} from '@mui/material'
import { getRandomColor } from '../utils/color'
import { SketchPicker } from 'react-color'

const ParticipantModal = ({
    isModalOpen,
    setIsModalOpen,
    addNewParticipant,
}) => {
    const defaultParticipant = {
        name: '',
        color: getRandomColor(),
        temperature: 0.2,
        setupPrmopt: '',
        model: 'gpt-3.5-turbo',
    }
    const [newParticipant, setNewParticipant] = useState(defaultParticipant)
    const [doResponseNow, setDoResponseNow] = useState(true)
    const [hasIntroPrompt, setHasIntroPrompt] = useState(false)
    const [isSystemIntroPrompt, setIsSystemIntroPrompt] = useState(true)
    const [setupPrompt, setSetupPrompt] = useState('')
    const [introPrompt, setIntroPrompt] = useState('')
    const [isColorPickerOpen, setisColorPickerOpen] = useState(false)
    const [isCustomModel, setIsCustomModel] = useState(false)

    const modelOptions = [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-1106',
        'gpt-3.5-turbo-16k',
        'gpt-3.5-turbo-instruct',
        'gpt-4',
        'gpt-4-32k',
        'gpt-4-0613',
        'gpt-4-32k-0613',
        'gpt-4-vision-preview',
        'gpt-4-1106-preview',
    ]

    let colorPickerToggle = useRef()

    const handleCreateParticipant = () => {
        newParticipant.setupPrmopt = setupPrompt
        newParticipant.introPrompt = hasIntroPrompt ? introPrompt : ''
        addNewParticipant(newParticipant, doResponseNow, isSystemIntroPrompt)
        setNewParticipant(defaultParticipant)
        setSetupPrompt('')
        setIntroPrompt('')
        setIsModalOpen(false)
    }

    const handleTemperatureChange = (event) => {
        let newTemperature = parseFloat(event.target.value)
        // Ensure the value is within the desired range (0.0 to 2.0)
        if (isNaN(newTemperature)) {
            newTemperature = 0.2 // Default to 0.0 if it's not a valid number
        } else if (newTemperature < 0.0) {
            newTemperature = 0.0 // Clamp to the minimum value
        } else if (newTemperature > 2.0) {
            newTemperature = 2.0 // Clamp to the maximum value
        }

        setNewParticipant({ ...newParticipant, temperature: newTemperature })
    }

    const handleModelChange = (event) => {
        setNewParticipant({ ...newParticipant, model: event.target.value })
    }

    const setRandomColor = () => {
        setNewParticipant({ ...newParticipant, color: getRandomColor() })
    }

    const handleColorChange = (color) => {
        setNewParticipant({
            ...newParticipant,
            color: color.hex,
        })
    }

    return (
        <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            className='modal'
        >
            <div className='modalContent'>
                <h2>Add Participant</h2>
                <div className='section'>
                    <div className='section-segment'>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={setRandomColor}
                        >
                            Color
                        </Button>

                        <button
                            ref={colorPickerToggle}
                            aria-describedby={'colorPicker'}
                            type='button'
                            className='colorSample'
                            style={{ backgroundColor: newParticipant.color }}
                            onClick={() =>
                                setisColorPickerOpen(!isColorPickerOpen)
                            }
                        ></button>
                        <Popper
                            id={'colorPicker'}
                            open={isColorPickerOpen}
                            anchorEl={() => colorPickerToggle.current}
                            placement='bottom'
                            style={{ zIndex: 2000 }}
                        >
                            {
                                <SketchPicker
                                    color={newParticipant.color}
                                    onChange={handleColorChange}
                                />
                            }
                        </Popper>
                    </div>

                    {/* // TODO: Use a dropdown to show suggested models. Use a checkbox with the option "Use Custom Model" to change to an input */}

                    <div className='section-segment'>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isCustomModel}
                                    onChange={(e) =>
                                        setIsCustomModel(e.target.checked)
                                    }
                                />
                            }
                            label='Use Custom Model'
                        />
                        {isCustomModel ? (
                            <TextField
                                label='Model'
                                value={newParticipant.model}
                                onChange={handleModelChange}
                            />
                        ) : (
                            <Select
                                label='Model'
                                value={newParticipant.model}
                                onChange={handleModelChange}
                                fullWidth
                            >
                                {modelOptions.map((model) => (
                                    <MenuItem key={model} value={model}>
                                        {model}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    </div>
                </div>
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isSystemIntroPrompt}
                                    onChange={(e) =>
                                        setIsSystemIntroPrompt(e.target.checked)
                                    }
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                            }
                            label='From the System (not the Host)'
                        />
                    )}
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
