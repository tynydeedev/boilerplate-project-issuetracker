'use strict';

const { Project, findProject, createProject, createIssue } = require('../database/db.js');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res, next){
      const project = req.params.project;
      findProject(project, (err, data) => {
        if (err) return next(err);
        if (!data) {
          createProject(project, (err, data) => {
            if (err) return next(err);
            findProject(project, (err, data) => {
              if (err) return next(err);
              return res.json(data.issues);
            });
          })
        } else {
          return res.json(data.issues);
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
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
