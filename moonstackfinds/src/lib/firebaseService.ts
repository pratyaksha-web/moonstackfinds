import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { Product, Category, BlogPost, Subcategory } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_BLOGS } from '../data';

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
  errorCode?: string;
  errorMessage?: string;
  operationType: OperationType;
  path: string | null;
  documentData?: any;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, data?: any) {
  let firebaseCode = '';
  let firebaseMessage = '';
  if (error && typeof error === 'object') {
    if ('code' in error) firebaseCode = String((error as any).code);
    if ('message' in error) firebaseMessage = String((error as any).message);
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    errorCode: firebaseCode || 'unknown-code',
    errorMessage: firebaseMessage || (error instanceof Error ? error.message : String(error)),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
    documentData: data
  };
  
  // Format beautifully for console as requested
  console.error('[Firestore Error Diagnostic Audit]');
  console.error(`- Operation: ${operationType}`);
  console.error(`- Target Path / Collection: ${path}`);
  console.error(`- Firebase Code: ${errInfo.errorCode}`);
  console.error(`- Firebase Message: ${errInfo.errorMessage}`);
  if (data) {
    console.error('- Document Data Saved:', JSON.stringify(data, null, 2));
  }
  console.error('Full Error Payload: ', JSON.stringify(errInfo));
  
  throw new Error(JSON.stringify(errInfo));
}

// Upload file to Firebase Storage
export async function uploadImage(file: File, folder: string): Promise<string> {
  const path = `${folder}/${Date.now()}_${file.name}`;
  try {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage upload failed, falling back to local Base64:', error);
    // Fallback: Read file as Base64 so the UI continues working normally even if Storage isn't activated yet
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

// Core database service operations
export const firebaseService = {
  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const path = 'categories';
    try {
      const snapshot = await getDocs(collection(db, path));
      const list: Category[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Category);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveCategory(category: Category): Promise<void> {
    const path = `categories/${category.id}`;
    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path, category);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Subcategories ---
  async getSubcategories(): Promise<Subcategory[]> {
    const path = 'subcategories';
    try {
      const snapshot = await getDocs(collection(db, path));
      const list: Subcategory[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Subcategory);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveSubcategory(sub: Subcategory): Promise<void> {
    const path = `subcategories/${sub.id}`;
    try {
      await setDoc(doc(db, 'subcategories', sub.id), sub);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path, sub);
    }
  },

  async deleteSubcategory(id: string): Promise<void> {
    const path = `subcategories/${id}`;
    try {
      await deleteDoc(doc(db, 'subcategories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const snapshot = await getDocs(collection(db, path));
      const list: Product[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({ 
          id: doc.id, 
          ...data,
          tags: data.tags || []
        } as Product);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveProduct(product: Product): Promise<void> {
    const path = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path, product);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Blogs ---
  async getBlogs(): Promise<BlogPost[]> {
    const path = 'blogs';
    try {
      const snapshot = await getDocs(collection(db, path));
      const list: BlogPost[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({ 
          id: doc.id, 
          ...data,
          tags: data.tags || [],
          images: data.images || [],
          affiliateLinks: data.affiliateLinks || [],
          pinterestImages: data.pinterestImages || []
        } as BlogPost);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveBlog(blog: BlogPost): Promise<void> {
    const path = `blogs/${blog.id}`;
    try {
      await setDoc(doc(db, 'blogs', blog.id), blog);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path, blog);
    }
  },

  async deleteBlog(id: string): Promise<void> {
    const path = `blogs/${id}`;
    try {
      await deleteDoc(doc(db, 'blogs', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Seeder ---
  async ensureSeedData(): Promise<{
    categories: Category[];
    subcategories: Subcategory[];
    products: Product[];
    blogs: BlogPost[];
  }> {
    try {
      // 1. Fetch from Firestore (all reads are permitted publically)
      const fetchedCats = await this.getCategories();
      const fetchedSubs = await this.getSubcategories();
      const fetchedProds = await this.getProducts();
      const fetchedBlogs = await this.getBlogs();

      const user = auth.currentUser;
      const isAdminUser = user && user.email && user.email.toLowerCase() === 'workly244@gmail.com';

      if (isAdminUser) {
        let activeCats = fetchedCats;
        if (fetchedCats.length === 0) {
          console.log('Seeding categories to Firestore...');
          activeCats = INITIAL_CATEGORIES;
          for (const cat of INITIAL_CATEGORIES) {
            await this.saveCategory(cat);
          }
        }

        let activeSubs = fetchedSubs;
        if (fetchedSubs.length === 0) {
          console.log('Seeding initial subcategories matching requirements...');
          const initialSubDefs: Subcategory[] = [
            // Books
            { id: 'sub-books-romance', categoryId: 'books', name: 'Romance' },
            { id: 'sub-books-thriller', categoryId: 'books', name: 'Thriller' },
            { id: 'sub-books-fantasy', categoryId: 'books', name: 'Fantasy' },
            { id: 'sub-books-historical-fiction', categoryId: 'books', name: 'Historical Fiction' },
            { id: 'sub-books-mythology', categoryId: 'books', name: 'Mythology' },
            { id: 'sub-books-self-help', categoryId: 'books', name: 'Self Help' },
            // Fashion
            { id: 'sub-fashion-outfits', categoryId: 'fashion', name: 'Outfit Ideas' },
            { id: 'sub-fashion-dresses', categoryId: 'fashion', name: 'Dresses' },
            { id: 'sub-fashion-shoes', categoryId: 'fashion', name: 'Shoes' },
            { id: 'sub-fashion-bags', categoryId: 'fashion', name: 'Bags' },
            { id: 'sub-fashion-accessories', categoryId: 'fashion', name: 'Accessories' },
            // Home Decor
            { id: 'sub-decor-bedroom', categoryId: 'home-decor', name: 'Bedroom' },
            { id: 'sub-decor-living-room', categoryId: 'home-decor', name: 'Living Room' },
            { id: 'sub-decor-desk', categoryId: 'home-decor', name: 'Desk Setup' },
            { id: 'sub-decor-lighting', categoryId: 'home-decor', name: 'Lighting' },
            // Tech Finds
            { id: 'sub-tech-productivity', categoryId: 'tech-finds', name: 'Productivity' },
            { id: 'sub-tech-accessories', categoryId: 'tech-finds', name: 'Accessories' },
            { id: 'sub-tech-gadgets', categoryId: 'tech-finds', name: 'Gadgets' }
          ];

          activeSubs = initialSubDefs;
          for (const sub of initialSubDefs) {
            await this.saveSubcategory(sub);
          }
        }

        let activeProds = fetchedProds;
        if (fetchedProds.length === 0) {
          console.log('Seeding products to Firestore...');
          activeProds = INITIAL_PRODUCTS.map((p, idx) => {
            let catRef = p.category.toLowerCase().replace(/\s+/g, '-');
            if (catRef === 'kitchen-finds' || catRef === 'gift-guides' || catRef === 'travel-essentials' || catRef === 'amazon-favorites') {
              // keep as-is
            } else if (catRef === 'desk-setup') {
              catRef = 'desk-setup';
            } else if (catRef === 'home-decor') {
              catRef = 'home-decor';
            }
            
            return {
              ...p,
              category: catRef,
              subcategory: p.subcategory || 'Uncategorized',
              tags: idx % 2 === 0 ? ['cozy', 'essential'] : ['aesthetic']
            };
          });

          for (const prod of activeProds) {
            await this.saveProduct(prod);
          }
        }

        let activeBlogs = fetchedBlogs;
        if (fetchedBlogs.length === 0) {
          console.log('Seeding blogs to Firestore...');
          activeBlogs = INITIAL_BLOGS.map(b => ({
            ...b,
            images: [],
            affiliateLinks: [],
            pinterestImages: []
          }));
          for (const blog of activeBlogs) {
            await this.saveBlog(blog);
          }
        }

        return {
          categories: activeCats,
          subcategories: activeSubs,
          products: activeProds,
          blogs: activeBlogs
        };
      }

      // If not admin, provide the retrieved DB items, blending with static configs if any table is empty
      return {
        categories: fetchedCats.length > 0 ? fetchedCats : INITIAL_CATEGORIES,
        subcategories: fetchedSubs.length > 0 ? fetchedSubs : [],
        products: fetchedProds.length > 0 ? fetchedProds : INITIAL_PRODUCTS.map(p => ({ ...p, tags: [] })),
        blogs: fetchedBlogs.length > 0 ? fetchedBlogs : INITIAL_BLOGS
      };
    } catch (e) {
      console.error('Error ensuring database data seeding: ', e);
      // Fallback
      return {
        categories: INITIAL_CATEGORIES,
        subcategories: [],
        products: INITIAL_PRODUCTS.map(p => ({ ...p, tags: [] })),
        blogs: INITIAL_BLOGS
      };
    }
  }
};
