/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */
import React from 'react';
import { Wizard } from '../widgets';
import { PatientSelect } from '../widgets/Tabs/PatientSelect';
import { ItemSelect } from '../widgets/Tabs/ItemSelect';
import { PrescriptionConfirmation } from '../widgets/Tabs/PrescriptionConfirmation';

import { dispensingStrings } from '../localization';

const tabs = [
  {
    component: PatientSelect,
    name: 'patient',
    title: dispensingStrings.select_the_patient,
  },
  { component: ItemSelect, name: 'item', title: dispensingStrings.select_items },
  { component: PrescriptionConfirmation, name: 'prescription', title: dispensingStrings.finalise },
];

export const VaccineDispensingPage = () => <Wizard tabs={tabs} />;
