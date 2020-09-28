import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatTime, formatDateAndTime } from '../../middleware/CalendarMiddleware';

export const dateToString = (day: Date, today?: Date): string => {
  if (today !== undefined) {
    if (day.toISOString().replace(/T.*/,'') === today.toISOString().replace(/T.*/,'')) {
      return formatTime(day)
    }
  }
  return formatDateAndTime(day)
}

type Props = {
  value?: Date,
  onResult: (d?: Date) => void,
  minimum?: Date
}

export const ChronoPicker = ({ value, minimum, onResult } : Props): JSX.Element => {

  const [phase, setPhase] = React.useState('date' as "time" | "date" | "datetime" | "countdown" | undefined);
  const [datetime, setDateTime] = React.useState(value);

  return (
    <DateTimePicker
      mode={phase}
      value={datetime ? datetime : new Date(Date.now()) }
      minimumDate={minimum}
      onChange={(e: Event, d?: Date) => {
        if (d) {
          setDateTime(d);
          if (phase === 'date') {
            setPhase('time')
          } else {
            onResult(d)
          }
        } else {
          onResult()
        }
      }}
    />
  )
}

export default ChronoPicker
