import {filterFields, getParentsDot} from "./utils";

const fields = [
    'loggedAt',
    'reviewedAt',
    'parents',
    'parents.firstName',
    'parents.surname',
    'parents.user.email',
    'parents.contactPreferencesEmail',
    'parents.mobilePhone',
    'parents.contactPreferencesSms',
    'parents.nationality',
    'parents.gender',
    'parents.dateOfBirth',
    'parents.birthCountry',
    'parents.blueCard.number',
    'parents.blueCard.type',
    'parents.blueCard.expiryDate',
    'parents.blueCard.status',
    'parents.blueCard.registered',
    'parents.blueCard.notes',
    'contact.phones',
    'contact.address',
    'contact.address.fullAddress',
    'contact.address.lat',
    'contact.address.lng',
    'contact.address.placeId',
    'contact.address.unit',
    'contact.address.number',
    'contact.address.street',
    'contact.address.suburb',
    'contact.address.city',
    'contact.address.state',
    'contact.address.zip',
    'contact.address.country',
    'contact.address.id',
    'contact.id',
    'children.firstName',
    'children.surname',
    'children.gender',
    'children.dateOfBirth',
    'children.nationality',
    'children.schoolName',
    'children.blueCard.number',
    'children.blueCard.type',
    'children.blueCard.expiryDate',
    'children.blueCard.status',
    'children.blueCard.registered',
    'children.blueCard.notes',
    'children.blueCard.id',
    'children.id',
    'guests.firstName',
    'guests.surname',
    'guests.gender',
    'guests.dateOfBirth',
    'guests.nationality',
    'guests.relationship',
    'guests.blueCard.number',
    'guests.blueCard.type',
    'guests.blueCard.expiryDate',
    'guests.blueCard.status',
    'guests.blueCard.registered',
    'guests.blueCard.notes',
    'guests.blueCard.id',
    'guests.id',
    'pets.type',
    'pets.status',
    'pets.id',
    'bedrooms.beds',
    'bedrooms.desk',
    'bedrooms.clothesStorage',
    'bedrooms.ensuite',
    'bedrooms.id',
    'bank.name',
    'bank.account',
    'bank.bsb',
    'bank.number',
    'bank.id',
    'office.familyStatus',
    'office.familySubStatus',
    'office.familyScore',
    'office.homeScore',
    'office.files.id',
    'office.files.category',
    'office.files.width',
    'office.files.Height',
    'office.files.type',
    'office.files.size',
    'office.id',
    'notes',
    'availability.from',
    'availability.to',
    'availability.reason',
    'availability.id',
    'inspections.date',
    'inspections.staff.firstName',
    'inspections.staff.surname',
    'inspections.staff.user.email',
    'inspections.staff.user.id',
    'inspections.staff.id',
    'inspections.familyStatus'
]
describe('util ', () => {
    test("filterFields", () => {
        let filtered = filterFields(fields, ['parents'])
        expect(filtered.length).toBe(fields.length - 16)
        filtered = filterFields(fields, ['parents', 'inspections'])
        expect(filtered.length).toBe(fields.length - 23)
        filtered = filterFields(fields, ['parents', 'inspections', 'availability.reason'])
        expect(filtered.length).toBe(fields.length - 24)
        filtered = filterFields(fields, ['parents', 'inspections', 'availability.reason', 'guests.blueCard'])
        expect(filtered.length).toBe(fields.length - 31)
    })
    test("getParentsDot", () => {
        let parents=getParentsDot(fields)
        expect(parents).toMatchObject([ 'loggedAt',
            'reviewedAt',
            'parents',
            'contact',
            'children',
            'guests',
            'pets',
            'bedrooms',
            'bank',
            'office',
            'notes',
            'availability',
            'inspections' ])
    })

})