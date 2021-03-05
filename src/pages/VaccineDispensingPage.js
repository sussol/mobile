/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */
import React from 'react';
import { Wizard } from '../widgets';
import { PatientSelect } from '../widgets/Tabs/PatientSelect';
import { PatientEdit } from '../widgets/Tabs/PatientEdit';
import { PrescriptionConfirmation } from '../widgets/Tabs/PrescriptionConfirmation';

import { dispensingStrings } from '../localization';

const tabs = [
  {
    component: PatientSelect,
    name: 'patient',
    title: dispensingStrings.select_the_patient,
  },
  { component: PatientEdit, name: 'edit', title: dispensingStrings.edit_the_patient },
  { component: PrescriptionConfirmation, name: 'prescription', title: dispensingStrings.finalise },
];

export const VaccineDispensingPage = () => <Wizard captureUncaughtGestures={false} tabs={tabs} />;
