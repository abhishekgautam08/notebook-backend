const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Route 1:  Get all the notes: get "/api/notes/fetchallnotes" Login requied
router.get("/", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured");
  }
});

// Route 2 :  add a new note: get "/api/notes/addnotes" Login requied
router.post(
  "/",
  fetchuser,
  [
    body("title", "Enter valid title").isLength({ min: 3 }),
    body("description", "Enter atleast 5 character description").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are error , return bad request and the error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const notes = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNotes = await notes.save();
      res.json(savedNotes);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occured");
    }
  }
);

// Route 3:  UPDATE existing  notes: put "/api/notes/fetchallnotes" Login requied
router.put("/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    //creating a newnotes object
    const newNotes = {};
    if (title) {
      newNotes.title = title;
    }
    if (description) {
      newNotes.description = description;
    }
    if (tag) {
      newNotes.tag = tag;
    }

    //find the  note to be updated and update it

    let note = await Notes.findById(req.params.id);
    if (!note) {
      res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNotes },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured");
  }
});

// Route 4:  delete a exisiting  notes: delete "/api/notes/deletenotes" Login requied
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    //find the  note to be delete and delete it

    let note = await Notes.findById(req.params.id);
    if (!note) {
      res.status(404).send("Not Found");
    }
    // allow deleteion only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ succes: "notes has been deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured");
  }
});

module.exports = router;
