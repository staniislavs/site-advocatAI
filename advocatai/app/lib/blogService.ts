import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface Post {
  id?: string;
  title: string;
  content: string;
  contentType?: 'markdown' | 'html';
  excerpt: string;
  coverImage: string;
  author: string;
  createdAt: any;
  updatedAt?: any;
  tags: string[];
  category: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  faq?: { question: string; answer: string }[];
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import { 
  Gavel, 
  Home, 
  Coins, 
  Users, 
  Building2, 
  Baby, 
  Key,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const BLOG_CATEGORIES = [
  { id: 'rozluchennya', icon: Gavel },
  { id: 'podil-mayna', icon: Home },
  { id: 'alimony', icon: Coins },
  { id: 'opika', icon: Users },
  { id: 'spadkuvannya', icon: FileText },
  { id: 'nasylstvo', icon: AlertTriangle },
  { id: 'zhytlovi-spory', icon: Building2 },
  { id: 'usynovlennya', icon: Baby },
  { id: 'pravo-vlasnosti', icon: Key },
  { id: 'general', icon: FileText }
] as const;

export const BLOG_CATEGORY_IDS = BLOG_CATEGORIES.map(c => c.id);

export type BlogCategoryId = typeof BLOG_CATEGORY_IDS[number];

export const getCategoryLabel = (catId: string, t: any) => {
  if (!catId) return '';
  if (BLOG_CATEGORY_IDS.includes(catId as any)) {
    return t(`blog.categories.items.${catId}`);
  }
  // Unified mapping for legacy or manually entered categories
  if (catId === 'Загальне' || catId === 'Загальні теми' || catId === 'general') {
    return t('blog.categories.items.general');
  }
  if (catId === 'Шлюб і розлучення' || catId === 'rozluchennya') {
    return t('blog.categories.items.rozluchennya');
  }
  return catId;
};

const COLLECTION_NAME = 'articles';

export const getPosts = async (onlyPublished = true) => {
  try {
    let q;
    if (onlyPublished) {
      q = query(
        collection(db, COLLECTION_NAME), 
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, COLLECTION_NAME), 
        orderBy('createdAt', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
      } as Post;
    });
  } catch (error: any) {
    if (error.message && error.message.includes('offline')) {
      console.warn('Blog Service: Client is offline.');
    } else {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
    return [];
  }
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const updatePost = async (id: string, post: Partial<Post>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const { id: _, ...updateData } = post as any;
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};

export const deletePost = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};
