import realm from '../schema/Realm'

export default class mockDBInstantiator {
  let instantiate = () => {
    realm.write(() => {
      realm.create(
        'ItemDepartment',
        {
          id: '111DI',
          name: 'Hospital',
        },
        true
      );

      realm.create(
        'ItemDepartment',
        {
          id: '222DI',
          name: 'Pharmacy',
          parentDepartment: 'Hospital',
        },
        true
      );

      realm.create(
        'ItemCategory',
        {
          id: '111CI',
          name: 'Cancer Treatment',
        },
        true
      );

      realm.create(
        'ItemCategory',
        {
          id: '222CI',
          name: 'Chemo IV',
          parentCategory: 'Cancer Treatment',
        },
        true
      );

      realm.create(
        'ItemLine',
        {
          id: '111LI',
          item: 'Item',
          packSize: '12',
          numberOfPacks: '10',
          totalQuantity: '120',  // Should be kept consistent with packSize x numberOfPacks
          expiryDate: new Date(2016, 12, 31),
          batch: 'string',
          costPrice: 'double',
          sellPrice: 'double'
        },
        true
      );

      realm.create(
        'ItemLine',
        {
          id: '222LI',
          item: 'Item',
          packSize: '100',
          numberOfPacks: '5000',
          totalQuantity: '500000',  // Should be kept consistent with packSize x numberOfPacks
          expiryDate: new Date(2017, 7, 31),
          batch: 'string',
          costPrice: 'double',
          sellPrice: 'double'
        },
        true
      );

      realm.create(
        'ItemLine',
        {
          id: '333LI',
          item: 'Item',
          packSize: '24',
          numberOfPacks: '100',
          totalQuantity: '2400',  // Should be kept consistent with packSize x numberOfPacks
          expiryDate: new Date(2020, 1, 31),
          batch: 'string',
          costPrice: 'double',
          sellPrice: 'double'
        },
        true
      );


      realm.create(
        'Item',
        {
          id: '111I',
          code: 'TI1',
          name: 'TestItem1',
          defaultPackSize: 'double',
          lines: { type:'list', objectType: 'ItemLine' },
          typeOf: 'string',
          department: 'ItemDepartment',
          description: 'string',
          category: 'ItemCategory',
        },
        true
      );

      realm.create(
        'Item',
        {
          id: '222I',
          code: 'TI2',
          name: 'string',
          defaultPackSize: 'double',
          lines: { type:'list', objectType: 'ItemLine' },
          typeOf: 'string',
          department: 'ItemDepartment',
          description: 'string',
          category: 'ItemCategory',
        },
        true
      );
      //Set up relations between objects



    });

    // I don't think this mock will ever by used by a live site.
    // Needless to say, don't clearMock unless you want to wipe
    // all data!

    let clearMock => realm.deleteAll();

  }
}
