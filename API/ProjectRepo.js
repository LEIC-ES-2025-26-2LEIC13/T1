import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function addProject(title, description) {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      title,
      description,
    });
    console.log('Project created with ID:', docRef.id);
  } catch (error) {
    console.error('Error adding project:', error);
  }
}