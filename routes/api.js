'use strict';

const { request } = require('chai');

module.exports = function (app) {
  require('dotenv').config()
  const mongooose = require('mongoose')
  const { default: mongoose } = require('mongoose')

  mongooose.connect(process.env.MONGO_URI)

  const issueSchema = new mongooose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: '' },
    status_text: { type: String, default: '' },
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    open: { type: Boolean, default: true },
    project: { type: String, required: true },
  })

  let Issue = mongooose.model('Issue', issueSchema)

  const createNewIssue = async (issue_title, issue_text, created_by, assigned_to, status_text, project) => {
    try {
      const newIssue = new Issue({ issue_title, issue_text, created_by, assigned_to, status_text, project });
      const savedIssue = await newIssue.save();
      return savedIssue;
    } catch (err) {
      // console.error('Error creating issue:', err);
      return null;
    }
  };

  const findAllIssues = async (project, filters) => {
    try {
      let query = { project };

      for (let key in filters) {
        if (filters[key] !== '') {
          query[key] = filters[key];
        }
      }

      let issues = await Issue.find(query);
      return issues;

    } catch (err) {
      console.error('Error finding issues', err)
      return null
    }
  }

  const updateById = async (_id, updateFields) => {
    try {
      // Sprawdzenie, czy w ogóle zostały przekazane pola do aktualizacji
      if (Object.keys(updateFields).length === 0) {
        return { error: 'no update field(s) sent', '_id': _id };
      }

      // Dodanie bieżącej daty do pola updated_on
      updateFields.updated_on = new Date();

      // Znajdź zgłoszenie i zaktualizuj je
      const updatedIssue = await Issue.findByIdAndUpdate(_id, updateFields, { new: true });

      if (updatedIssue) {
        return {
          result: 'successfully updated',
          '_id': _id
        };
      } else {
        return { error: 'could not update', '_id': _id };
      }
    } catch (err) {
      console.error('Error updating issue by ID:', err);
      return { error: 'could not update', '_id': _id };
    }
  }

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;
      // console.log(req.query)
      let filters = req.query;
      try {
        const issues = await findAllIssues(project, filters);
        if (issues) {
          res.json(issues);
        } else {
          res.json({ message: 'Error receving issues from MongoDB' });
        }
      } catch (err) {
        console.error('Error handling GET /api/:project request:', err);
        res.json({ message: 'Error handling GET /api/:project request' });
      }

    })

    .post(async function (req, res) {
      let project = req.params.project;
      // console.log(req.body);
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      try {
        // Tworzymy nowe zgłoszenie
        const newIssue = new Issue({
          project: project,
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        });

        // Zapisujemy nowe zgłoszenie do bazy danych
        const savedIssue = await newIssue.save();

        // Zwracamy zapisane zgłoszenie, z uzupełnieniem brakujących pól opcjonalnych
        res.json({
          _id: savedIssue._id,
          issue_title: savedIssue.issue_title,
          issue_text: savedIssue.issue_text,
          created_by: savedIssue.created_by,
          assigned_to: savedIssue.assigned_to || '',
          status_text: savedIssue.status_text || '',
          created_on: savedIssue.created_on,
          updated_on: savedIssue.updated_on,
          open: savedIssue.open
        })
      } catch (err) {
        console.error('Error handling POST /api/:project request', err);
        res.json({ message: 'Error handling POST /api/:project request' })
      }

    })

    .put(async function (req, res) {
      let project = req.params.project;
      let { _id, issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      //  console.log('Log from put function issue_title : ', issue_title);

      if (!req.body._id || !mongoose.Types.ObjectId.isValid(req.body._id)) {
        return res.json({ error: 'missing _id' });
      } else if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text) {
        // console.log('Inside log call, issue_title: ', issue_title)
        
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      }
      // Przygotowanie obiektu z aktualizacjami
      const updateFields = {};

      // Dodajemy tylko te pola, które zostały przekazane w żądaniu
      if (issue_title) updateFields.issue_title = issue_title;
      if (issue_text) updateFields.issue_text = issue_text;
      if (created_by) updateFields.created_by = created_by;
      if (assigned_to) updateFields.assigned_to = assigned_to;
      if (status_text) updateFields.status_text = status_text;

      try {
        // Przeprowadzamy aktualizację
        const result = await updateById(_id, updateFields);

        // Zwracamy odpowiedź w zależności od wyniku
        res.json(result);
      } catch (err) {
        console.error('Error handling PUT /api/:project request:', err);
        res.json({ error: 'could not update', '_id': _id });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'missing _id' })

      };
      try {
        const deletedIssue = await Issue.findByIdAndDelete(req.body._id)
        if (deletedIssue) {
          // console.log('Seems to work fine. ID of the deleted issue:', deletedIssue._id.toString());
          res.json({ result: 'successfully deleted', '_id': req.body._id });
        } else {
          res.json({ error: 'could not delete', '_id': req.body._id });
        }
      } catch (err) {
        // console.error('Error handling DELETE /api/:project request', err);
        res.json({ error: 'could not delete', '_id': req.body._id });
      }
    });

};
