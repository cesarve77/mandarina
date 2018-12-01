import 'jsdom-global/register'
import {Table} from 'mandarina'
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AutoForm from 'uniforms-antd/AutoForm'
import * as React from "react";
import {Bridge} from "./Bridge";


Enzyme.configure({adapter: new Adapter()});

// @ts-ignore
const cardSchema = new Table({
    number: {
        type: Number,
        description: 'number',
        label: 'number',
        validators: ['required', {'isAllowed': [0, 1, 2, 3, 4, 5]}]
    }
}, {name: 'Card'})

const userSchema = new Table({
    name: {
        type: String,
        description: 'name',
        label: 'name',
        validators: ['required'],
    },
    cards: {
        type: ['Card'],
        description: 'card on user',
        label: 'card on user',
        validators: ['required']
    }
}, {name: 'User',})






describe('Form', () => {
    test("CreateForm", () => {
        mount(<AutoForm schema={new Bridge(userSchema)}/>        )
    })
})