/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Text, View } from 'react-native';
import * as Progress from 'react-native-progress';

import { getMigrationTasks } from '../dataMigration';

import Settings from '../settings/MobileAppSettings';
import Database from '../database/BaseDatabase';

/**
 * @prop  {function}  onMigrated  Callback on completion of all migration tasks.
 */
export const MigrationPage = ({ onMigrated }) => {
  const [tasks, setTasks] = React.useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = React.useState(0);
  const [executeCurrentTask, setExecuteCurrentTask] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const migrationTasks = await getMigrationTasks(Database, Settings);
      setTasks(migrationTasks);
      setExecuteCurrentTask(true);
    })();
  }, []);

  React.useEffect(() => {
    if (executeCurrentTask) {
      // Ensure tasks are run sequentially.
      setExecuteCurrentTask(false);

      (async () => {
        // Execute current task.
        const task = tasks[currentTaskIndex];
        await task.execute();

        const nextTaskIndex = currentTaskIndex + 1;
        if (nextTaskIndex >= tasks.length) {
          // All tasks executed.
          onMigrated();
        } else {
          // Increment task index to trigger next execution.
          setCurrentTaskIndex(nextTaskIndex);
        }

        // Reset flag to allow another task to be queued on the event loop.
        setExecuteCurrentTask(true);
      })();
    }
  }, [executeCurrentTask]);

  // Should only be true on initial render.
  if (!tasks.length) {
    const progressText = 'Initialising app...';
    return (
      <View style={styles.container}>
        <View>
          <Text>{progressText}</Text>
          <Progress.Bar useNativeDriver={true} indeterminate={true} />
        </View>
      </View>
    );
  }
  const taskCount = tasks.length;
  const taskNumber = currentTaskIndex + 1;
  const taskProgress = taskNumber / taskCount;

  const progressText = `Executing task: ${taskNumber}/${taskCount}`;

  const taskText = tasks[currentTaskIndex].description;

  return (
    <View style={styles.container}>
      <View>
        <Text>{progressText}</Text>
        <Progress.Bar useNativeDriver={true} progress={taskProgress} />
        <Text>{taskText}</Text>
      </View>
    </View>
  );
};

MigrationPage.propTypes = {
  onMigrated: PropTypes.func.isRequired,
};

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default MigrationPage;
