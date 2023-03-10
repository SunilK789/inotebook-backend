const express = require("express")
const router = express.Router()
const {body, validationResult} = require("express-validator")
const bcrypt = require("bcrypt")
const Note = require("../models/Note")
var fetchuser = require("../middleware/fetchuser")

//ROUTE 1: Get all notes using: POST "/api/note/getallnotes". Login required
router.get("/getallnotes", fetchuser, async (req, res) => {
	try {
		const notes = await Note.find({user: req.user.id})
		res.json(notes)
		//res.json(req.user)
	} catch (error) {
		console.error(error.message)
		res.status(500).send("Some error occured!")
	}
})

//ROUTE 2: Add new not using: POST "/api/note/addnote". Login required
router.post(
	"/addnote",
	fetchuser,
	[
		body("title", "Title must be atleast 3 character").isLength({min: 3}),
		body("description", "Description must be atleast 3 character").isLength({
			min: 3,
		}),
		body("tag", "Tag must be atleast 3 character").isLength({min: 3}),
	],
	async (req, res) => {
		//If there are errors return bad request
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()})
		}
		const {title, description, tag, user} = req.body
		try {
			const note = new Note({
				user: req.user.id,
				title,
				description,
				tag,
			})

			const savedNote = await note.save()
			res.json(savedNote)
		} catch (error) {
			console.error(error.message)
			res.status(500).send("Some error occured!")
		}
	}
)

//ROUTE 3: Delete note by title: POST "/api/note/deletenotebytitle". Login required
router.delete(
	"/deletenotebytitle",
	fetchuser,
	[body("title", "Title must be atleast 3 character").isLength({min: 3})],
	async (req, res) => {
		//If there are errors return bad request
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()})
		}
		const {title} = req.body

		try {
			const notes = await Note.findOneAndDelete({note: req.user.id, title})

			res.json(notes)
		} catch (error) {
			console.error(error.message)
			res.status(500).send("Some error occured!")
		}
	}
)

//ROUTE 4: Delete note by tag: POST "/api/note/deletenotebytag". Login required
router.delete(
	"/deletenotebytag",
	fetchuser,
	[body("tag", "Tag must be atleast 3 character").isLength({min: 3})],
	async (req, res) => {
		//If there are errors return bad request
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()})
		}
		const {tag} = req.body

		try {
			const notes = await Note.findOneAndDelete({note: req.user.id, tag})

			res.json(notes)
		} catch (error) {
			console.error(error.message)
			res.status(500).send("Some error occured!")
		}
	}
)

//ROUTE 5: Update note : POST "/api/note/updatenote/:id". Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
	//If there are errors return bad request

	const {title, description, tag} = req.body

	try {
		let newNote = {}
		if (title) {
			newNote.title = title
		}
		if (description) {
			newNote.description = description
		}
		if (tag) {
			newNote.tag = tag
		}

		const note = await Note.findById(req.params.id)
		if (!note) {
			return res.status(404).send("Not Found")
		}

		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("Not Allowed")
		}

		const updatedNote = await Note.findByIdAndUpdate(
			req.params.id,
			{$set: newNote},
			{new: true}
		)

		res.json(updatedNote)
	} catch (error) {
		console.error(error.message)
		res.status(500).send("Some error occured!")
	}
})
//ROUTE 6: Delete note by id using : DELETE "/api/note/deletenote/:id". Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
	try {
		const note = await Note.findById(req.params.id)
		if (!note) {
			return res.status(404).send("Not Found")
		}

		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("Not Allowed")
		}

		const deletedNote = await Note.findByIdAndDelete(req.params.id)

		return res.status(200).send({Success: "Note deleted succefully"})
	} catch (error) {
		console.error(error.message)
		res.status(500).send("Some error occured!")
	}
})

module.exports = router
