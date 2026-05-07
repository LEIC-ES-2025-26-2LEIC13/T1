import React from 'react'
import Pill from '../Pill'
import PillsContainer from './PillsContainer'

const Labels = ({ labels, currentLabel, onChange }) => {
  return (
    <PillsContainer style={{ marginBottom: 15 }}>
        {labels.map((label) => {
            const isSelected = (currentLabel === label.name)

            return (
                <Pill
                    key={label.name}
                    name={label.name}
                    iconName={label.icon}
                    pressable
                    onPress={() => onChange('label', label.name)}
                    isSelected={isSelected}
                />
            );
        })}
    </PillsContainer>
  )
}

export default Labels