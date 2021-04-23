// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for workouts
const Workout = require('../models/workout')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// // CREATE
// // POST /workouts
router.post('/workouts', requireToken, (req, res, next) => {
  // set owner of new workout to be current user
  req.body.workout.owner = req.user.id
  Workout.create(req.body.workout)
    // respond to succesful `create` with status 201 and JSON of new "workout"
    .then(workout => {
      res.status(201).json({ workout: workout.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// CREATE -2
// POST /workouts
// router.post('/workouts', requireToken, (req, res, next) => {
//   // set owner of new workout to be current user
//   const workoutData = req.body.workout
//   workoutData.owner = req.user.id
//
//   Workout.create(workoutData)
//     // respond to succesful `create` with status 201 and JSON of new "workout"
//     .then(workout => {
//       res.status(201).json({ workout: workout.toObject() })
//     })
//     // if an error occurs, pass it off to our error handler
//     // the error handler needs the error message and the `res` object so that it
//     // can send an error message back to the client
//     .catch(next)
// })

// INDEX
// GET /workouts
// router.get('/workouts', requireToken, (req, res, next) => {
//   // req.body.workout.owner = req.user.id
//
//   Workout.find()
//     .then(workouts => {
//       // `workouts` will be an array of Mongoose documents
//       // we want to convert each one to a POJO, so we use `.map` to
//       // apply `.toObject` to each one
//       return workouts.map(workout => workout.toObject())
//     })
//     // respond with status 200 and JSON of the workouts
//     .then(workouts => res.status(200).json({ workouts: workouts }))
//     // if an error occurs, pass it to the handler
//     .catch(next)
// })

// INDEX - 2
// GET /workouts
router.get('/workouts', requireToken, (req, res, next) => {
  Workout.find({ owner: req.user.id })
    .then(workouts => {
      return workouts.map(workout => workout.toObject())
    })
    // respond with status 200 and JSON of the workouts
    .then(workouts => res.status(200).json(workouts))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// INDEX - 3
// GET /workouts
//   router.get('/workouts', requireToken, (req, res, next) => {
//     const userId = req.user.id
//     Workout.find({ owner: user.id })
//       .then(workouts => {
//         return workouts.map(workout => workout.toObject())
//       })
//       // respond with status 200 and JSON of the workouts
//       .then(workouts => res.status(200).json({ workouts }))
//       // if an error occurs, pass it to the handler
//       .catch(next)
// })

// // SHOW (optional feature)
// // GET /workouts/608079853c6d32c1e46097db
// router.get('/workouts/:id', requireToken, (req, res, next) => {
//   // req.params.id will be set based on the `:id` in the route
//   Workout.findById(req.params.id)
//     .then(handle404)
//     // if `findById` is succesful, respond with 200 and "example" JSON
//     .then(workout => res.status(200).json({ workout: workout.toObject() }))
//     // if an error occurs, pass it to the handler
//     .catch(next)
// })

// UPDATE
// PATCH /workouts/608079853c6d32c1e46097db
// router.patch('/workouts/:id', requireToken, removeBlanks, (req, res, next) => {
//   // if the client attempts to change the `owner` property by including a new
//   // owner, prevent that by deleting that key/value pair
//   delete req.body.workout.owner
//
//   Workout.findById(req.params.id)
//     .then(handle404)
//     .then(workout => {
//       // pass the `req` object and the Mongoose record to `requireOwnership`
//       // it will throw an error if the current user isn't the owner
//       requireOwnership(req, workout)
//
//       // pass the result of Mongoose's `.update` to the next `.then`
//       return workout.updateOne(req.body.workout)
//     })
//     // if that succeeded, return 204 and no JSON
//     .then(() => res.sendStatus(204))
//     // if an error occurs, pass it to the handler
//     .catch(next)
// })

// UPDATE
// PATCH /workouts/5a7db6c74d55bc51bdf39793
router.patch('/workouts/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.workout.owner

  Workout.findById(req.params.id)
    .then(handle404)
    .then(workout => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, workout)
      // pass the result of Mongoose's `.update` to the next `.then`
      return workout.updateOne(req.body.workout)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// // // DESTROY
// // // DELETE /examples/5a7db6c74d55bc51bdf39793
// router.delete('/workouts/:id', requireToken, (req, res, next) => {
//   const workoutId = req.params.id
//   Workout.findById(workoutId)
//     .then(handle404)
//     .then(workout => {
//       // throw an error if current user doesn't own `workout`
//       requireOwnership(req, workout)
//       // delete the example ONLY IF the above didn't throw
//       workout.deleteOne()
//     })
//     // send back 204 and no content if the deletion succeeded
//     .then(() => res.sendStatus(204))
//     // if an error occurs, pass it to the handler
//     .catch(next)
// })

// // DESTROY -2
// // DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/workouts/:id', requireToken, (req, res, next) => {
  const workoutId = req.params.id
  Workout.findById(workoutId)
    .then(handle404)
    .then(workout => {
      // throw an error if current user doesn't own `workout`
      requireOwnership(req, workout)
      // delete the example ONLY IF the above didn't throw
      workout.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
