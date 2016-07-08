import { generateUUID } from '../database';

export function createCustomerInvoice(database, customer) {
  let invoice;
  database.write(() => {
    invoice = database.create('Transaction', {
      id: generateUUID(),
      serialNumber: '1',
      entryDate: new Date(),
      type: 'customer_invoice',
      status: 'confirmed', // Customer invoices always confirmed in mobile for easy stock tracking
      comment: '',
      otherParty: customer,
    });
    if (customer.useMasterList) invoice.addItemsFromMasterList(database);
    database.save('Transaction', invoice);
    customer.addTransaction(invoice);
    database.save('Name', customer);
  });
  return invoice;
}
