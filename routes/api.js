'use strict';

const { Project, findProject, createProject, createIssue, updateIssue, deleteIssue } = require('../database/db.js');

const { list, returnData } = require('../utils/api-get-utils.js');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res, next){
      const project = req.params.project;
      
      // Query processor
      const query = req.query;

      if (query.open === 'true') {query.open = true};
      if (query.open === 'false') {query.open = false};

      findProject(project, (err, data) => {
        if (err) return next(err);
        if (!data) {
          createProject(project, (err, data) => {
            if (err) return next(err);
            findProject(project, (err, data) => {
              if (err) return next(err);
              return res.json(returnData(query, data));
            });
          })
        } else {
          return res.json(returnData(query, data));
        };
      });
    })
    
    .post(function (req, res, next){
      const project = req.params.project;
      const title = req.body.issue_title;
      const text = req.body.issue_text;
      const author = req.body.created_by;
      let assignee = (!req.body.assigned_to) ? '' : req.body.assigned_to;
      let status = (!req.body.status_text) ? '' : req.body.status_text;

      if (!title || !text || !author) {
        return res.json({ error: 'required field(s) missing'});
      }

      createIssue(project, title, text, author, assignee, status, (err, data) => {
        if (err) return next(err);
        const issues = data.issues;
        return res.json(issues[issues.length - 1]);
      })
    })
    
    .put(function (req, res){
      const project = req.params.project;
      const id = req.body._id;
      let title = (!req.body.issue_title) ? null : req.body.issue_title;
      let text = (!req.body.issue_text) ? null : req.body.issue_text;
      let author = (!req.body.created_by) ? null : req.body.created_by;
      let assignee = (!req.body.assigned_to) ? null : req.body.assigned_to;
      let status = (!req.body.status_text) ? null : req.body.status_text;
      let open = null;

      if (req.body.open === 'true') {open = 'true'};
      if (req.body.open === 'false') {open = 'false'};
      
      if (!id) return res.json({error: 'missing _id'});
      if (!title && !text && !author && !assignee && !status && !open) return res.json({ error: 'no update field(s) sent', _id: id });
      
      updateIssue(project, id, title, text, author, assignee, status, open, (err, data) => {
        if (err) return res.json({ error: 'could not update', _id: id });
        res.json({ result: 'successfully updated', '_id': id });
      });
    })
    
    .delete(function (req, res){
      const project = req.params.project;
      const id = req.body._id;

      if (!id) return res.json({error: 'missing _id'});

      deleteIssue(project, id, (err, data) => {
        if (err) return res.json({error: 'could not delete', _id: id});
        res.json({result: 'successfully deleted', _id: id});
      })
    });
    
};
