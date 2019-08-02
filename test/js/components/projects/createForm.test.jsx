import { fireEvent, wait, waitForElement } from '@testing-library/react';
import React from 'react';
import { StaticRouter } from 'react-router-dom';

import ProjectForm from '@/components/projects/createForm';
import { createObject } from '@/store/actions';
import { addError } from '@/store/errors/actions';
import routes from '@/utils/routes';

import { renderWithRedux, storeWithThunk } from './../../utils';

jest.mock('@/store/actions');
jest.mock('@/store/errors/actions');

createObject.mockReturnValue(() =>
  Promise.resolve({ type: 'TEST', payload: {} }),
);
addError.mockReturnValue({ type: 'TEST' });

afterEach(() => {
  createObject.mockClear();
  addError.mockClear();
});

const defaultProduct = {
  id: 'p1',
  name: 'Product 1',
  slug: 'product-1',
  old_slugs: [],
  description: 'This is a test product.',
  repo_url: 'https://www.github.com/test/test-repo',
};

describe('<ProjectForm/>', () => {
  const setup = options => {
    const defaults = {
      product: defaultProduct,
      startOpen: true,
    };
    const opts = Object.assign({}, defaults, options);
    const { product, startOpen } = opts;
    const context = {};
    const { getByText, getByLabelText, queryByText } = renderWithRedux(
      <StaticRouter context={context}>
        <ProjectForm product={product} startOpen={startOpen} />
      </StaticRouter>,
      {},
      storeWithThunk,
    );
    return { getByText, getByLabelText, queryByText, context };
  };

  describe('submit/close buttons', () => {
    test('toggle form open/closed', () => {
      const { getByText, queryByText } = setup({ startOpen: undefined });

      expect(queryByText('Close Form')).toBeNull();

      fireEvent.click(getByText('Create a Project'));

      expect(getByText('Close Form')).toBeVisible();
      expect(getByText('Create Project')).toBeVisible();
      expect(queryByText('Create a Project')).toBeNull();

      fireEvent.click(getByText('Close Form'));

      expect(queryByText('Close Form')).toBeNull();
      expect(getByText('Create a Project')).toBeVisible();
    });
  });

  describe('form submit', () => {
    test('creates a new project', () => {
      const { getByText, getByLabelText } = setup();
      const submit = getByText('Create Project');
      const nameInput = getByLabelText('*Project Name');
      const descriptionInput = getByLabelText('Description');
      fireEvent.change(nameInput, { target: { value: 'Name of Project' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is the description' },
      });
      fireEvent.click(submit);

      expect(createObject).toHaveBeenCalledWith({
        objectType: 'project',
        data: {
          name: 'Name of Project',
          description: 'This is the description',
          product: 'p1',
        },
      });
    });

    describe('success', () => {
      test('redirects to project detail', async () => {
        createObject.mockReturnValueOnce(() =>
          Promise.resolve({
            type: 'CREATE_OBJECT_SUCCEEDED',
            payload: {
              objectType: 'project',
              object: {
                id: 'project1',
                slug: 'name-of-project',
                name: 'Name of Project',
                product: 'p1',
              },
            },
          }),
        );
        const { getByText, getByLabelText, context } = setup();
        const submit = getByText('Create Project');
        const nameInput = getByLabelText('*Project Name');
        fireEvent.change(nameInput, { target: { value: 'Name of Project' } });
        fireEvent.click(submit);

        expect.assertions(2);
        await createObject;

        expect(context.action).toEqual('PUSH');
        expect(context.url).toEqual(
          routes.project_detail('product-1', 'name-of-project'),
        );
      });
    });

    describe('error', () => {
      test('displays inline field errors', async () => {
        createObject.mockReturnValueOnce(() =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            body: {
              name: ['Do not do that'],
              description: ['Or that'],
              other: ['What is happening'],
            },
          }),
        );
        const { getByText, getByLabelText, queryByText } = setup();
        const submit = getByText('Create Project');
        const nameInput = getByLabelText('*Project Name');
        fireEvent.change(nameInput, { target: { value: 'Name of Project' } });
        fireEvent.click(submit);

        expect.assertions(3);
        await waitForElement(() => getByText('Do not do that'));

        expect(getByText('Do not do that')).toBeVisible();
        expect(getByText('Or that')).toBeVisible();
        expect(queryByText('What is happening')).toBeNull();
      });

      test('calls addError with non-form errors on 400', async () => {
        createObject.mockReturnValueOnce(() =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            body: 'Nope',
            response: {
              status: 400,
            },
            message: 'This is an error.',
          }),
        );
        const { getByText, getByLabelText } = setup();
        const submit = getByText('Create Project');
        const nameInput = getByLabelText('*Project Name');
        fireEvent.change(nameInput, { target: { value: 'Name of Project' } });
        fireEvent.click(submit);

        expect.assertions(1);
        await wait(() => {
          if (!addError.mock.calls.length) {
            throw new Error('waiting...');
          }
        });

        expect(addError).toHaveBeenCalledWith('This is an error.');
      });
    });

    test('does not call addError on non-400', async () => {
      createObject.mockReturnValueOnce(() =>
        // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject({
          response: {
            status: 500,
          },
        }),
      );
      const { getByText, getByLabelText } = setup();
      const submit = getByText('Create Project');
      const nameInput = getByLabelText('*Project Name');
      fireEvent.change(nameInput, { target: { value: 'Name of Project' } });
      fireEvent.click(submit);

      expect.assertions(1);
      await createObject;

      expect(addError).not.toHaveBeenCalled();
    });
  });
});
