const list = [
  'issue_title',
  'issue_text',
  'created_by',
  'assigned_to',
  'created_on',
  'updated_on',
  'open',
  'status_text'
];

const returnData = (query, acceptQuery, data) => {
  if (acceptQuery.length === 0) return data.issues;
  return data.issues.filter(issue => {
    return acceptQuery.every(q => issue[q] === query[q]);
  });
};

module.exports = { list, returnData };