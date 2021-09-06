const mongo = require('mongodb');
const { ObjectId } = mongo;

const list = [
  '_id',
  'issue_title',
  'issue_text',
  'created_by',
  'assigned_to',
  'created_on',
  'updated_on',
  'open',
  'status_text'
];

const returnData = (query, data) => {
  const acceptQuery = Object.keys(query).filter(e => list.indexOf(e) !== -1);

  if (acceptQuery.length === 0) return data.issues;
  return data.issues.filter(issue => {
    return acceptQuery.every(q => {
      if (q === '_id') return issue[q].toString() === query[q];
      return issue[q] === query[q];
    });
  });
};

module.exports = { list, returnData };