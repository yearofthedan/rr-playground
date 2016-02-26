'use strict';

let request = require('supertest-as-promised');
const sample = require('lodash').sample;
const instance_url = process.env.INSTANCE_URL;
let app;

let hasNewMember = (res) => {
    if (!('newMember' in res.body)) {
        throw new Error('missing created member');
    }
};

let getBranchKey = () => {
    return request(app)
            .get('/branches')
            .then((response) => {
                return sample(response.body.branches).key;
            });
};

let makeMember = (branchKey) => {
    return {
        'contactFirstName': 'Jaime',
        'contactLastName': 'Garzon',
        'schoolType': 'Primary',
        'branch': branchKey,
        'firstName': 'Sherlock',
        'lastName': 'Holmes',
        'email': 'sherlock@holmes.co.uk',
        'dateOfBirth': '01/01/1983',
        'primaryPhoneNumber': '0396291146',
        'secondaryPhoneNumber': null,
        'gender': 'horse radish',
        'residentialAddress': {
            'address': '222b Baker St',
            'suburb': 'London',
            'country': 'England',
            'state': 'VIC',
            'postcode': '1234'
        },
        'postalAddress': {
            'address': '303 collins st',
            'suburb': 'melbourne',
            'country': 'australia',
            'state': 'VIC',
            'postcode': '3000'
        },
        'membershipType': 'full'
    };
};

describe('MemberIntegrationTests', () => {

    beforeEach(() => {
        app = instance_url ? instance_url : require('../../../src/backend/app');
    });

    describe('Creating new member', () => {
        it('should return 200 and a created member when the input is valid', (done) => {
            getBranchKey()
            .then((branchKey) => {
                return request(app)
                .post('/members')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(makeMember(branchKey))
                .expect(200)
                .expect(hasNewMember)
                .then(done, done.fail);
            });
        });

        xit('should return 400 if the input is not valid', (done) => {

        });
    });
});
