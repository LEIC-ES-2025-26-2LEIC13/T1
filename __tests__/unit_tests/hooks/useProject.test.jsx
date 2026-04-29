import { renderHook } from '@testing-library/react-native';
import { useProject } from '../../../hooks/useProject';
import { ProjectProvider } from '../../../contexts/projectContext';

// Jest is mocking the database interactions and the db itself
jest.mock('firebase/firestore', () => ({
    // All functions used from the database are mocked
    addDoc: jest.fn(),
    collection: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    onSnapshot: jest.fn((collectionRef, callback) => {
        callback({ docs: [] });
        return jest.fn();
    }),
    updateDoc: jest.fn(),
}));

jest.mock('../../firebase/firebaseConfig', () => ({
    db: {},
}));

describe("useProject", () => {
    test("Get context values", () => {
        const wrapper = ({ children }) => (
            <ProjectProvider>
                {children}
            </ProjectProvider>
        );
        const { result } = renderHook(() => useProject(), { wrapper });

        // Creates an array of projects
        expect(Array.isArray(result.current.projects)).toBe(true)
        expect(typeof result.current.createProject).toBe('function')
        expect(typeof result.current.deleteProject).toBe('function')
        expect(typeof result.current.updateProject).toBe('function')
    })

    test("Hook used outside ProjectProvider", () => {
        expect(() => {
            renderHook(() => useProject())
        }).toThrow("useProject must be used within a ProjectProvider")
    })
})