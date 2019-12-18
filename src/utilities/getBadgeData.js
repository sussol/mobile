import { routeList } from '../navigation/selectors';
import { generalStrings } from '../localization/index';
import { UIDatabase } from '../database';

const getBadgeData = routeName => {
  const dataType = routeName in routeList ? routeList[routeName] : '';

  return [
    {
      count: dataType ? UIDatabase.objects(dataType).filtered('status != "finalised"').length : 0,
      title: `${generalStrings.unfinalised} ${generalStrings[routeName]}`,
    },
  ];
};

export default getBadgeData;
export { getBadgeData };
