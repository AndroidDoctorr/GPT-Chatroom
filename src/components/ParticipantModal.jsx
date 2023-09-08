import React, { useState } from 'react'
import {
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
} from '@mui/material'

const ParticipantModal = ({ isModalOpen, setIsModalOpen, addNewParticipant }) => {
  const defaultParticipant = { name: '', prompt: '', temperature: 0.2 }
  const [newParticipant, setNewParticipant] = useState(defaultParticipant)

  const handleCreateParticipant = () => {
    addNewParticipant(newParticipant)
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

  return (
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} className='modal'>
      <div className='modalContent'>
        <h2>Add Participant</h2>
        <div className="section">
        <TextField
          label="Name"
          value={newParticipant.name}
          onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
          fullWidth
        />
        <TextField
          label="Prompt"
          rows={4}
          multiline
          value={newParticipant.prompt}
          onChange={(e) => setNewParticipant({ ...newParticipant, prompt: e.target.value })}
          fullWidth
        />
        <TextField
          label="Temperature"
          type="number"
          inputProps={{ min: 0.0, max: 2.0, step: 0.01 }}
          value={newParticipant.temperature}
          onChange={handleTemperatureChange}
        />
        </div>
        <Button variant="contained" color="primary" onClick={handleCreateParticipant}>
          Create
        </Button>
      </div>
    </Modal>
  )
}

export default ParticipantModal
