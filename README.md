# READ ME

## Workout Tracker
Workout tracker is an app you can use to record your workouts. Users have the option to `add`, `edit`, and `delete` a workout entry using the forms displayed on the screen when the associated links are clicked from the navigation bar.

The app keeps track of each user's workout(s) by assigning ID numbers than can then be used to edit and delete those specific entries. All workouts are conveniently displayed when the `View All Workouts` button is clicked.

## ERD
View the entity relationship diagram [here.](https://imgur.com/8g7QSE9)

## Authentication
| Verb |	URI Pattern	| Controller#Action |
| --- | ---         | ---              |
| POST |	/sign-up	| users#signup |
| POST |	/sign-in	| users#signin |
| PATCH	| /change-password/	| users#changepw |
| DELETE	| /sign-out/	| users#signout |

You can use the app at the deployed version [here.](https://kristamcmanus.github.io/workout-tracker-client/)
