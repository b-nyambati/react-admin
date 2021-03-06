import { render, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import expect from 'expect';
import { TestContext } from 'ra-core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import SaveButton from './SaveButton';

const theme = createMuiTheme();

const invalidButtonDomProps = {
    basePath: '',
    handleSubmit: jest.fn(),
    handleSubmitWithRedirect: jest.fn(),
    invalid: false,
    onSave: jest.fn(),
    pristine: false,
    record: { id: 123, foo: 'bar' },
    redirect: 'list',
    resource: 'posts',
    saving: false,
    submitOnEnter: true,
    undoable: false,
};

describe('<SaveButton />', () => {
    afterEach(cleanup);

    it('should render as submit type with no DOM errors', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { getByLabelText } = render(
            <TestContext>
                <ThemeProvider theme={theme}>
                    <SaveButton {...invalidButtonDomProps} />
                </ThemeProvider>
            </TestContext>
        );

        expect(spy).not.toHaveBeenCalled();
        expect(getByLabelText('ra.action.save').getAttribute('type')).toEqual(
            'submit'
        );

        spy.mockRestore();
    });

    it('should render as submit type when submitOnEnter is true', () => {
        const { getByLabelText } = render(
            <TestContext>
                <SaveButton submitOnEnter />
            </TestContext>
        );
        expect(getByLabelText('ra.action.save').getAttribute('type')).toEqual(
            'submit'
        );
    });

    it('should render as button type when submitOnEnter is false', () => {
        const { getByLabelText } = render(
            <TestContext>
                <SaveButton submitOnEnter={false} />
            </TestContext>
        );

        expect(getByLabelText('ra.action.save').getAttribute('type')).toEqual(
            'button'
        );
    });

    it('should trigger submit action when clicked if no saving is in progress', () => {
        const onSubmit = jest.fn();
        const { getByLabelText } = render(
            <TestContext>
                <SaveButton
                    handleSubmitWithRedirect={onSubmit}
                    saving={false}
                />
            </TestContext>
        );

        fireEvent.click(getByLabelText('ra.action.save'));
        expect(onSubmit).toHaveBeenCalled();
    });

    it('should not trigger submit action when clicked if saving is in progress', () => {
        const onSubmit = jest.fn();

        const { getByLabelText } = render(
            <TestContext>
                <SaveButton handleSubmitWithRedirect={onSubmit} saving />
            </TestContext>
        );

        fireEvent.click(getByLabelText('ra.action.save'));
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show a notification if the form is not valid', () => {
        const onSubmit = jest.fn();
        let dispatchSpy;

        const { getByLabelText } = render(
            <TestContext>
                {({ store }) => {
                    dispatchSpy = jest.spyOn(store, 'dispatch');
                    return (
                        <SaveButton
                            handleSubmitWithRedirect={onSubmit}
                            invalid
                        />
                    );
                }}
            </TestContext>
        );

        fireEvent.click(getByLabelText('ra.action.save'));
        expect(dispatchSpy).toHaveBeenCalledWith({
            payload: {
                message: 'ra.message.invalid_form',
                messageArgs: {},
                type: 'warning',
                undoable: false,
            },
            type: 'RA/SHOW_NOTIFICATION',
        });
        expect(onSubmit).toHaveBeenCalled();
    });
});
