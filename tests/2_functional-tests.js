const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('POST', function() {
    this.timeout(5000);
    // #1
    test('create issue with all fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .type('form')
        .send({
          'issue_title': 'new Issue',
          'issue_text': 'this is serious',
          'created_by': 'John',
          'assigned_to': 'Doe',
          'status_text': 'ongoing'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'new Issue');
          assert.equal(res.body.issue_text, 'this is serious');
          assert.equal(res.body.created_by, 'John');
          assert.equal(res.body.assigned_to, 'Doe');
          assert.equal(res.body.status_text, 'ongoing');
          assert.equal(res.body.open, true);
          // Check date
          let resDate = new Date(res.body.created_on).toDateString();
          let sendDate = new Date().toDateString();
          assert.equal(resDate, sendDate, 'the created_on date should be the same day as send date');
          done();
        });
    });
    // #2
    test('create issue with only required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .type('form')
        .send({
          'issue_title': 'not full issue',
          'issue_text': 'lack the things',
          'created_by': 'John',
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'not full issue');
          assert.equal(res.body.issue_text, 'lack the things');
          assert.equal(res.body.created_by, 'John');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.equal(res.body.open, true);
          // Check date
          let resDate = new Date(res.body.created_on).toDateString();
          let sendDate = new Date().toDateString();
          assert.equal(resDate, sendDate, 'the created_on date should be the same day as send date');
          done();
        });
    });
    // #3
    test('create issue missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .type('form')
        .send({
          'issue_title': 'missing field',
          'issue_text': 'expect error'
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });
  suite('GET', function() {
    this.timeout(5000);
    // #4
    test('view all issues on a project', function(done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 4);
          assert.equal(res.body[0].issue_title, 'old issue');
          assert.equal(res.body[1].issue_title, 'PUT request test 1');
          assert.equal(res.body[2].issue_title, 'one another error');
          assert.equal(res.body[3].issue_title, "John's error");
          done();
        });
    });
    // #5
    test('search issues on a project with one filter', function(done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({ created_by: 'John' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 2);
          assert.equal(res.body[0].created_by, 'John');
          assert.equal(res.body[1].created_by, 'John');
          done();
        });
    });
    // #6
    test('search issues on a project with multiple filters', function(done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({ created_by: 'John', open: 'false' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 1);
          assert.equal(res.body[0].created_by, 'John');
          assert.equal(res.body[0].open, false);
          done();
        });
    });
  });
  suite('PUT', function() {
    this.timeout(5000);
    // #7
    test('update one field', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .type('form')
        .send({
          '_id': '613340ca8429e3da67366667',
          'issue_text': 'change 1'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '613340ca8429e3da67366667');
          done();
        })
    })
    // #8
    test('update multiple fields', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .type('form')
        .send({
          '_id': '61359603fa153fa717895870',
          'issue_title': 'PUT request test 1',
          'issue_text': 'change 1',
          'assigned_to': 'dev',
          'status_text': 'okay'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '61359603fa153fa717895870');
          done();
        })
    });
    // #9
    test('close the issue', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .type('form')
        .send({
          '_id': '613598dfd7a422dbfee5b5a7',
          'open': 'false'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '613598dfd7a422dbfee5b5a7');
          done();
        })
    })
    // #10
    test('update with missing _id', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .type('form')
        .send({
          'issue_title': 'not having _id',
          'issue_text': 'this should not be accepted'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    // #11
    test('no update field sent', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .type('form')
        .send({
          '_id': '613340ca8429e3da67366667'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, '613340ca8429e3da67366667');
          done();
        });
    });
    // #12
    test('invalid _id', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .type('form')
        .send({
          '_id': '61359603fa153fa71789abcd',
          'issue_title': 'PUT request test 1',
          'issue_text': 'change 1',
          'assigned_to': 'dev',
          'status_text': 'okay'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, '61359603fa153fa71789abcd');
          done();
        })
    })
  });
  suite('DELETE', function() {
    this.timeout(5000);
    // #13
    // test('delete an item', function(done) {
    //   chai
    //     .request(server)
    //     .delete('/api/issues/test')
    //     .type('form')
    //     .send({
    //       '_id': '613596ed5e1f6591355ad0ed'
    //     })
    //     .end(function(err, res) {
    //       assert.equal(res.status, 200);
    //       assert.equal(res.body.result, 'successfully deleted');
    //       assert.equal(res.body._id, '613596ed5e1f6591355ad0ed');
    //       done();
    //     });
    // });
    // #14
    test('delete with invalid _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .type('form')
        .send({
          '_id': '6135966fd6bee908e9333d97'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, '6135966fd6bee908e9333d97');
          done();
        });
    });
    // #15
    test('delete with no _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .type('form')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});
