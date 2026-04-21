import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import useProject from '../../../hooks/useProject';
import { ProjectProvider } from '../../../contexts/projectContext';
import { addDoc, onSnapshot, updateDoc, doc} from 'firebase/firestore';


// Mock functions and database
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(() => 'projects'), // The name is irrelevant because the collection is itself mocked
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('../../../firebase/firebaseConfig', () => ({
  db: {},
}))

// Wrapper to provide context for the hook
const wrapper = ({ children }) => (
  <ProjectProvider>{children}</ProjectProvider>
);

describe('useProject', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  });

  test('loads projects from Firestore', async () => {
    // To mock snapshot listener, onle check for the callback on the change (in this case a project was added)
    // As docs contains a list of all projects, we can just check of that callback existed, and also if the projects state was updated with the mocked data
    onSnapshot.mockImplementation((ref, callback) => {
      callback({
        docs: [
          {
            id: '1',
            data: () => ({ title: 'Project A', description: 'Description A' }),
          },
        ],
      })
      return jest.fn()
    })

    const { result } = renderHook(() => useProject(), { wrapper });

    // Check for length
    await waitFor(() => {
      expect(result.current.projects).toHaveLength(1);
    });

    // Check for content
    expect(result.current.projects[0]).toEqual({
      id: '1',
      title: 'Project A',
      description: 'Description A',
    })
  })

  test('createProject calls addDoc', async () => {
    addDoc.mockResolvedValueOnce({ id: 'new-id'});

    const { result } = renderHook(() => useProject(), { wrapper });

    await act(async () => {
      await result.current.createProject({ title: 'New Project', description: 'New Description' });
    });

    expect(addDoc).toHaveBeenCalledWith(
      'projects',
      expect.objectContaining({ title: 'New Project', description: 'New Description' })
    )
  })

  test('updateProject with empty title throws error', async () => {
    const { result } = renderHook(() => useProject(), { wrapper });

    // When sending a project without title, it should throw an error
    await act(async () => {
      await expect(result.current.updateProject('1', { title: '   ', description: 'Description' })).rejects.toThrow('Project title cannot be empty');
    });
  })

  test('updateProject with valid project data calls updateDoc', async () => {
    const { result } = renderHook(() => useProject(), { wrapper })

    // sending valid project data, act allows waiting until state is finally updated
    await act(async () => {
      await result.current.updateProject('1', { title: ' Updated Title ', description: 'Updated Description' });
    })

    // Expecting that the database function was called with correct arguments (normalized)
    expect(updateDoc).toHaveBeenCalledWith(
      expect(doc).toHaveBeenCalledWith({}, 'projects', '1'),
      { title: 'Updated Title', description: 'Updated Description' }
    )
  })
})