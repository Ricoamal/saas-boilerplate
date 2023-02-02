import { times } from 'ramda';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import { Documents } from '../documents.component';
import { documentFactory, fillDocumentsListQuery } from '../../../mocks/factories';
import { render } from '../../../tests/utils/rendering';

const generateRelayEnvironmentDocuments = (documents: any) => {
  return createMockEnvironment();
};

describe('Documents: Component', () => {
  const Component = () => <Documents />;

  it('should render list of documents', async () => {
    const env = createMockEnvironment();
    const documentsLength = 3;
    const generatedDocs = times(() => documentFactory(), documentsLength);

    const mockRequest = fillDocumentsListQuery(env, generatedDocs);
    render(<Component />, { apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest) });

    expect(await screen.findAllByRole('link')).toHaveLength(documentsLength);
    expect(screen.getAllByRole('listitem')).toHaveLength(documentsLength);
  });

  it('should render empty state', async () => {
    const mockRequest = fillDocumentsListQuery(undefined, []);

    render(<Component />, { apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest) });

    expect(await screen.findByText('No documents')).toBeInTheDocument();
  });

  // TODO: documentsListCreateMutation have to be migrated to apollo
  it.skip('should add new item to the list', async () => {
    const generatedDoc = documentFactory();
    const relayEnvironment = generateRelayEnvironmentDocuments([generatedDoc]);

    const mockRequest = fillDocumentsListQuery(relayEnvironment, [generatedDoc]);

    render(<Component />, { apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest) });

    const file = new File(['content'], 'file.png', { type: 'image/png' });
    fireEvent.change(await screen.findByTestId('file-input'), {
      target: { files: [file] },
    });

    await waitFor(() => {
      relayEnvironment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          DocumentDemoItemType: (context, generateId) => ({
            ...documentFactory({ file: { name: file.name } }),
            id: `${generateId()}`,
          }),
        })
      );
    });

    expect(screen.getByText(file.name)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

// TODO: documentsDeleteMutation have to be migrated to apollo
  it.skip('should remove new item from the list', async () => {
    const document = documentFactory();
    const relayEnvironment = generateRelayEnvironmentDocuments([document]);
    const mockRequest = fillDocumentsListQuery([document]);
    render(<Component />, { relayEnvironment, apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest) });

    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

    act(() => {
      relayEnvironment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          DeleteDocumentDemoItemMutationPayload: () => ({ deletedIds: [document.id] }),
        })
      );
    });

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});