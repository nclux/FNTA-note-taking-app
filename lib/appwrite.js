import { 
  Client, 
  Databases, 
  Account, 
  ID, 
  Query 
} from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.nclx.gymnotetaker',
    projectId: '668079d6002298ab47c1',
    databaseId: '66849a370037b9e65f36',
    userCollectionId: '6684a0630013257fd4e2',
    workoutCollectionId: '668ac9aa002c6bcb2b2e',
    exerciseCollectionId: '668acbd60018fba8049b',
    workoutexerciseCollectionId: '668acd7a002827dbf2d0',
    workoutsessionCollectionId: '668ace6f0002a8025cd0',
    workoutsetCollectionId: '668acff40002aa75be02'

}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.

    const accounts = new Account(client);
    const databases = new Databases(client);
    
    /**
     * Email validation to check whether the email are a correct format.
     *
     * This function checks the provided email string against a regular expression 
     * to determine whether the provided email matches the structure of an email address.
     * @function
     * @name isValidEmail
     * @param {string} email - The email address to validate.
     * @returns {boolean} Returns true if the email is in a valid forma, return false if email is invalid form.
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

    /**
     * create new user account in the appwrite authentication
     * 
     * Registration
     * 
     * @function
     * @name createUser
     * @param {*} email - user valid email address 
     * @param {*} password - user desired password, minimum of 8 characters
     * @param {*} username - username
     * @returns {Promise<Object>} - return new user
     * @throws {Error} - throw new error if the user creation fails.
     */
    export async function createUser(email, password, username) {

        if (!isValidEmail(email)) {
            throw new Error("Invalid email address");
          }

        try {
          const userId = ID.unique();

          const newAccount = await accounts.create(
            userId,
            email,
            password,
            username
          );
      
          if (!newAccount) throw Error;
      
      
          await signIn(email, password);
      
          const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            userId,
            {
              accountId: userId,
              email,
              username,
            }
          );
      
          return newUser;
        } catch (error) {
          throw new Error(error);
        }
      };
      
    /**
      * Signs in a user using their email and password.
      * @function
      * @name signIn
      * @param {string} email - User email address.
      * @param {string} password - User password.
      * @returns {Promise<Object>} - new emailpassword session.
      * @throws {Error} - Throws an error if the sign-in fails.
      */
    export async function signIn(email, password) {
        try {
            try {
                const currentSession = await accounts.getSession('current');
                if (currentSession) {
                  console.log("Active session found, deleting the session");
                  await accounts.deleteSession('current');
                }
              } catch (sessionError) {
                console.log("No active session found");
              }
          
          const session = await accounts.createEmailPasswordSession(email, password);
      
          return session;
        } catch (error) {
          throw new Error(error);
        }
      };

    /**
      * Log out method using appwrite deleteSession.
      *
      * @function 
      * @name logOut
      * @returns {Promise<void>} - A promise that resolves when the session is deleted.
      * @throws {Error} - error if the log out unsuccessful.
      */
    export async function logOut(){
        try {
          return await accounts.deleteSession('current')
        } catch (error) {
          console.log('appwrite service :: getCurrentAccount() :: ' + error)
        }
      };

    /**
     * get the current logged in user
     * 
     * This function fetches the current logged in user account details and
     * retrieves the user document from the database based on the account ID.
     * 
     * @function
     * @name getCurrentUser
     * @returns {Promise<Object|null>} The current user's account object if successful, 
     *                                 or `null` if no user is found.
     * @throws {Error} When there is an issue with fetching the user data.
     */
    export async function getCurrentUser(){ 
      try {
        const currentAccount = await accounts.get();
        if(!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
            )
          if(!currentUser) throw Error; 
            return currentAccount;
          } catch (error) {
            console.log(error)
          }
      };

    /**
      * Creates a new workout files and add the exercise in that file.
      * 
      * This function generates a unique ID for the workout, creates the workout document 
      * in the database, and the exercise that associate with that workout.
      * 
      * @async
      * @function
      * @name createWorkout
      * @param {string} accountId - The ID of the user account that owns the workout.
      * @param {string} workoutName - The name of the workout.
      * @param {string[]} exercises - An array of exercise to be added to the workout.
      * @returns {Promise<Object>} The newly created workout document.
      * @throws {Error} When there is an issue creating the workout or associating exercises.
      */
    export async function createWorkout(accountId, workoutName, exercises) {
      try {
        const workoutId = ID.unique();
        const newWorkout = await databases.createDocument(
          config.databaseId,
          config.workoutCollectionId, 
          workoutId,
            {
              workoutId: workoutId,
              workout_name: workoutName,
              users: accountId, 
            }
          );

          for (const exerciseName of exercises) {
            await addExerciseToWorkout(workoutId, exerciseName);
          };

          return newWorkout;
          } catch (error) {
          console.error('Error creating split:', error);
          throw error;
          }
      };

    /**
     * Adds an exercise to a workout.
     *
     * This function creates a new exercise associate with a workout.
     *
     * @async
     * @function
     * @name addExerciseToWorkout
     * @param {string} workoutId - The unique ID of the workout where the exercise will be added.
     * @param {string} exerciseName - The name of the exercise
     * @throws Throw an error if the exercise cannot be added to the workout.
     */
    async function addExerciseToWorkout(workoutId, exerciseName) {
        try {
          await createExercise(exerciseName, workoutId);
        } catch (error) {
          console.error('Error adding exercise to workout:', error);
          throw error;
        }
      }; 

    /**
     * Creates a new exercise associated with a specific workout.
     *
     * This function generates a unique ID for the exercise and stores it in the database 
     * with the provided exercise name and associated workout ID.
     *
     * @async
     * @function
     * @name  createExercise
     * @param {string} exerciseName - The name of the exercise to be created.
     * @param {string} workoutId - The unique ID of the workout that the exercise belongs to.
     * @returns {Promise<Object>} A promise that resolves to the created exercise document.
     * @throws Throw an error if the exercise creation fails.
     */  
    async function createExercise(exerciseName, workoutId) {
        try {
          const exerciseId = ID.unique();
          return await databases.createDocument(
            config.databaseId,
            config.exerciseCollectionId,
            exerciseId,
            {
              exercise_name: exerciseName,
              exerciseId: exerciseId,
              workouts: workoutId
            }
          );
        } catch (error) {
          console.error('Error creating exercise:', error);
          throw error;
        }
      };
    
    /**
     * Get method, fetches akl workout details associated with the user
     *
     * This function retrieves a list of workouts from the database that belong to the user by their ID.
     *
     * @async
     * @function
     * @name getUserWorkouts
     * @param {string} accountId - The unique ID of the user.
     * @returns {Promise<Object[]>} A promise that resolves to an array of workout documents associated with the user.
     * @throws Throw an error if fetching the user's workouts fails.
     */
    export async function getUserWorkouts(accountId) {
      try {
        const response = await databases.listDocuments(
          config.databaseId,
          config.workoutCollectionId,
          [Query.equal('users', accountId)]
          );
          return response.documents;
        } catch (error) {
          console.error('Error fetching user splits:', error);
          throw error;
        }
      };

    /**
     * Fetches workout details and exercises from the database.
     *
     * This function retrieves a workout document along with all exercises related to that workout from the WorkoutID. 
     * It returns an object containing workout details and an array of exercises.
     *
     * @async
     * @function
     * @name fetchWorkout
     * @param {string} workoutId - The unique ID of the workout to be retrieved.
     * @returns {Promise<Object>} A promise that resolves to an object containing the workout details and associated exercises.
     * @throws Throw an error if the workout or exercises cannot be retrieved.
     */
    export async function fetchWorkout(workoutId){
      try {
          const workoutResponse = await databases.getDocument(
              config.databaseId,
              config.workoutCollectionId,
              workoutId
          );
  
          if (!workoutResponse) {
              throw new Error('Workout not found');
          }
  
          // Fetch exercises associated with the workout
          const exercisesResponse = await databases.listDocuments(
              config.databaseId,
              config.exerciseCollectionId,
              [Query.equal('workouts', workoutId)]
          );
  
          if (!exercisesResponse.documents || exercisesResponse.documents.length === 0) {
              throw new Error('No exercises found for this workout');
          }
          const exercises = exercisesResponse.documents.map(doc =>({
            exercise_name: doc.exercise_name,
            exerciseId: doc.exerciseId
          }));

          return {
              ...workoutResponse,
              exercises: exercises
          };
      } catch (error) {
          console.error('Error fetching workout and associated exercises:', error);
          throw error;
      }
      };

    /**
     * Creates a new set of exercise for a specific exercise.
     *
     * This function records the weight, reps, and week number for a particular exercise and 
     * stores it in the database. It validates the week number before creating the exercise set record.
     *
     * @async
     * @function
     * @name createExerciseSet
     * @param {number} setWeight - Floating number of weight used in exerise set.
     * @param {number} setRep - The number of repetitions performed.
     * @param {number} setWeek - The week number for logged set.
     * @param {string} exerciseId - The ID of the exercise where the set is belongs to.
     * @returns {Promise<Object>} A promise that resolves to the created exercise set document.
     * @throws Throw an error if the week number is invalid or if saving the exercise set fails.
     */
    export async function createExerciseSet(setWeight, setRep, setWeek, exerciseId){
        try {
            // console.log(exerciseId)
            const week = parseInt(setWeek);
            // console.log(typeof week)
            // console.log(week)
            if (isNaN(week) || week <= 0) {
              throw new Error('Invalid week number');
            } 
            const setId = ID.unique();
            const response = await databases.createDocument(
                config.databaseId, // Replace with your database ID
                config.workoutsetCollectionId, // Collection name
                setId, // Generate a unique ID
                {
                  weight: setWeight,
                  reps: setRep,
                  week: week,
                  setId: setId,
                  exercises: exerciseId
                }
            );
            return response;
        } catch (error) {
            console.error('Error saving workout set:', error);
            throw error;
        }
      };
    
    /**
     * Get method, fetch the exerise data from the previous week.
     *
     * This function retrieves the weight and reps information for the given exercise 
     * during the specified week.
     *
     * @async
     * @function
     * @name fetchPreviousWeekData
     * @param {string} exerciseId - The ID of the destination exercise.
     * @param {number} currentWeek - The week number where the data is being fetch.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects containing 
     *                                  weight and reps information from the previous week.
     * @throws Throw an error if fetching the data fails.
     */
    export async function fetchPreviousWeekData(exerciseId, currentWeek){
      try {
          const response = await databases.listDocuments(
              config.databaseId,
              config.workoutsetCollectionId,
              [
                  Query.equal('exercises', exerciseId),
                  Query.equal('week', currentWeek),
                  Query.orderAsc('$createdAt')
              ]
          );
  
          return response.documents.map(doc => ({
              weight: doc.weight,
              reps: doc.reps
          }));
      } catch (error) {
          console.error('Error fetching previous week data:', error);
          throw error;
      }
      };