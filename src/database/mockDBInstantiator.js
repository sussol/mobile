export function instantiate(database) {
  database.write(() => {
	database.deleteAll();
    const hospitalDept = database.create('ItemDepartment', {
      id: '111DI',
      name: 'Hospital',
      parentDepartment: undefined,
    });

    const pharmacyDept = database.create('ItemDepartment', {
      id: '222DI',
      name: 'Pharmacy',
      parentDepartment: hospitalDept,
    });

    const antidoteCat = database.create('ItemCategory', {
      id: '111CI',
      name: 'Antidote',
      parentCategory: undefined,
    });

    const antidoteSpecficCat = database.create('ItemCategory', {
      id: '222CI',
      name: 'Antidote, specific',
      parentCategory: antidoteCat,
    });

    const antidoteNonSpecificCat = database.create('ItemCategory', {
      id: '333CI',
      name: 'Antidote, non specific',
      parentCategory: antidoteCat,
    });

    for (let i = 1; i < 1000; i += 2) {
      const itemOne = database.create('Item', {
        id: `${i}I`,
        code: `MI${i}`,
        name: `MockItem${i}`,
        defaultPackSize: 100,
        lines: [],
        type: 'Drug',
        department: pharmacyDept,
        description: 'Super good at being an Item',
        category: antidoteSpecficCat,
      });

      const itemTwo = database.create('Item', {
        id: `${i + 1}I`,
        code: `MI${i + 1}`,
        name: `MockItem${i + 1}`,
        defaultPackSize: 24,
        lines: [],
        type: 'Drug',
        department: hospitalDept,
        description: 'Super good at being an Item',
        category: antidoteNonSpecificCat,
      });

      itemOne.lines.push({
        id: `${i}aLI`,
        item: itemOne,
        packSize: 1,
        numberOfPacks: 1,
        totalQuantity: 1,  // Should be kept consistent with packSize x numberOfPacks
        expiryDate: new Date(2016, 12, 31),
        batch: '100',
        costPrice: 0.50,
        sellPrice: 1.00,
      });
      itemOne.lines.push({
        id: `${i + 1}aLI`,
        item: itemOne,
        packSize: 9,
        numberOfPacks: 1,
        totalQuantity: 9,
        expiryDate: new Date(2017, 7, 31),
        batch: '200',
        costPrice: 2.50,
        sellPrice: 5.00,
      });
      itemTwo.lines.push({
        id: `${i}bLI`,
        item: itemTwo,
        packSize: 1,
        numberOfPacks: 1,
        totalQuantity: 1,
        expiryDate: new Date(2020, 1, 31),
        batch: '300',
        costPrice: 0.10,
        sellPrice: 0.20,
      });
    }
  });

  function newDate(currIndex, numberOfTransactions) {
    const date = new Date();
    date.setYear(date.getFullYear() - 1);
    date.setDate(date.getDate() + 365 / numberOfTransactions * currIndex);
    return date;
  }

  database.write(() => {
    const names = [];
    for (let i = 0; i < 10; i++) {
      const name = database.create('Name', {
        id: `n${i}`,
        name: `Borg${i}`,
        code: `borg${i}`,
        phoneNumber: '0800267${i}',
        billingAddress: undefined,
        type: 'Customer AND supplier',
        masterList: undefined,
        invoices: [],
      });
      names.push(name);
    }

    const user = database.create('User', {
      id: '1',
      username: 'chrisSussol',
      lastLogin: new Date(),
      firstName: 'Chris',
      lastName: 'Petty',
      email: 'Chris@Petty.com',
      passwordHash: '9d24f53c0071bce340a741b367c5af8aba614123a2054650594b3769d6dfe1ae', // sussol
      salt: 'sodium chloride',
    });

    const transCat = database.create('TransactionCategory', {
      id: '1',
      name: 'TransactionCategory 1',
      parentCategory: undefined,
    });

    const numberOfTransactions = 1000;
    const numberOfTransactionLines = 10;
    const numberOfItemsToTransact = 100; // From start index of what ever order items below is.
    const items = database.objects('Item');

    for (let t = 0; t < numberOfTransactions; t++) {
      // ((t % 100) === 0) && console.log(`making transaction ${t}`);
      const confirmDate = newDate(t, numberOfTransactions);
      const entryDate = confirmDate;
      const name = names[t % 10];
      const transactionTypes = [
        'customer_invoice',
        'customer_credit',
        'supplier_invoice',
        'supplier_credit',
      ];
      entryDate.setDate(entryDate.getDate() - 5);

      const transaction = database.create('Transaction', {
        id: `t${t}`,
        serialNumber: `${t}`,
        otherParty: name,
        comment: 'comment is here',
        entryDate: entryDate,
        type: transactionTypes[t % 4],
        status: 'cn',
        confirmDate: confirmDate,
        enteredBy: user,
        theirRef: `borg${t}`, // An external reference code
        category: transCat,
        lines: [],
      });
      name.invoices.push(transaction);

      let currItem = 0;
      for (let i = 0; i < numberOfTransactionLines; i++) {
        transaction.lines.push({
          id: `t${t}i${i}`,
          itemId: items[currItem].id,
          itemName: items[currItem].name,
          itemLine: items[currItem].lines[0],
          packSize: 1,
          numberOfPacks: 1,
          totalQuantity: 1,
          invoice: transaction,
        });
        currItem++;
        if (currItem >= numberOfItemsToTransact) {
          currItem = 0;
        }
      }
    }
  });
}
