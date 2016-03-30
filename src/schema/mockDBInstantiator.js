import realm from '../schema/Realm';

export default function instantiate(){
  realm.write(() => {
    let hospitalDept = realm.create('ItemDepartment', {
      id: '111DI',
      name: 'Hospital',
      parentDepartment: undefined,
    });

    let pharmacyDept = realm.create('ItemDepartment', {
      id: '222DI',
      name: 'Pharmacy',
      parentDepartment: hospitalDept,
    });

    let antidoteCat = realm.create('ItemCategory', {
      id: '111CI',
      name: 'Antidote',
      parentCategory: undefined,
    });

    let antidoteSpecficCat = realm.create('ItemCategory', {
      id: '222CI',
      name: 'Antidote, specific',
      parentCategory: antidoteCat,
    });

    let antidoteNonSpecificCat = realm.create('ItemCategory', {
      id: '333CI',
      name: 'Antidote, non specific',
      parentCategory: antidoteCat,
    });

    let itemOne = realm.create('Item', {
      id: '111I',
      code: 'MI1',
      name: 'MockItem1',
      defaultPackSize: '100',
      lines: [],
      typeOf: 'Drug',
      department: pharmacyDept,
      description: 'Super good at being a first Item',
      category: antidoteSpecficCat,
    });

    let itemTwo = realm.create('Item', {
      id: '222I',
      code: 'MI2',
      name: 'MockItem2',
      defaultPackSize: '24',
      lines: [],
      typeOf: 'Drug',
      department: pharmacyDept,
      description: 'Super good at being a second Item',
      category: antidoteNonSpecificCat,
    });

    itemOne.lines.push({
      id: '111LI',
      item: itemOne,
      packSize: '12',
      numberOfPacks: '10',
      totalQuantity: '120',  // Should be kept consistent with packSize x numberOfPacks
      expiryDate: new Date(2016, 12, 31),
      batch: '100',
      costPrice: '.50',
      sellPrice: '1.00'
    });

    itemOne.lines.push({
      id: '222LI',
      item: itemOne,
      packSize: '100',
      numberOfPacks: '5000',
      totalQuantity: '500000',  // Should be kept consistent with packSize x numberOfPacks
      expiryDate: new Date(2017, 7, 31),
      batch: '200',
      costPrice: '2.50',
      sellPrice: '5.00'
    });

    itemTwo.lines.push({
      id: '333LI',
      item: itemTwo,
      packSize: '24',
      numberOfPacks: '100',
      totalQuantity: '2400',  // Should be kept consistent with packSize x numberOfPacks
      expiryDate: new Date(2020, 1, 31),
      batch: '300',
      costPrice: '.10',
      sellPrice: '.20'
    });
  });
};

//   // I don't think this mock will ever by used by a live site.
//   // Needless to say, don't clearMock unless you want to wipe
//   // all data! Also, this method is pretty redundant...
//   let deleteAll = () => realm.deleteAll();
// }
