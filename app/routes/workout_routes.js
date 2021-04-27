// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for workouts
const Workout = require('../models/workout')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// use this function to send 401 when a user tries to modify a resource
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
  // sets workoutData variable
  const workoutData = req.body.workout
  // sets owner of bike to current user
  workoutData.owner = req.user.id
  Workout.create(workoutData)
    // respond to successful `create` with status 201 and JSON of new "workout"
    .then(workout => res.status(201).json({ workout }))
    .catch(next)
})

// INDEX
// GET /workouts
router.get('/workouts', requireToken, (req, res, next) => {
  const owner = req.user
  // finds all workout `id`s attributed to owner
  Workout.find({ owner: owner.id })
    // handles errors
    .then(handle404)
    // respond with status 200 and JSON of the workouts
    .then(workouts => res.status(200).json({ workouts }))
    .catch(next)
})

// UPDATE
// PATCH /workouts/5a7db6c74d55bc51bdf39793
router.patch('/workouts/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.workout.owner
  // finds individual workout to update by `id`
  Workout.findById(req.params.id)
    // handles errors
    .then(handle404)
    .then(workout => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, workout)
      return workout.updateOne(req.body.workout)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/workouts/:id', requireToken, (req, res, next) => {
  // find individual workout to delete by `id`
  Workout.findById(req.params.id)
    // handles errors
    .then(handle404)
    .then(workout => {
      // throw an error if current user doesn't own `workout`
      requireOwnership(req, workout)
      // delete the workout ONLY IF the above didn't throw
      workout.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
