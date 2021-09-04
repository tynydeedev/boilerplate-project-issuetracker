const mongoose = require('mongoose');
const { Schema } = mongoose;
const MONGO_URI = process.env['MONGO_URI'];

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(MONGO_URI, mongoOptions);

const issueSchema = new Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_on: Date,
  updated_on: Date,
  created_by: {
    type: String,
    required: true
  },
  assigned_to: String,
  open: Boolean,
  status_text: String
});

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  issues: [issueSchema]
});

const Project = mongoose.model('Project', projectSchema);

const findProject = (project, done) => {
  Project.findOne({name: project}, (err, doc) => {
    if (err) return done(err);
    done(null, doc);
  })
};

const createProject = (name, done) => {
  const project = new Project({ name: name });
  project.save((err, doc) => {
    if (err) return done(err);
    done(null, doc);
  });
};

const createIssue = (projectName, title, text, author, assignee, status, done) => {
  const issue = {
    issue_title: title,
    issue_text: text,
    created_on: Date.now(),
    updated_on: Date.now(),
    created_by: author,
    assigned_to: assignee,
    open: true,
    status_text: status,
  };
  
  Project.findOne({ name: projectName }, (err, data) => {
    if (err) return done(err);
    if (!data) {
      const project = new Project({ name: projectName });
      project.issues.push(issue);
      project.save((err, data) => {
        if (err) return done(err);
        done(null, data);
      });
    } else {
      data.issues.push(issue);
      data.save((err, data) => {
        if (err) return done(err);
        done(null, data);
      })
    }
  })
};

module.exports = { Project, findProject, createProject, createIssue };