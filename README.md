# Workout Tracker

## User Stories
- User can sign-up, sign-in, sign-out, and change password.
- User can create a new workout entry with options to add info in 'exercise type', 'duration', 'date', and 'notes' fields.
- User can edit a workout entry.
- User can delete a workout entry.
- User can view all workout entry.
- User can only view and interact with workout entries when signed in.

## Technologies Used
- HTML/CSS
- JavaScript
- Node
- Express
- MongoDB
- Mongoose

## Wireframes
https://imgur.com/gallery/fqIfgvp
https://imgur.com/gallery/03QeZgJ
https://imgur.com/gallery/VoX04kA

## ERD
https://imgur.com/gallery/k5XVA3x

## Authentication
| Verb |	URI Pattern	| Controller#Action |
| --- | ---         | ---              |
| POST |	/sign-up	| users#signup |
| POST |	/sign-in	| users#signin |
| PATCH	| /change-password/	| users#changepw |
| DELETE	| /sign-out/	| users#signout |
