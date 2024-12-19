const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let savedID;
let savedTitle;

suite('Functional Tests', function () {
    // Create an issue with every field: POST request to /api/issues/{project}
    test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().post('/api/issues/apitest')
            .send({
                issue_title: 'Title made by test',
                issue_text: 'Text made by test',
                created_by: 'Creator made by test',
                assigned_to: 'Assigner made by test',
                status_text: 'Status made by test'
            })
            .end((err, res) => {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.equal(res.type, 'application/json', 'Response should be json');
                assert.equal(res.body.issue_title, 'Title made by test');
                assert.equal(res.body.issue_text, 'Text made by test');
                assert.equal(res.body.created_by, 'Creator made by test');
                assert.equal(res.body.assigned_to, 'Assigner made by test');
                assert.equal(res.body.status_text, 'Status made by test');
                done();
            });
    });
    // Create an issue with only required fields: POST request to /api/issues/{project}
    test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().post('/api/issues/apitest')
            .send({
                issue_title: 'Title made by test',
                issue_text: 'Text made by test',
                created_by: 'Creator made by test',
                assigned_to: '',
                status_text: ''
            })
            .end((err, res) => {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.equal(res.type, 'application/json', 'Response should be json');
                assert.equal(res.body.issue_title, 'Title made by test');
                assert.equal(res.body.issue_text, 'Text made by test');
                assert.equal(res.body.created_by, 'Creator made by test');
                done();
            });
    });
    // Create an issue with missing required fields: POST request to /api/issues/{project}
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().post('/api/issues/apitest')
            .send({
                issue_title: 'Title made by test',
                issue_text: '',
                created_by: '',
                assigned_to: '',
                status_text: ''
            })
            .end((err, res) => {
                // console.log(res)
                assert.equal(res.body.error, 'required field(s) missing');
                done();
            });
    });

    // View issues on a project: GET request to /api/issues/{project}
    test('View issues on a project: GET request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().get('/api/issues/apitest')
            .end((err, res) => {
                assert.equal(res.status, 200, 'Response status should be 200');
                let issuesTable = res.body;
                issuesTable.forEach((issue) => {
                    // "_id":"675c961a16b084de487c0a0f","issue_title":"Title made by test","issue_text":"Text made by test","created_by":"Creator made by test","assigned_to":"","status_text":"","__v":0}
                    assert.hasAnyKeys(issue, ["_id", "issue_title", "issue_text", "created_by", "assigned_to", "status_text", "__v"]);
                    savedID = issue._id;
                    assert.isNotEmpty(issue.issue_title);
                    savedTitle = issue.issue_title;
                    assert.isNotEmpty(issue.issue_text);
                    assert.isNotEmpty(issue.created_by);
                })
                done();
            });
    });
    // View issues on a project with one filter: GET request to /api/issues/{project}
    test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().get('/api/issues/apitest')
            .query({
                _id: savedID
            })
            .end((err, res) => {
                assert.equal(res.status, 200, 'Response status should be 200');
                let issuesTable = res.body;
                issuesTable.forEach((issue) => {
                    // "_id":"675c961a16b084de487c0a0f","issue_title":"Title made by test","issue_text":"Text made by test","created_by":"Creator made by test","assigned_to":"","status_text":"","__v":0}
                    assert.hasAnyKeys(issue, ["_id", "issue_title", "issue_text", "created_by", "assigned_to", "status_text", "__v"]);
                    assert.equal(issue._id, savedID)
                    assert.isNotEmpty(issue.issue_title);
                    assert.isNotEmpty(issue.issue_text);
                    assert.isNotEmpty(issue.created_by);
                })
                done();
            });
    });
    // View issues on a project with multiple filters: GET request to /api/issues/{project}
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().get('/api/issues/apitest')
            .query({
                _id: savedID,
                issue_title: savedTitle
            })
            .end((err, res) => {
                assert.equal(res.status, 200, 'Response status should be 200');
                let issuesTable = res.body;
                issuesTable.forEach((issue) => {
                    // "_id":"675c961a16b084de487c0a0f","issue_title":"Title made by test","issue_text":"Text made by test","created_by":"Creator made by test","assigned_to":"","status_text":"","__v":0}
                    assert.hasAnyKeys(issue, ["_id", "issue_title", "issue_text", "created_by", "assigned_to", "status_text", "__v"]);
                    assert.equal(issue._id, savedID);
                    assert.equal(issue.issue_title, savedTitle)
                    assert.isNotEmpty(issue.issue_title);
                    assert.isNotEmpty(issue.issue_text);
                    assert.isNotEmpty(issue.created_by);
                })
                done();
            });
    });
    // Update one field on an issue: PUT request to /api/issues/{project}
    test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().put('/api/issues/apitest')
            .send({
                _id: savedID,
                issue_title: 'Title made by test - CORRECTED',
            })
            .end((err, res) => {
                // console.log('Log from test | res.body: ', res.body, ' | error: ', err)
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.equal(res.type, 'application/json', 'Response should be json');
                assert.equal(res.body.result, 'successfully updated')
                savedID = res.body._id;
                savedTitle = res.body.issue_title;
                done();
            });
    });
    // Update multiple fields on an issue: PUT request to /api/issues/{project}
    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().put('/api/issues/apitest')
            .send({
                _id: savedID,
                issue_title: 'Title made by test - CORRECTED',
                issue_text: 'Text made by test - CORRECTED',
                created_by: 'Creator made by test - CORRECTED',
                assigned_to: 'Assigner made by test  - CORRECTED',
                status_text: 'Status made by test - CORRECTED'
            })
            .end((err, res) => {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.equal(res.type, 'application/json', 'Response should be json');
                assert.equal(res.body.result, 'successfully updated')
                savedID = res.body._id;
                savedTitle = res.body.issue_title;
                done();
            });
    });
    // Update an issue with missing _id: PUT request to /api/issues/{project}
    test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().put('/api/issues/apitest')
            .send({
                _id: '',
                issue_title: 'Title made by test - CORRECTED',
                issue_text: 'Text made by test - CORRECTED',
                created_by: 'Creator made by test - CORRECTED',
                assigned_to: 'Assigner made by test  - CORRECTED',
                status_text: 'Status made by test - CORRECTED'
            })
            .end((err, res) => {
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });
    // Update an issue with no fields to update: PUT request to /api/issues/{project}
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().put('/api/issues/apitest')
            .send({
                _id: savedID,
                issue_title: '',
                issue_text: '',
                created_by: '',
                assigned_to: '',
                status_text: ''
            })
            .end((err, res) => {
                // console.log(res)
                assert.equal(res.body.error, 'no update field(s) sent');
                assert.equal(res.body._id, savedID)
                done();
            });
    });
    // Update an issue with an invalid _id: PUT request to /api/issues/{project}
    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().put('/api/issues/apitest')
        .send({
            _id: '',
            issue_title: '',
            issue_text: '',
            created_by: '',
            assigned_to: '',
            status_text: ''
        })
        .end((err, res) => {
            // console.log(res)
            assert.equal(res.body.error, 'missing _id');
            done();
        });
    });
    // Delete an issue: DELETE request to /api/issues/{project}
    test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().delete('/api/issues/apitest')
            .send({ _id: savedID })
            .end((err, res) => {
                assert.equal(res.body.result, 'successfully deleted');
                done();
            })
    });
    // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().delete('/api/issues/apitest')
            .send({ _id: '123' })
            .end((err, res) => {
                assert.equal(res.body.error, 'could not delete');
                done();
            });
    });
    // Delete an issue with missing _id: DELETE request to /api/issues/{project}
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
        chai.request(server).keepOpen().delete('/api/issues/apitest')
            .send({ _id: '' })
            .end((err, res) => {
                assert.equal(res.body.error, 'missing _id');
                done();
            })
    });

});
