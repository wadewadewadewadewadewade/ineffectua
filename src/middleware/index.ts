import thunk from 'redux-thunk';
import {applyMiddleware} from 'redux';
//import { createLogger } from 'redux-logger';
import {firebase} from '../firebase/config';
/*import {State} from '../Types';
import {Action} from '../reducers';
import {getDates, watchDates} from './CalendarMiddleware';
import {getDataTypes, watchDataTypes} from './DataTypesMiddleware';
import {getContacts, watchContacts} from './ContactsMiddleware';
import {watchMedications, getMedications} from './MedicationsMiddleware';
import {watchPainLog, getPainLog} from './PainLogMiddleware';*/

export default applyMiddleware(
  thunk.withExtraArgument(firebase),
  //createLogger(),
  //AuthMiddleware,
  //CalendarMiddleware
);
